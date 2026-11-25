using System.Net.WebSockets;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace RoleAssigner.Controllers;

[ApiController]
[Route("[controller]")]
public class WebsocketController : ControllerBase
{
    [Route("/room/{roomCode}")]
    public async Task Get(string roomCode)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            await ChatRoom(roomCode, webSocket);
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }


    private static async Task ChatRoom(string roomCode, WebSocket webSocket)
    {
        Room room = Room.GetById(roomCode);
        room.AddNewUser(webSocket);

        while (true)
        {
            Message? message = await webSocket.ReceiveMessage();
            if (message == null)
            {
                room.RemoveUserByConnection(webSocket);
                break;
            } else if (message.Name != null)
            {
                room.ChangeUserName(webSocket, message.Name);
            } else if (message.Mod != null)
            {
                room.ChangeModOptIn(webSocket, message.Mod.Value);
            } else if (message.Chat != null)
            {
                room.SendChat(webSocket, message.Chat.Msg, message.Chat.Type);
            } else if (message.RoleDelta != null)
            {
                room.ApplyRoleDelta(message.RoleDelta);
            }
        }

        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Event loop end", CancellationToken.None);
    }

}
