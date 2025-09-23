"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var node_postgres_1 = require("drizzle-orm/node-postgres");
var db = (0, node_postgres_1.drizzle)(process.env.DATABASE_URL);
exports.default = db;
