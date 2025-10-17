import { Pool } from "pg";
import { config } from "./index";

// Pool de conexões é mais eficiente que criar uma nova conexão a cada query
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

export const connectToDB = async () => {
  try {
    await pool.connect();
    console.log("PostgreSQL connected successfully.");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
};
