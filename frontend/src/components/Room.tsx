import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import useWebSocket from "react-use-websocket";
import {Chat, ChatType, chatTypes, getFriendlyName, Message, Role, User} from "../Message";
// @ts-ignore
import {Cell, Grid} from "styled-css-grid";
import styled from "styled-components";
import {Button, IconButton, MenuItem, Select, TextField} from "@material-ui/core";
import {RoleView} from "./RoleView"
import AddIcon from '@material-ui/icons/Add';
import SendIcon from "@material-ui/icons/Send";
import {Send} from "@material-ui/icons";

const ChatBox = styled.div`
  border: 3px solid red;
  height: 190px;
  width: 100%;
  text-align: left;
  overflow-y: auto;
  padding: 0.5rem;
`;

const Box = styled.div`
  border: 3px solid red;
  height: 100%;
  width: 100%;
`;

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PaddedContainer = styled.div`
  padding: 0.5rem;
  overflow-y: auto;
`;

const ChatMessage: React.FunctionComponent<{ chat: Chat }> = (props) => {
    if (!props.chat || !props.chat.type)
        return <></>
    const userName = props.chat.type == ChatType.ANON ? "Anonymous" : props.chat.name
    return <>
        [{getFriendlyName(props.chat.type)}] <b>{userName}:</b> {props.chat.msg}<br/>
    </>
}

// Returns an edited version of an array
// Edits (or appends) a value at an index, or deletes an element if newVal is null
function edit<T>(array: Array<T>, index: number, newVal: T | null): Array<T> {
    const newArray = [...array]
    if (!newVal) {
        newArray.splice(index)
    } else {
        newArray[index] = newVal
    }
    return newArray
}

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

    useEffect(() => {
        if (lastJsonMessage) {
            console.log(JSON.stringify(lastJsonMessage))
            const message = lastJsonMessage as Message

            if (message.chat) {
                setChatMessages([...chatMessages, message.chat])
            } else if (message.roles) {
                setRoles(message.roles)
            } else if (message.roleDelta) {
                setRoles(edit(roles, message.roleDelta.index, message.roleDelta.edit))
            } else if (message.users) {
                setUsers(message.users)
            } else if (message.userDelta) {
                setUsers(edit(users, message.userDelta.index, message.userDelta.edit))
            }

        }
    }, [lastJsonMessage])
    console.log("roles -> " + JSON.stringify(roles))
    return <>
        <h1>Room: {roomCode}</h1>
        <PageContainer>
            <Grid
                columns={"repeat(2, 800px)"}
                rows={"repeat(2, 400px)"}
                areas={[
                    "role   userlist",
                    "chat   chat"
                ]}>
                <Cell area="role">
                    <Box>
                        <PaddedContainer>
                            {roles.map((role, i) => <RoleView key={i} role={role} onChange={newRole => {
                                // if (newRole)
                                //     roles[i] = newRole
                                // else //remove if null
                                //     roles.splice(i)
                                // setRoles(roles)
                                const msg: Message = {
                                    roleDelta: {
                                        index: i,
                                        edit: newRole
                                    }
                                }
                                sendJsonMessage(msg)
                            }}/>)}

                            <Button startIcon={<AddIcon/>} onClick={() => {
                                const newRole: Role = {
                                    name: "",
                                    team: "",
                                    quantity: 1
                                }
                                //setRoles([...roles, newRole]) // snappy UI by rendering change immediately
                                // but also inform the server
                                // (will cause another render when the server responds)
                                const msg: Message = {
                                    roleDelta: {
                                        index: roles.length,
                                        edit: newRole
                                    }
                                }
                                sendJsonMessage(msg)
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
                        </PaddedContainer>
                    </Box>
                </Cell>
                <Cell area="userlist">
                    <Box>
                        Users
                    </Box>
                </Cell>
                <Cell area="chat">
                    <Grid
                        columns={"8ch 1fr"}
                        rows={"1fr auto"}
                        areas={[
                            "history   history",
                            "role      message"
                        ]}>
                        <Cell area="history">
                            <ChatBox>
                                {chatMessages.map((chat) => <ChatMessage chat={chat}/>)}
                            </ChatBox>
                        </Cell>
                        <Cell area="role">
                            <Select value={chatType} onChange={e => {
                                setChatType(e.target.value as ChatType)
                            }}>
                                {chatTypes.map(type =>
                                    <MenuItem value={type}>{getFriendlyName(type)}</MenuItem>
                                )}
                            </Select>
                        </Cell>
                        <Cell area="message">
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
    </>
}