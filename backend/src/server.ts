// Garante que as variáveis de ambiente sejam carregadas ANTES de qualquer outro código
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { config } from "./config";
import { initializeDatabase } from "./config/initDatabase"; // Importa a nova função de inicialização
import { initYoutubeWorker } from "./jobs/youtube.worker";
import { YouTubeService } from "./modules/youtube/youtube.service";
import { initInstagramWorker } from "./jobs/instagram.worker";
import { InstagramService } from "./modules/instagram/instagram.service";

const startServer = async () => {
  const dbPool = await initializeDatabase();
  console.log("[App] Conexão com o banco de dados estabelecida e pronta.");

  const app = express();

  app.use(cors());
  app.use(express.json());

  const youtubeService = new YouTubeService(dbPool);
  const instagramService = new InstagramService(dbPool);

  app.get("/", (req, res) => {
    res.send("SaaS Influencers Backend está no ar!");
  });

  app.get("/influencers", async (req, res) => {
    try {
      const influencers = await youtubeService.getAllInfluencers();
      res.status(200).json(influencers);
    } catch (error) {
      console.error("Falha ao buscar influenciadores:", error);
      res
        .status(500)
        .json({ message: "Erro ao buscar dados dos influenciadores." });
    }
  });

  app.get("/run-worker-now", async (req, res) => {
    console.log(
      "[App] Requisição para executar o worker sob demanda recebida..."
    );
    try {
      await youtubeService.fetchAndSaveTopInfluencers();
      await instagramService.enrichInfluencersWithInstagramData();
      res.status(200).send("Worker executado com sucesso!");
      console.log("[App] Worker sob demanda finalizado com sucesso.");
    } catch (error) {
      console.error("[App] Worker sob demanda falhou:", error);
      res.status(500).send("Execução do worker falhou.");
    }
  });

  app.listen(config.port, () => {
    console.log(`[App] Servidor escutando na porta ${config.port}`);

    initYoutubeWorker(dbPool);
    initInstagramWorker(dbPool);
  });
};

startServer();
