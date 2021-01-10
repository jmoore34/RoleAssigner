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

class Room(val roles: MutableList<Role> = mutableListOf(), val connections: MutableList<WebSocketSession> = mutableListOf())
class Role(val name: String, val quantity: Int)

val rooms = mutableMapOf<String, Room>()

class Message(val chat: Chat? = null,           // send a chat message
              val name: String? = null      // change username
) {
    class Chat(val msg: String, val name: String, val type: ChatType) {
        enum class ChatType { PUBLIC, ANON, TO_MOD }
    }
}

val gson = Gson()

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
            val roomCode = call.parameters["roomCode"] as String?
            if (roomCode == null || roomCode.isEmpty())
                send("Error: Must specify a room code")

            send(Frame.Text("Hi from server, you joined $roomCode"))
            send(gson.toJson(Message(name="bob")))
            send(gson.toJson(Message(chat = Message.Chat("hallo", "bob", Message.Chat.ChatType.PUBLIC))))
            if (!rooms.containsKey(roomCode))
                rooms[roomCode as String] = Room()
            val room = rooms[roomCode]!!
            room.connections.add(this)

            send("There are ${room.connections.size} people in this room")
            room.connections.forEach {
                if (it != this) it.send("A new user joined!")
            }

            try {
                while (true) {
                    val frame = incoming.receive()
                    if (frame is Frame.Text) {
                        room.connections.forEach {
                            it.send(Frame.Text("Broadcast: " + frame.readText()))
                        }
                    }
                }
            } catch (e: Throwable) {
                room.connections.remove(this)
                room.connections.forEach {
                    it.send("Another user left.")
                }
                if (room.connections.size < 1)
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

