import cron from "node-cron";
import { Pool } from "pg";
import { InstagramService } from "../modules/instagram/instagram.service";

export const initInstagramWorker = (pool: Pool) => {
  const instagramService = new InstagramService(pool);

  // Agenda para rodar às 4:00 da manhã, depois do worker do YouTube
  cron.schedule(
    "0 4 * * *",
    () => {
      console.log("Executando o worker de enriquecimento do Instagram...");
      instagramService.enrichInfluencersWithInstagramData();
    },
    {
      timezone: "America/Sao_Paulo",
    }
  );

  console.log(
    "Worker de enriquecimento do Instagram agendado para as 4:00 (horário de São Paulo)."
  );
};
