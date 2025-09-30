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

    if (result.length === 0) return null;

    const profile = result[0];
    if (!profile) return null;

    return {
      username: `@${username}`,
      bio: profile.bio,
      links: profile.links,
    };
  } catch (err) {
    console.error("Error fetching profile:", err);
    throw new Error("Database query failed");
  }
}

/**
 * Save or update profile info for a given username.
 */
export async function saveProfileInfo(
  username: string,
  bio?: string,
  links?: any,
) {
  try {
    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.username, username))
      .limit(1);

    if (existingProfile.length === 0) {
      // Insert new profile
      await db.insert(profilesTable).values({
        username,
        bio: bio || null,
        links: links || null,
      });
    } else {
      // Update existing profile
      await db
        .update(profilesTable)
        .set({
          bio: bio ?? existingProfile[0]?.bio ?? null,
          links: links ?? existingProfile[0]?.links ?? null,
        })
        .where(eq(profilesTable.username, username));
    }
  } catch (err) {
    console.error("Error saving profile info:", err);
    throw new Error("Database update failed");
  }
}
