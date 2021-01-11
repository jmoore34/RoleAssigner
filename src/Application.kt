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

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

class Room(
    var roles: MutableList<Role> = mutableListOf(),
    val users: LinkedHashMap<WebSocketSession, User> = linkedMapOf()
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

val gson = Gson()

class Message(
    // 1. Client to server only
    val name: String? = null,                  // change username
    val mod: Boolean? = null,

    // 2. Server to client only
    val assignment: RoleAssignment? = null,    // the server assigns a user a role
    val users: List<User>? = null,             // the server informs the client of the users in the room

    // 3. Both ways - client sends to server, and server then broadcasts to clients
    val chat: Chat? = null,                    // send a chat message
    val roles: List<Role>? = null,             // informs of a change in the roles
) {
    class Chat(val msg: String, val name: String?, val type: ChatType?) {
        enum class ChatType { PUBLIC, ANON, TO_MOD, TEAM, ROLE }
    }
    class RoleAssignment(val role: String, val team: String, val requested_by: String)
    class ListDelta<T>(index: Int, newVal: T)
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

            if (!rooms.containsKey(roomCode))
                rooms[roomCode as String] = Room()
            val room = rooms[roomCode]!!

            room.users[this] = User()


            suspend fun broadcast(msg: Message) {
                room.users.keys.map {
                    it.sendMessage(msg)
                }
            }

            suspend fun broadcastUserList() = broadcast(Message(users = room.users.values.toList()))
            suspend fun broadcastRoles() = broadcast(Message(roles = room.roles.toList()))

            // Inform everyone of the updated user list because this new user joined
            broadcastUserList()

            sendMessage(Message(roles = room.roles.toList()))

            try {
                for (frame in incoming) {
                    if (frame is Frame.Text) {
                        val message = gson.fromJson(frame.readText(), Message::class.java)

                        val connections = room.users.keys

                        if (message.roles != null) {
                            room.roles = message.roles as MutableList<Role>
                            connections.forEach {
                                if (it != this)
                                    it.sendMessage(Message(roles = room.roles))
                            }
                        }
                        else if (message.name != null) {
                            room.users[this]!!.name = message.name
                            broadcastUserList()
                        }
                        else if (message.chat != null) {
                            if (message.chat.msg == "/assign") {
                                val users = room.users.entries.shuffled().iterator()
                                val requestingUser = room.users[this]!!.name
                                val roles = room.roles.sortedBy { it.quantity }
                                outer@ for (role in roles)
                                    for (i in 1..role.quantity)
                                        if (users.hasNext()) {
                                            val user = users.next()
                                            user.value.role = role.name
                                            user.value.team = role.team
                                            user.key.sendMessage((Message(assignment = Message.RoleAssignment(
                                                                                            role = role.name,
                                                                                            team = role.team,
                                                                                            requested_by = requestingUser))))
                                        } else { break@outer }
                            } else {
                                val senderUser = room.users[this]!!
                                room.users.entries.forEach { (recipientUserSession, recipientUser) ->
                                    if (message.chat.type == Message.Chat.ChatType.PUBLIC
                                        || message.chat.type == Message.Chat.ChatType.ANON
                                        || message.chat.type == Message.Chat.ChatType.TO_MOD && recipientUser.mod
                                        || message.chat.type == Message.Chat.ChatType.TEAM && recipientUser.team == senderUser.team
                                        || message.chat.type == Message.Chat.ChatType.ROLE && recipientUser.role == senderUser.role
                                    )
                                        recipientUserSession.sendMessage(message)
                                }
                            }
                        }
                        else if (message.mod != null) {
                            room.users[this]!!.mod = message.mod
                            broadcastUserList()
                        }
                    }
                }
            } catch (e: Throwable) {
                val connections = room.users.keys
                connections.remove(this)
                connections.forEach {
                    it.send("Another user left.")
                }
                if (connections.size < 1)
                    rooms.remove(roomCode)
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

