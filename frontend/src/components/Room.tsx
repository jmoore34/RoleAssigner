import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import useWebSocket from "react-use-websocket";
import {Chat, ChatType, chatTypes, getFriendlyName, Message, Role, RoleAssignment, User} from "../Message";
// @ts-ignore
import {Cell, Grid} from "styled-css-grid";
import styled from "styled-components";
import {
    Avatar,
    Button, Dialog, DialogContent, DialogContentText, DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar, ListItemText,
    MenuItem,
    Select,
    TextField
} from "@material-ui/core";
import {RoleView} from "./RoleView"
import AddIcon from '@material-ui/icons/Add';
import SendIcon from "@material-ui/icons/Send";
import {AssignmentDialog} from "./AssignmentDialog";

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CustomCell = styled(Cell)<{ padded?: boolean, boxed?: boolean, scroll?: boolean }>`
  ${props => props.padded && "padding: 0.5rem;"}
  ${props => props.boxed && "border: 3px solid red;"}
  ${props => props.scroll && "overflow-y: auto;"}
  height: unset; // corrects a bug in library
`;

const ChatMessage: React.FunctionComponent<{ chat: Chat }> = (props) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const thisElement = ref.current
        thisElement?.scrollIntoView()
    }, [])

    if (!props.chat || !props.chat.type)
        return <></>
    const userName = props.chat.type == ChatType.ANON ? "Anonymous" : props.chat.name
    return <div ref={ref}>
        [{getFriendlyName(props.chat.type)}] <b>{userName}:</b> {props.chat.msg}<br/>
    </div>
}

// Returns an edited version of an array
// Edits (or appends) a value at an index, or deletes an element if newVal is null
function edit<T>(array: Array<T>, index: number, newVal: T | null): Array<T> {
    const newArray = [...array]
    if (!newVal) {
        newArray.splice(index, 1)
    } else {
        newArray[index] = newVal
    }
    return newArray
}

// Used to debounce changes to name
// So that name change API calls are only made when the user stops typing
var nameChangeTimeout: number | null = null

export const Room: React.FunctionComponent<{}> = (props) => {
    const {roomCode} = useParams<{ roomCode: string }>()
    const [socketUrl, setSocketUrl] = useState('')
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
    } = useWebSocket(`ws://127.0.0.1/${roomCode}`, {})
    const [chatType, setChatType] = useState<ChatType>(ChatType.PUBLIC)
    const [chatMessage, setChatMessage] = useState("")
    const [chatMessages, setChatMessages] = useState<Array<Chat>>([])
    const [roles, setRoles] = useState<Array<Role>>([])
    const [users, setUsers] = useState<Array<User>>([])
    const [isMod, setMod] = useState(false)
    const [name, setName] = useState("Unnamed User")

    const [assignedRole, setAssignedRole] = useState<RoleAssignment | null>(null)

    useEffect(() => {
        if (lastJsonMessage) {
            console.log(JSON.stringify(lastJsonMessage))
            const message = lastJsonMessage as Message

            if (message.chat) {
                setChatMessages([...chatMessages, message.chat])
            } else if (message.roles) {
                setRoles(message.roles)
            } else if (message.roleDelta) {
                // If there are any scheduled requests to update the role that we are receiving a change for, cancel them
                if (roles[message.roleDelta.index] && roles[message.roleDelta.index].updateRequestTimeout)
                    clearTimeout(roles[message.roleDelta.index].updateRequestTimeout as number)
                // Then overwrite our local copy with the version from the server
                setRoles(edit(roles, message.roleDelta.index, message.roleDelta.edit))
            } else if (message.users) {
                setUsers(message.users)
            } else if (message.userDelta) {
                setUsers(edit(users, message.userDelta.index, message.userDelta.edit))
            } else if (message.assignment) {
                setAssignedRole(message.assignment)
            }

        }
    }, [lastJsonMessage])
    console.log("roles -> " + JSON.stringify(roles))
    return <>
        <h1>Room: {roomCode}</h1>
        <PageContainer>
            <Grid
                columns={"repeat(2, minmax(450px, 450px))"}
                rows={"repeat(2, minmax(300px, 300px))"}
                areas={[
                    "role      userlist",
                    "history   history",
                    "message   message"
                ]}>
                <CustomCell area="role" padded boxed scroll>
                    {roles.map((role, i) => <RoleView key={i} role={role} onChange={editedRole => {
                        const msg: Message = {
                            roleDelta: {
                                index: i,
                                edit: editedRole
                            }
                        }
                        // Role deletion is synchronous, i.e. we don't make any client side changes until the server gets back to us.
                        // Name/team/quantity edits, however, are async: we make a local change immediately and queue a request to the server
                        // That way the user can finish typing before a message to the server is sent (to reduce traffic by not sending messages for every new character)
                        if (editedRole) {// non-deletion edit
                            // Clear any queued changes to this role -- they're now out of date
                            if (role.updateRequestTimeout)
                                clearTimeout(role.updateRequestTimeout)

                            // Don't send any api calls until the user has stopped typing for a bit
                            const timeout = window.setTimeout(() => {
                                sendJsonMessage(msg)
                                // Cleanup
                                role.updateRequestTimeout = null
                            }, 1000)

                            // Make the local-only change
                            const newRoles = [...roles]
                            newRoles[i] = editedRole
                            newRoles[i].updateRequestTimeout = timeout
                            setRoles(newRoles)
                        } else {
                            // Deletions are fully synchronous (not changed on the client first, must wait for authoritative server response)
                            // So send it immediately
                            sendJsonMessage(msg)
                        }

                    }}/>)}

                    <Button startIcon={<AddIcon/>} onClick={() => {
                        const newRole: Role = {
                            name: "",
                            team: "",
                            quantity: 1
                        }
                        const msg: Message = {
                            roleDelta: {
                                index: roles.length,
                                edit: newRole
                            }
                        }
                        sendJsonMessage(msg) // Role creation is done synchronously with the server, i.e. the server is authoratative and we don't make any client side changes until the server gets back to us
                    }}>
                        Add role
                    </Button>
                    <Button startIcon={<SendIcon/>} onClick={() => {
                        const msg: Message = {
                            chat: {
                                msg: "/assign"
                            }
                        }
                        sendJsonMessage(msg)
                    }}>
                        Assign roles to users
                    </Button>
                </CustomCell>
                <CustomCell area="userlist" padded boxed scroll>
                    <TextField
                        label="Your user name"
                        value={name}
                        onChange={e => {
                            setName(e.target.value)
                            const msg: Message = {
                                name: e.target.value
                            }
                            if (nameChangeTimeout) {
                                clearTimeout(nameChangeTimeout)
                            }
                            nameChangeTimeout = window.setTimeout(() => {
                                sendJsonMessage(msg)
                                // cleanup
                                nameChangeTimeout = null
                            }, 1000)
                        }}/>
                    <List>
                        {users.map((user) =>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        A
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={user.name}
                                              secondary={isMod ? "" : `${user.role} + " " + ${user.team}`}/>
                            </ListItem>
                        )}
                    </List>
                </CustomCell>
                <CustomCell area="history" padded boxed scroll>
                    {chatMessages.map((chat) => <ChatMessage chat={chat}/>)}
                </CustomCell>
                <Cell area="message">
                    <Grid columns={"8ch 1fr"}>
                        <Cell>
                            <Select value={chatType} onChange={e => {
                                setChatType(e.target.value as ChatType)
                            }}>
                                {chatTypes.map(type =>
                                    <MenuItem value={type}>{getFriendlyName(type)}</MenuItem>
                                )}
                            </Select>
                        </Cell>
                        <Cell>
                            <TextField fullWidth value={chatMessage}
                                       onChange={e => setChatMessage(e.target.value as string)}
                                       onKeyPress={e => {
                                           if (e.key === 'Enter' && chatMessage.length > 0) {
                                               const message: Message = {
                                                   chat: {
                                                       msg: chatMessage,
                                                       type: chatType
                                                   }
                                               }
                                               sendJsonMessage(message)
                                               setChatMessage("")
                                           }
                                       }}
                            />
                        </Cell>
                    </Grid>
                </Cell>
            </Grid>
        </PageContainer>


        {/*Dialogs*/}
        <AssignmentDialog assignment={assignedRole} onClose={() => setAssignedRole(null)}/>
    </>
}