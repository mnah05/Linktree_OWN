import { eq } from "drizzle-orm";
import db from "../../../../packages/db/db.ts";
import { profilesTable } from "../../../../packages/db/schema.ts";

/**
 * Fetch profile details by username.
 * Returns formatted data or null if not found.
 */
export async function profileDetails(username: string) {
  try {
    const result = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.username, username))
      .limit(1);

    if (result.length === 0) {
      return null; // profile not found
    }

    const { bio, links } = result[0] as {
      username: string;
      bio: string | null;
      links: { text: string; url: string }[] | null;
    };

    const userData = {
      username: `@${username}`,
      bio,
      links,
    };

    return userData;
  } catch (err) {
    console.error("Error fetching profile:", err);
    throw new Error("Database query failed");
  }
}
