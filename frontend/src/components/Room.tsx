import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import useWebSocket from "react-use-websocket";
import {Chat, ChatType, chatTypes, getFriendlyName, Message} from "../Message";
// @ts-ignore
import {Cell, Grid} from "styled-css-grid";
import styled from "styled-components";
import {MenuItem, Select, TextField} from "@material-ui/core";

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

const ChatMessage: React.FunctionComponent<{ chat: Chat }> = (props) => {
    if (!props.chat || !props.chat.type)
        return <></>
    const userName = props.chat.type == ChatType.ANON ? "Anonymous" : props.chat.name
    return <>
        [{getFriendlyName(props.chat.type)}] <b>{userName}:</b> {props.chat.msg}<br/>
    </>
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

    useEffect(() => {
        console.log(`RAW: ${lastMessage}`)
    }, [lastMessage])

    useEffect(() => {
        if (lastJsonMessage) {
            console.log(lastJsonMessage)
            const message = lastJsonMessage as Message

            if (message.chat) {
                console.log(`<${message.chat.type}> [${message.chat.name}] ${message.chat.msg}`)
                setChatMessages([...chatMessages, message.chat])
            }

        }
    }, [lastJsonMessage])

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
                        Role
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
                            <TextField fullWidth value={chatMessage} onChange={e => setChatMessage(e.target.value as string)}
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