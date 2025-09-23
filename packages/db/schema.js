"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    username: (0, pg_core_1.varchar)({ length: 50 }).notNull().unique(), // added
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    password: (0, pg_core_1.text)().notNull(),
    salt: (0, pg_core_1.text)().notNull(),
});
