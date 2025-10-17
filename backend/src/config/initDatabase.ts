import { Pool, Client } from "pg";
import { config } from "./index";

const influencersTableSchema = `
  CREATE TABLE IF NOT EXISTS influencers (
    channel_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    niche VARCHAR(100) NOT NULL,
    subscriber_count BIGINT,
    total_channel_views BIGINT,
    total_videos INTEGER,
    avg_views_recent_videos BIGINT,
    posts_last_30_days INTEGER,
    views_last_30_days BIGINT,
    engagement_rate FLOAT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

export const initializeDatabase = async () => {
  // 1. Conectar ao banco de dados 'postgres' padrão para verificar se o nosso banco existe
  const maintenanceClient = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: "postgres", // Conecta ao banco padrão
  });

  try {
    await maintenanceClient.connect();

    // 2. Verificar se o nosso banco de dados já existe
    const dbCheckResult = await maintenanceClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.db.database]
    );

    if (dbCheckResult.rowCount === 0) {
      // 3. Se não existir, crie o banco de dados
      console.log(
        `[DB] Banco de dados "${config.db.database}" não encontrado. Criando...`
      );
      await maintenanceClient.query(`CREATE DATABASE "${config.db.database}"`);
      console.log(
        `[DB] Banco de dados "${config.db.database}" criado com sucesso.`
      );
    } else {
      console.log(`[DB] Banco de dados "${config.db.database}" já existe.`);
    }
  } catch (error) {
    console.error("[DB] Erro ao criar o banco de dados:", error);
    throw error;
  } finally {
    await maintenanceClient.end();
  }

  // 4. Agora, conectar ao nosso banco de dados para criar a tabela
  const appPool = new Pool({ ...config.db });
  try {
    const client = await appPool.connect();
    console.log("[DB] Conectado ao banco de dados com sucesso.");

    // 5. Garantir que a tabela 'influencers' exista
    await client.query(influencersTableSchema);
    console.log('[DB] Tabela "influencers" verificada/criada com sucesso.');

    client.release();
    return appPool; // Retorna o pool de conexões para ser usado pela aplicação
  } catch (error) {
    console.error("[DB] Erro ao conectar ou criar a tabela:", error);
    process.exit(1); // Sai da aplicação se não conseguir conectar
  }
};
