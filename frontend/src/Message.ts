export interface Message {
    // 1. Client to server only
    name?: string
    mod?: boolean

    // 2. Server to client only
    assignment?: RoleAssignment    // the server assigns a user a role
    users?: Array<User>            // the server informs the client of the users in the room
    roles?: Array<Role>            // informs of a change in the roles
    userDelta?: ListDelta<User>    // change one user in the Array

    // 3. Both ways - client sends to server and server then broadcasts to clients
    chat?: Chat                    // send a chat message
    roleDelta?: ListDelta<Role>     // change one role in the list

}

export interface RoleAssignment {
    role: String
    team: String
    requested_by: String
}

export interface User {
    name: String
    mod: Boolean
    role: String
    team: String
}

export interface Role {
    name: String
    quantity: number
    team: String

    // Used by client only to debounce edits to name
    // A timeout is (re)set on every client-side change to name, and an API request to the server is made
    // when the timeout expires
    updateRequestTimeout?: number | null // timeout id is number
}

export enum ChatType {
    PUBLIC = "PUBLIC",
    ANON = "ANON",
    TO_MOD = "TO_MOD",
    TEAM = "TEAM",
    ROLE = "ROLE",
    SYSTEM = "SYSTEM" // currently only used on the frontend e.g. to put role assignments in that chat
}

export const chatTypes = [ChatType.PUBLIC, ChatType.ANON, ChatType.TO_MOD, ChatType.TEAM, ChatType.ROLE]

export function getFriendlyName(chatType: ChatType): string {
    return chatType.charAt(0).toUpperCase() + chatType.slice(1).toLowerCase().replace(/_/g, " ")
}

export interface Chat {
    msg: String
    name?: String
    type?: ChatType
    team?: String
    role?: String
}

interface ListDelta<T> {
    index: number
    edit: T | null
}