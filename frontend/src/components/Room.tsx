import React, {FunctionComponent, useEffect, useState} from "react";
import {useParams} from "react-router";
import useWebSocket from "react-use-websocket";
import {Message} from "../Message";

export const Room: React.FunctionComponent<{}> = (props) => {
    const { roomCode } = useParams<{roomCode: string}>()
    const [socketUrl, setSocketUrl] = useState('')
    const {
        sendMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
    } = useWebSocket(`ws://127.0.0.1/${roomCode}`, {
    })

    useEffect(() => {console.log(`RAW: ${lastMessage}`)}, [lastMessage])

    useEffect(() => {
        if (lastJsonMessage) {
            console.log(lastJsonMessage)
            const message = lastJsonMessage as Message

            if (message.chat) {
                console.log(`<${message.chat.type}> [${message.chat.name}] ${message.chat.msg}`)
            }

        }
    }, [lastJsonMessage])

    return <>
        <h1>Hi ur in room {roomCode}</h1>
    </>
}