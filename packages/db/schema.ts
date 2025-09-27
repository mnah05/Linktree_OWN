import { integer, pgTable, varchar, text, jsonb } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 50 }).notNull().unique(), // added
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),
});
// profiles table
export const profilesTable = pgTable("profiles", {
  // username is both PK and FK referencing users.username
  username: varchar({ length: 50 })
    .primaryKey()
    .references(() => usersTable.username, { onDelete: "cascade" }),
  bio: text().default(""), // optional user bio
  links: jsonb().$type<{ text: string; url: string }[]>().default([]), // JSON array of links
});
