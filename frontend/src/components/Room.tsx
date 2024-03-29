import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {Chat, ChatType, chatTypes, getFriendlyName, Message, Role, RoleAssignment, User} from "../Message";
// @ts-ignore
import {Cell, Grid} from "styled-css-grid";
import styled from "styled-components";
import {
    Avatar,
    Button,
    Checkbox,
    LinearProgress,
    Dialog,
    DialogTitle,
    FormControlLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    useMediaQuery
} from "@material-ui/core";
import {RoleView} from "./RoleView"
import AddIcon from '@material-ui/icons/Add';
import SendIcon from "@material-ui/icons/Send";
import {AssignmentDialog, getRoleAssignmentMessage} from "./AssignmentDialog";
import {PresetDialog} from "./PresetDialog";
import {Build} from "@material-ui/icons";

export const PageContainer = styled.div`
  width: 100vw;
  min-height: 100vh; // may need to be >100vh on mobile
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const CustomCell = styled(Cell)<{ padded?: boolean, boxed?: boolean, scroll?: boolean }>`
  ${props => props.padded && "padding: 0.5rem;"}
  ${props => props.boxed && "border: 3px solid red;"}
  ${props => props.scroll && "overflow-y: auto;"}
  overflow-wrap: break-word; // prevent expanding horizontally past the bounds of the container
  height: unset; // corrects a bug in library
`;

const SystemChatMessage = styled.div`
  color: red;
  font-style: italic;
`;

interface SystemMessage {
    msg: string;
}

const ChatMessage: React.FunctionComponent<{ chat: Chat }> = (props) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const thisElement = ref.current
        thisElement?.scrollIntoView()
    }, [])

    if (props.chat.type == ChatType.SYSTEM) {
        return <SystemChatMessage>
            {props.chat.msg}
        </SystemChatMessage>
    }

    if (!props.chat || !props.chat.type)
        return <></>
    const userName = props.chat.type == ChatType.ANON ? "Anonymous" : props.chat.name
    return <div ref={ref}>
        [{getFriendlyName(props.chat.type)}] {props.chat.team && `(${props.chat.team}) `}{props.chat.role && `(${props.chat.role}) `}<b>{userName}:</b> {props.chat.msg}<br/>
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

const welcomeMessage: Chat = {
    type: ChatType.SYSTEM,
    msg: "Welcome to the role assignment room! To invite others, share the URL."
}

export const Room: React.FunctionComponent<{}> = (props) => {
    const {roomCode} = useParams<{ roomCode: string }>()
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
    } = useWebSocket(`wss://roleassigner.herokuapp.com/${roomCode.toLowerCase()}`, {
        retryOnError: true,
        reconnectInterval: 4000,
        reconnectAttempts: 9
    })
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting to server...',
        [ReadyState.OPEN]: 'Connection established.',
        [ReadyState.CLOSING]: 'Closing...',
        [ReadyState.CLOSED]: 'Connection closed.',
        [ReadyState.UNINSTANTIATED]: 'Connection uninstantiated',
    }[readyState];
    const [chatType, setChatType] = useState<ChatType>(ChatType.PUBLIC)
    const [chatMessage, setChatMessage] = useState("")
    const [chatMessages, setChatMessages] = useState<Array<Chat>>([welcomeMessage])
    const [roles, setRoles] = useState<Array<Role>>([])
    const [users, setUsers] = useState<Array<User>>([])
    const [isMod, setMod] = useState(false)
    const [name, setName] = useState("Unnamed User")

    const [assignedRole, setAssignedRole] = useState<RoleAssignment | null>(null)

    const [presetDialogVisible, setPresetDialogVisible] = useState(false)

    const colWidth = 450
    const mobile = useMediaQuery(`(max-width:${2.25 * colWidth}px)`)

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
                const systemChatMessage: Chat = {
                    msg: getRoleAssignmentMessage(message.assignment),
                    type: ChatType.SYSTEM
                }
                setChatMessages([...chatMessages, systemChatMessage])
            }

        }
    }, [lastJsonMessage])
    console.log("roles -> " + JSON.stringify(roles))
    return <>
        <PageContainer>
            <Grid
                columns={mobile ? '1fr' : `repeat(2, ${colWidth}px)`}
                style={{margin: '1rem'}}
                rows={mobile ? "auto auto 300px auto" : "repeat(2, 300px) auto"}
                areas={mobile ? [
                    "role",
                    "userlist",
                    "history",
                    "message"
                ] : [
                    "role      userlist",
                    "history   history",
                    "message   message"
                ]}
            >
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
                    <Button startIcon={<Build/>} onClick={() => setPresetDialogVisible(true)}>
                        Use preset
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
                    <FormControlLabel control={
                        <Checkbox
                            checked={isMod}
                            onChange={e => {
                                setMod(e.target.checked)
                                const msg: Message = {
                                    mod: e.target.checked
                                }
                                sendJsonMessage(msg)
                            }}
                            inputProps={{'aria-label': 'primary checkbox'}}
                        />} label="Moderator opt-in"/>


                    <List>
                        {users.map((user) =>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar/>
                                </ListItemAvatar>
                                <ListItemText primary={user.name}
                                              secondary={user.mod ? "Moderator" : (isMod && `${user.role} ${user.team && `(${user.team})`}`)}/>
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
        <PresetDialog visible={presetDialogVisible} onSelect={preset => {
            if (preset) {
                const msg: Message = {
                    roles: preset.roles
                }
                sendJsonMessage(msg)
            }
            setPresetDialogVisible(false)
        }}/>

        {/*Dialog to cover screen when not connected*/}
        <Dialog disableBackdropClick
                disableEscapeKeyDown
                open={readyState !== ReadyState.OPEN}>

            <DialogTitle>{connectionStatus}</DialogTitle>
            {(readyState === ReadyState.CONNECTING || readyState === ReadyState.CLOSING) && <LinearProgress />}
        </Dialog>

    </>
}