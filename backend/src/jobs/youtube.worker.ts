import cron from "node-cron";
import { YouTubeService } from "../modules/youtube/youtube.service";

export const initYoutubeWorker = () => {
  const youtubeService = new YouTubeService();

  // Agenda a tarefa para rodar todos os dias às 3:00 da manhã
  // A sintaxe é: 'minuto hora dia-do-mês mês dia-da-semana'
  cron.schedule(
    "0 3 * * *",
    () => {
      console.log("Running the daily YouTube worker...");
      youtubeService.fetchAndSaveTopInfluencers();
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  console.log("YouTube daily worker scheduled to run at 3:00 AM (Sao Paulo time).");
};
