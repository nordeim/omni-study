import { db } from "@/lib/db";
import { NotFoundError, jsonOk, withUser, parseWith } from "@/lib/server/http";
import { preferencesSchema } from "@/lib/validation";

// Preferences: PATCH persists theme mode / accent / avatar / display name.
export const PATCH = withUser(async (userId, req) => {
  const body = await req.json().catch(() => ({}));
  const data = parseWith(preferencesSchema, body as Record<string, unknown>);
  // S14-B3: a whitespace-only display name wipes the visible name (the
  // sidebar falls back to "Student" while the record is blank) — mirror
  // the S13 empty-filename guard and reject it; a padded name is stored
  // trimmed.
  if (data.name !== undefined && !data.name.trim()) {
    return jsonOk({ error: "Display name cannot be empty" }, { status: 400 });
  }
  const user = await db.user.update({
    where: { id: userId },
    data: {
      ...(data.themeMode !== undefined ? { themeMode: data.themeMode } : {}),
      ...(data.accentColor !== undefined ? { accentColor: data.accentColor } : {}),
      ...(data.avatarEmoji !== undefined ? { avatarEmoji: data.avatarEmoji } : {}),
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarEmoji: true,
      themeMode: true,
      accentColor: true,
    },
  });
  return jsonOk({ user });
});
