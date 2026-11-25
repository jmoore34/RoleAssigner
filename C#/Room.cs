using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace RoleAssigner;

public class Room
{
    // Publicly viewable fields
    public List<Role> Roles { get; private set; } = new();
    public OrderedDictionary<WebSocket, User> Users { get; private set; } = new();


    // Static methods
    public static Room GetById(string id)
    {
        return rooms.GetOrAdd(id, new Room());
    }
    private static ConcurrentDictionary<string, Room> rooms = new();

    // Instance methods
    public void AddNewUser(WebSocket webSocket)
    {
        var user = new User();
        lock (Users)
        {
            Users[webSocket] = user;
            webSocket.SendMessage(new Message(Users: Users.Values.ToList()));
            Broadcast(new Message(UserDelta: new ListDelta<User>(Users.Count - 1, user)));
        }
        webSocket.SendMessage(new Message(Roles: Roles));
    }

    public void RemoveUserByConnection(WebSocket webSocket)
    {
        lock (Users)
        {
            int index = GetUserIndex(webSocket);
            Users.Remove(webSocket);
            Broadcast(new Message(UserDelta: new ListDelta<User>(index, null)));
        }
    }

    public void ApplyRoleDelta(ListDelta<Role> delta)
    {
        Roles.ApplyPatch(delta);
        Broadcast(new Message(RoleDelta: delta));
    }

    public void ChangeUserName(WebSocket requestor, string Name)
    {
        Users[requestor].Name = Name;
        int index = GetUserIndex(requestor);
        Broadcast(new Message(UserDelta: new ListDelta<User>(index, null)));
    }

    public void ChangeModOptIn(WebSocket requestor, bool mod)
    {
        Users[requestor].Mod = mod;
        int index = GetUserIndex(requestor);
        Broadcast(new Message(UserDelta: new ListDelta<User>(index, null)));
    }

    public void SendChat(WebSocket sender, string message, ChatType type)
    {
        User player = Users[sender];
        Chat chat = new Chat(message, player.Name, type, player.Team, player.Role);
        Broadcast(new Message(Chat: chat));
    }

    public void Broadcast(Message message)
    {
        foreach (WebSocket connection in Users.Keys)
        {
            connection.SendMessage(message);
        }
    }

    private int GetUserIndex(WebSocket webSocket)
    {
        // Note: This implementation seeks to keep compatibility with
        // the originally-designed system; however, if I were to redo
        // the frontend, I would use stable autoincrement ids instead
        // of volatile indices that can change when a user leaves,
        // which would also allow me to make this lookup more efficient
        // by e.g. consulting an id-to-user dictionary instead of doing
        // a O(n) array construction and lookup.
        return Users.Keys.ToArray().IndexOf(webSocket);
    }
}