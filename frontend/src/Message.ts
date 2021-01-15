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

interface RoleAssignment {
    role: String
    team: String
    requested_by: String
}

interface User {
    name: String
    mod: Boolean
    role: String
    team: String
}

interface Role {
    name: String
    quantity: Number
    team: String
}

//type ChatType = "PUBLIC" | "ANON" | "TO_MOD" | "TEAM" | "ROLE"

export enum ChatType {
    PUBLIC = "PUBLIC",
    ANON = "ANON",
    TO_MOD = "TO_MOD",
    TEAM = "TEAM",
    ROLE = "ROLE"
}

export const chatTypes = [ChatType.PUBLIC, ChatType.ANON, ChatType.TO_MOD, ChatType.TEAM, ChatType.ROLE]

export function getFriendlyName(chatType: ChatType): string {
    return "Public"
}

export interface Chat {
    msg: String,
    name?: String
    type?: ChatType
}

interface ListDelta<T> {
    index: Number
    edit: T
}