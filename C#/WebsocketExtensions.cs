using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RoleAssigner;

public static class WebsocketExtensions
{
    public async static Task<Message?> ReceiveMessage(this WebSocket webSocket)
    {
        Console.WriteLine("Receiving message...");
        try
        {
            using Stream messageStream = WebSocketStream.CreateReadableMessageStream(webSocket);
            Message? msg = JsonSerializer.Deserialize<Message>(messageStream, jsonSerializerOptions);
            Console.WriteLine($"Received message: {JsonSerializer.Serialize(msg, jsonSerializerOptions)}");
            return msg;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Deserialization failed: {ex}");
            return null;
        }
    }

    public async static void SendMessage(this WebSocket webSocket, Message message)
    {
        try
        {
            string msg = JsonSerializer.Serialize(message, jsonSerializerOptions);
            Console.WriteLine($"Sending message: {msg}");
            ArraySegment<byte> payload = new ArraySegment<byte>(Encoding.UTF8.GetBytes(msg));
            await webSocket.SendAsync(payload, WebSocketMessageType.Text, true, CancellationToken.None);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Serialization failed: {ex}");
        }
    }

    public static void SendSystemMessage(this WebSocket webSocket, string message)
    {
        webSocket.SendMessage(new Message(Chat: new Chat(message, "SYSTEM", ChatType.System, "SYSTEM", "SYSTEM")));
    }

    private static JsonSerializerOptions jsonSerializerOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
}