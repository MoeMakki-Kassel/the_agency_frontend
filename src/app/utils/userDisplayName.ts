export type DisplayNameProfile = {
  first_name?: string | null;
  last_name?: string | null;
};

/** Full name when both parts exist; otherwise email local-part or empty. */
export function getUserDisplayName(
  profile: DisplayNameProfile | null | undefined,
  email?: string | null,
): string {
  const first = profile?.first_name?.trim();
  const last = profile?.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  const local = email?.split("@")[0]?.trim();
  return local ?? "";
}
