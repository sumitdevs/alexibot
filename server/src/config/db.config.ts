import postgres from "postgres";
import { env } from "./env";

export const db = postgres({
  host: env.DB.host,
  port: env.DB.port,
  username: env.DB.user,
  password: env.DB.password,
  database: env.DB.database,
});