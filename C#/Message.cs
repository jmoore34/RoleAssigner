using System.Text.Json;
using System.Text.Json.Serialization;

namespace RoleAssigner;

// Previously this was a union (sum type); however, since my VPS's CPU doesn't
// meet the minimum requirements for .NET 11, I had to downgrade to a record
// (product type) where only one field is non-null at a time.
public record Message(
    ClientRequestChangeName? Name = null,
    ClientRequestChangeModOptIn? Mod = null,
    ServerMessageRoleAssignment? Assignment = null,
    ServerMessageUsers? Users = null,
    ServerMessageRoles? Roles = null,
    ServerMessageUserDelta? UserDelta = null,
    BidirectionalMessageChat? Chat = null,
    BidirectionalRoleDelta? RoleDelta = null
);

public record ClientRequestChangeName(string Name);
public record ClientRequestChangeModOptIn(bool Mod);
public record ServerMessageRoleAssignment(RoleAssignment assignment);
public record ServerMessageUsers(List<User> Users);
public record ServerMessageRoles(List<Role> Roles);
public record ServerMessageUserDelta(ListDelta<User> UserDelta);
public record BidirectionalRoleDelta(ListDelta<Role> RoleDelta);

// If I were making breaking changes to the message contract, I would split
// this into client-only and server-only variants. In any case, this implementation
// ignores fields from the client (like username and role) that the client
// ought to not send.
public record BidirectionalMessageChat(Chat Chat);


public record RoleAssignment(string Role, string Team, [property: JsonPropertyName("requested_by")] string RequestedBy);
public class User
{
    public string Name { get; set; } = "Unnamed User";
    public bool Mod { get; set; } = false;
    public string Role { get; set; } = "No role";
    public string Team { get; set; } = "No team";
}
public record Role(string Name, string Quantity, string Team);
public record ListDelta<T>(int Index, T? Edit);


[JsonConverter(typeof(ScreamingSnakeCaseEnumConverter<ChatType>))]
public enum ChatType
{ Public, Anon, ToMod, Team, Role, System }
public record Chat(string Msg, string? Name, ChatType Type, string? Team, string? Role);

public class ScreamingSnakeCaseEnumConverter<TEnum>()
    : JsonStringEnumConverter<TEnum>(JsonNamingPolicy.SnakeCaseUpper)
    where TEnum : struct, Enum;