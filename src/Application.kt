package io.github.jmoore34_csweetman

import com.google.gson.Gson
import io.ktor.application.*
import io.ktor.client.request.*
import io.ktor.response.*
import io.ktor.request.*
import io.ktor.routing.*
import io.ktor.http.*
import io.ktor.content.*
import io.ktor.http.content.*
import io.ktor.locations.*
import io.ktor.features.*
import io.ktor.websocket.*
import io.ktor.http.cio.websocket.*
import java.time.*
import io.ktor.gson.*
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

class Room(
    var roles: MutableList<Role> = mutableListOf(),
    val users: LinkedHashMap<WebSocketSession, User> = linkedMapOf(),
    val mutex: Mutex
)

fun <T> MutableList<T>.edit(index: Int, newVal: T?) {
    if (newVal == null)
        this.removeAt(index)
    else if (index >= size || index < 0)
        this.add(newVal)
    else
        this[index] = newVal
}

class Role(val name: String, val quantity: Int, val team: String)
class User(var name: String = "Unnamed User", var mod: Boolean = false, var role: String = "No role", var team: String = "No team")

val rooms = mutableMapOf<String, Room>()
val globalMutex = Mutex()

val gson = Gson()

class Message(
    // 1. Client to server only
    val name: String? = null,                  // change username
    val mod: Boolean? = null,

    // 2. Server to client only
    val assignment: RoleAssignment? = null,    // the server assigns a user a role
    val users: List<User>? = null,             // the server informs the client of the users in the room
    val roles: List<Role>? = null,             // informs of a change in the roles
    val userDelta: ListDelta<User>? = null,    // change one user in the list

    // 3. Both ways - client sends to server, and server then broadcasts to clients
    val chat: Chat? = null,                    // send a chat message
    val roleDelta: ListDelta<Role>? = null,    // change one role in the list
) {
    class Chat(val msg: String, val name: String? = null, val type: ChatType? = null) {
        enum class ChatType { PUBLIC, ANON, TO_MOD, TEAM, ROLE }
    }
    class RoleAssignment(val role: String, val team: String, val requested_by: String)
    class ListDelta<T>(val index: Int, val edit: T?)
}

suspend fun WebSocketSession.sendMessage(message: Message) = this.send(gson.toJson(message, Message::class.java))

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    install(Locations) {
    }

    install(CORS) {
        method(HttpMethod.Options)
        method(HttpMethod.Put)
        method(HttpMethod.Delete)
        method(HttpMethod.Patch)
        header(HttpHeaders.Authorization)
        header("MyCustomHeader")
        allowCredentials = true
        anyHost() // @TODO: Don't do this in production if possible. Try to limit it.
    }

    install(io.ktor.websocket.WebSockets) {
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }


    routing {
        get("/") {
            call.respondText("HELLO WORLD!", contentType = ContentType.Text.Plain)
        }

        // Static feature. Try to access `/static/ktor_logo.svg`
        static("/static") {
            resources("static")
        }

        get<MyLocation> {
            call.respondText("Location: name=${it.name}, arg1=${it.arg1}, arg2=${it.arg2}")
        }
        // Register nested routes
        get<Type.Edit> {
            call.respondText("Inside $it")
        }
        get<Type.List> {
            call.respondText("Inside $it")
        }

        install(StatusPages) {
            exception<AuthenticationException> { cause ->
                call.respond(HttpStatusCode.Unauthorized)
            }
            exception<AuthorizationException> { cause ->
                call.respond(HttpStatusCode.Forbidden)
            }

        }

        webSocket("/{roomCode}") {
            val roomCode = call.parameters["roomCode"]
            if (roomCode == null || roomCode.isEmpty())
                send("Error: Must specify a room code")

            var room: Room;
            globalMutex.withLock {
                if (!rooms.containsKey(roomCode))
                    rooms[roomCode as String] = Room(mutex = Mutex())
                room = rooms[roomCode]!!

                room.users[this] = User()
            }

            // Broadcasts a message to all users in the room
            suspend fun broadcast(msg: Message) {
                room.users.keys.map {
                    it.sendMessage(msg)
                }
            }

            // Like above, but skips the client who prompted the server
            suspend fun broadcastSkipSender(msg: Message) {
                room.users.keys.filter { it != this }.map {
                    it.sendMessage(msg)
                }
            }

            room.mutex.withLock {

                suspend fun broadcastUserList() = broadcast(Message(users = room.users.values.toList()))
                suspend fun broadcastRoles() = broadcast(Message(roles = room.roles.toList()))

                // Inform the new user of the existing roles and users
                sendMessage(Message(roles = room.roles.toList()))
                sendMessage(Message(users = room.users.values.toList()))

                // Inform everyone else of the update to the user list because this new user joined
                broadcastSkipSender(Message(userDelta = Message.ListDelta(index=room.users.size - 1, room.users[this]!!)))
            }


            try {
                while (true) {
                    val frame = incoming.receive()
                    if (frame is Frame.Text) {
                        room.mutex.withLock {
                            val message = gson.fromJson(frame.readText(), Message::class.java)

                            if (message.roleDelta != null) {
                                room.roles.edit(message.roleDelta.index, message.roleDelta.edit)
                                broadcast(message)
                            } else if (message.roles != null) {
                                room.roles = message.roles as MutableList<Role>
                                broadcast(Message(roles = message.roles)) // broadcast only relevant parts
                            } else if (message.name != null) {
                                val user = room.users[this]!!
                                user.name = message.name
                                broadcast(Message(userDelta = Message.ListDelta(room.users.keys.indexOf(this), user)))
                            } else if (message.chat != null) {
                                if (message.chat.msg == "/assign") {
                                    val (mods, nonModUsers) = room.users.entries.partition { it.value.mod }
                                    val requestingUser = room.users[this]!!.name
                                    for (mod in mods) {
                                        mod.value.role = "Moderator"
                                        mod.value.team = "Moderators"
                                        mod.key.sendMessage(
                                            Message(
                                                assignment = Message.RoleAssignment(
                                                    role = mod.value.role,
                                                    team = mod.value.team,
                                                    requested_by = requestingUser
                                                )
                                            )
                                        )
                                    }
                                    val nonModUserIterator = nonModUsers.shuffled().iterator()
                                    val roles = room.roles.sortedBy { it.quantity }
                                    outer@ for (role in roles)
                                        for (i in 1..role.quantity)
                                            if (nonModUserIterator.hasNext()) {
                                                val user = nonModUserIterator.next()
                                                user.value.role = role.name
                                                user.value.team = role.team
                                                user.key.sendMessage(
                                                    Message(
                                                        assignment = Message.RoleAssignment(
                                                            role = role.name,
                                                            team = role.team,
                                                            requested_by = requestingUser
                                                        )
                                                    )
                                                )
                                            } else {
                                                break@outer
                                            }
                                    // If there are no more roles but still users left in the iterator, make them roleless (in case they already had a role)
                                    while (nonModUserIterator.hasNext()) {
                                        val user = nonModUserIterator.next()
                                        user.value.role = "No role"
                                        user.value.team = "No team"
                                        user.key.sendMessage(
                                            Message(
                                                assignment = Message.RoleAssignment(
                                                    role = user.value.role,
                                                    team = user.value.team,
                                                    requested_by = requestingUser
                                                )
                                            )
                                        )
                                    }
                                    // Inform all the moderators of everyone's new roles
                                    val userList = room.users.values.toList()
                                    room.users.entries.forEach { (recipientUserSession, recipientUser) ->
                                        if (recipientUser.mod)
                                            recipientUserSession.sendMessage(Message(users = userList))
                                    }
                                } else {
                                    val senderUser = room.users[this]!!
                                    room.users.entries.forEach { (recipientUserSession, recipientUser) ->
                                        if (message.chat.type == Message.Chat.ChatType.PUBLIC
                                            || message.chat.type == Message.Chat.ChatType.ANON
                                            || message.chat.type == Message.Chat.ChatType.TO_MOD && (recipientUser.mod || recipientUserSession == this) //also send mod messages to self
                                            || message.chat.type == Message.Chat.ChatType.TEAM && recipientUser.team == senderUser.team
                                            || message.chat.type == Message.Chat.ChatType.ROLE && recipientUser.role == senderUser.role
                                            || recipientUser.mod
                                        )
                                            recipientUserSession.sendMessage(
                                                Message(
                                                    chat = Message.Chat(
                                                        name = room.users[this]!!.name,
                                                        msg = message.chat.msg,
                                                        type = message.chat.type
                                                    )
                                                )
                                            )
                                    }
                                }
                            } else if (message.mod != null) {
                                val user = room.users[this]!!
                                user.mod = message.mod
                                if (message.mod) {
                                    user.role = "Moderator"
                                    user.team = "Moderators"
                                }
                                broadcast(Message(userDelta = Message.ListDelta(room.users.keys.indexOf(this), user)))

                                // If the user is becoming a mod, they need to know everyone's roles
                                if (message.mod)
                                    sendMessage(Message(users = room.users.values.toList()))
                            }
                        }
                    }
                }
            } catch (e: Throwable) {
                if (e !is ClosedReceiveChannelException)
                    e.printStackTrace()
                globalMutex.withLock {
                    val userIndex = room.users.keys.indexOf(this)
                    room.users.remove(this)
                    broadcast(Message(userDelta = Message.ListDelta(userIndex, null)))
                    if (room.users.isEmpty())
                        rooms.remove(roomCode)
                }
            }
        }

        get("/json/gson") {
            call.respond(mapOf("hello" to "world"))
        }
    }
}

@Location("/{roomCode}")
class WebsocketLocation(val roomCode: String)

@Location("/location/{name}")
class MyLocation(val name: String, val arg1: Int = 42, val arg2: String = "default")

@Location("/type/{name}") data class Type(val name: String) {
    @Location("/edit")
    data class Edit(val type: Type)

    @Location("/list/{page}")
    data class List(val type: Type, val page: Int)
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()

