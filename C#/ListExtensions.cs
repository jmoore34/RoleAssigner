using RoleAssigner;

public static class ListExtensions
{
    public static void ApplyPatch<T>(this List<T> list, ListDelta<T> patch)
    {
        if (patch.Edit == null)
        {
            list.RemoveAt(patch.Index);
        }
        else if (patch.Index > list.Count || patch.Index < 0)
        {
            list.Add(patch.Edit);
        }
        else
        {
            list[patch.Index] = patch.Edit;
        }
    }
}