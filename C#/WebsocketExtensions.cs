using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace RoleAssigner;

public static class WebsocketExtensions
{
    public async static Task<Message?> ReceiveMessage(this WebSocket webSocket)
    {
        try {
            using Stream messageStream = WebSocketStream.CreateReadableMessageStream(webSocket);
            return await JsonSerializer.DeserializeAsync<Message>(messageStream);
        } catch
        {
            return null;
        }
    }

    public async static void SendMessage(this WebSocket webSocket, Message message)
    {
        string msg = JsonSerializer.Serialize(message);
        ArraySegment<byte> payload = new ArraySegment<byte>(Encoding.UTF8.GetBytes(msg));
        await webSocket.SendAsync(payload, WebSocketMessageType.Text, true, CancellationToken.None);
    }
}