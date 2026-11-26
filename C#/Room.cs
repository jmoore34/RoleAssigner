using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace RoleAssigner;

public class Room
{
    // Publicly viewable fields
    public List<Role> Roles { get; private set; } = new();
    public OrderedDictionary<WebSocket, User> Users { get; private set; } = new();
    public List<Chat> ChatHistory { get; private set; } = new();
    public required string RoomId { get; init; }

    // Static methods
    public static Room GetById(string id)
    {
        return rooms.GetOrAdd(id, new Room { RoomId = id });
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
        // It might be better to put these welcome messages in the client code
        webSocket.SendSystemMessage("Once people join, you can create roles (or use a preset) and then hit the assign roles button to give each user a secret role. (Roles with the smallest quantity are assigned out first.)");
        webSocket.SendSystemMessage("You can then use the visibility selector to e.g. make only your team see your messages. (Moderators can see all hidden messages.)");
        foreach (Chat c in ChatHistory)
        {
            ForwardChatToUser(c, webSocket);
        }
    }

    public void RemoveUserByConnection(WebSocket webSocket)
    {
        lock (Users)
        {
            int index = GetUserIndex(webSocket);
            Users.Remove(webSocket);
            Broadcast(new Message(UserDelta: new ListDelta<User>(index, null)));
            Console.WriteLine($"User has left room {RoomId}, new user count: {Users.Count}");
            if (Users.Count == 0)
            {
                rooms.Remove(RoomId, out _);
            }
        }
    }

    public void ApplyRoleDelta(ListDelta<Role> delta)
    {
        Roles.ApplyPatch(delta);
        Broadcast(new Message(RoleDelta: delta));
    }

    public void SetRoles(List<Role> roles)
    {
        Roles = roles;
        Broadcast(new Message(Roles: roles));
    }

    public void ChangeUserName(WebSocket requestor, string Name)
    {
        User user = Users[requestor];
        user.Name = Name;
        int index = GetUserIndex(requestor);
        Broadcast(new Message(UserDelta: new ListDelta<User>(index, user)));
    }

    public void ChangeModOptIn(WebSocket requestor, bool mod)
    {
        User user = Users[requestor];
        user.Mod = mod;
        int index = GetUserIndex(requestor);
        Broadcast(new Message(UserDelta: new ListDelta<User>(index, user)));
    }

    public void Broadcast(Message message)
    {
        foreach (WebSocket connection in Users.Keys)
        {
            connection.SendMessage(message);
        }
    }

    public void SendChat(WebSocket sender, string message, ChatType type)
    {
        User player = Users[sender];
        if (message == "/assign")
        {
            AssignRoles(player.Name);
            sender.SendSystemMessage("Non-moderator users have each been issued a secret role.");
            return;
        }
        Chat chat = new Chat(Msg: message,
            Name: player.Name,
            Type: type,
            Team: player.Mod ? null : player.Team,
            Role: player.Mod ? null : player.Role
        );
        lock (ChatHistory)
        {
            ChatHistory.Add(chat);
            foreach (WebSocket x in Users.Keys)
            {
                ForwardChatToUser(chat, x);
            }
        }
    }

    public void AssignRoles(string requestedBy)
    {
        lock (Roles)
        {
            lock (Users)
            {
                IEnumerator<KeyValuePair<WebSocket, User>> players = Users
                    .Where(x => !x.Value.Mod)
                    .Shuffle()
                    .GetEnumerator();
                foreach (Role role in Roles.OrderBy(x => x.Quantity))
                {
                    for (int i = 0; i < role.Quantity; i++)
                    {
                        if (!players.MoveNext())
                        {
                            break;
                        }

                        WebSocket connection = players.Current.Key;
                        User user = players.Current.Value;

                        user.Role = role.Name;
                        user.Team = role.Team;
                        var assignment = new RoleAssignment(Role: user.Role, Team: user.Team, RequestedBy: requestedBy);
                        connection.SendMessage(new Message(Assignment: assignment));
                    }
                }
            }
        }
    }

    public void SystemBroadcast(string Message)
    {
        foreach (WebSocket webSocket in Users.Keys)
        {
            webSocket.SendSystemMessage(Message);
        }
    }

    private void ForwardChatToUser(Chat chat, WebSocket target)
    {
        User player = Users[target];
        bool messageVisible = chat.Type switch
        {
            ChatType.Public => true,
            ChatType.Anon => true,
            ChatType.ToMod => player.Mod,
            ChatType.Team => player.Team == chat.Team,
            ChatType.Role => player.Role == chat.Role,
            ChatType.System => true,
        };
        if (!messageVisible)
        {
            return;
        }

        Chat censoredChat;
        if (!player.Mod)
        {
            censoredChat = chat with { Role = null, Team = null };
        }
        else
        {
            censoredChat = chat;
        }

        target.SendMessage(new Message(Chat: censoredChat));
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