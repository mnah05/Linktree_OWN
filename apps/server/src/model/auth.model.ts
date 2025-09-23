import { eq } from "drizzle-orm";
import db from "../../../../packages/db/db.ts";
import { usersTable } from "../../../../packages/db/schema.ts";

/*
 * Checks if an email address already exists in the users table
 * @param email - The email address to check (will be normalized to lowercase and trimmed)
 * @returns Promise<boolean> - true if email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const row = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalized))
    .limit(1)
    .execute();

  return row.length > 0;
}

/*
 * Checks if a username already exists in the users table
 * @param username - The username to check (will be normalized to lowercase and trimmed)
 * @returns Promise<boolean> - true if username exists, false otherwise
 */
export async function userNameExists(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();

  const row = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, normalized))
    .limit(1)
    .execute();

  return row.length > 0;
}

/*
 * Creates a new user in the database
 * @param params - Object containing user data (username, name, email, password, salt)
 * @returns Promise<Array> - Array containing the inserted user's id and username
 * @throws Error - If email or username already exists, or if insert fails
 */
export async function createUser(params: {
  username: string;
  name: string;
  email: string;
  password: string;
  salt: string;
}) {
  const username = params.username.trim().toLowerCase();
  const email = params.email.trim().toLowerCase();

  try {
    const inserted = await db
      .insert(usersTable)
      .values({
        username,
        name: params.name,
        email,
        password: params.password,
        salt: params.salt,
      })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
      })
      .execute();

    if (!inserted) throw new Error("Insert failed");

    return inserted;
  } catch (err: any) {
    // Postgres unique-violation code
    if (err?.code === "23505") {
      // try to map to a specific constraint name if available
      const msg = String(err.detail || err.message || "");
      if (msg.includes("email")) throw new Error("Email already in use");
      if (msg.includes("username")) throw new Error("Username already in use");
      // fallback
      throw new Error("Conflict: duplicate field");
    }
    throw err;
  }
}
