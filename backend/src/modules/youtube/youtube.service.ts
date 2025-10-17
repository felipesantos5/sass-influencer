import axios from "axios";
import { Pool } from "pg";
import { config } from "../../config";
import { IInfluencer } from "../../shared/interfaces/influencer.interface";
import { YouTubeRepository } from "./youtube.repository";

// --- CONFIGURAÇÕES DO WORKER ---

const NICHES_KEYWORDS = {
  Tecnologia: ["review tech brasil", "unboxing brasil", "pc gamer setup"],
  Fitness: ["treino em casa", "dieta para hipertrofia", "receita fit"],
  Moda: ["looks da semana", "tendências moda 2025", "arrume-se comigo"],
  Finanças: [
    "investimentos para iniciantes",
    "educação financeira",
    "como economizar",
  ],
};

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";
const RECENT_VIDEOS_TO_FETCH = 20; // Aumentamos a amostra para métricas mais precisas

// --- REGRAS DE FILTRAGEM DE QUALIDADE ---
const MIN_SUBSCRIBERS = 1000;
const MIN_VIDEOS = 10;
const ACTIVITY_MONTH_THRESHOLD = 6; // Canal deve ter postado nos últimos 6 meses

export class YouTubeService {
  private youtubeRepository: YouTubeRepository;

  constructor(pool: Pool) {
    // O pool de conexões é injetado para ser usado pelo repositório
    this.youtubeRepository = new YouTubeRepository(pool);
  }

  /**
   * Orquestra a busca e salvamento de dados de influenciadores do YouTube.
   * Este método executa uma lógica de múltiplas etapas para garantir dados de alta qualidade.
   */
  public async fetchAndSaveTopInfluencers(): Promise<void> {
    console.log("--- INICIANDO WORKER DIÁRIO DO YOUTUBE ---");

    const activityThresholdDate = new Date();
    activityThresholdDate.setMonth(
      activityThresholdDate.getMonth() - ACTIVITY_MONTH_THRESHOLD
    );

    for (const niche in NICHES_KEYWORDS) {
      console.log(`[Worker] Processando nicho: ${niche}`);
      const keywords = NICHES_KEYWORDS[niche as keyof typeof NICHES_KEYWORDS];
      for (const keyword of keywords) {
        try {
          const channelIds = await this._searchChannelIds(keyword);
          if (!channelIds.length) continue;

          const channelsDetails = await this._getChannelsDetails(channelIds);

          for (const channel of channelsDetails) {
            if (!channel.statistics) continue;

            const videoAnalysis = await this._analyzeRecentVideos(channel.id);

            // --- "GATEKEEPER": Bloco que filtra canais de baixa qualidade ---
            const subscriberCount =
              parseInt(channel.statistics.subscriberCount, 10) || 0;
            const videoCount = parseInt(channel.statistics.videoCount, 10) || 0;

            if (subscriberCount < MIN_SUBSCRIBERS) {
              console.log(
                `[Filtro] Canal "${channel.snippet.title}" ignorado: Menos de ${MIN_SUBSCRIBERS} inscritos.`
              );
              continue;
            }
            if (videoCount < MIN_VIDEOS) {
              console.log(
                `[Filtro] Canal "${channel.snippet.title}" ignorado: Menos de ${MIN_VIDEOS} vídeos.`
              );
              continue;
            }
            if (
              !videoAnalysis.mostRecentVideoDate ||
              videoAnalysis.mostRecentVideoDate < activityThresholdDate
            ) {
              console.log(
                `[Filtro] Canal "${channel.snippet.title}" ignorado: Inativo nos últimos ${ACTIVITY_MONTH_THRESHOLD} meses.`
              );
              continue;
            }
            // --- FIM DO BLOCO DE FILTRAGEM ---

            const influencerData: IInfluencer = {
              channel_id: channel.id,
              name: channel.snippet.title,
              description: channel.snippet.description,
              avatar_url: channel.snippet.thumbnails.high.url,
              niche,
              subscriber_count: subscriberCount,
              total_channel_views:
                parseInt(channel.statistics.viewCount, 10) || 0,
              total_videos: videoCount,
              ...videoAnalysis.metrics,
            };

            await this.youtubeRepository.saveOrUpdateYouTubeProfile(
              influencerData
            );
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error?.message || error.message;
          console.error(
            `[Worker] Erro na keyword "${keyword}": ${errorMessage}`
          );
        }
      }
    }
    console.log("--- WORKER DIÁRIO DO YOUTUBE FINALIZADO ---");
  }

  /**
   * Busca a lista de todos os influenciadores qualificados do banco de dados.
   */
  public async getAllInfluencers(): Promise<IInfluencer[]> {
    return this.youtubeRepository.findAllInfluencersWithProfiles();
  }

  // --- MÉTODOS PRIVADOS DE APOIO ---

  private async _searchChannelIds(keyword: string): Promise<string[]> {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        key: config.youtubeApiKey,
        part: "snippet",
        q: keyword,
        type: "channel",
        regionCode: "BR",
        maxResults: 10,
      },
    });
    return response.data.items?.map((item: any) => item.id.channelId) || [];
  }

  private async _getChannelsDetails(channelIds: string[]): Promise<any[]> {
    const response = await axios.get(`${YOUTUBE_API_URL}/channels`, {
      params: {
        key: config.youtubeApiKey,
        part: "snippet,statistics",
        id: channelIds.join(","),
      },
    });
    return response.data.items || [];
  }

  private async _analyzeRecentVideos(channelId: string) {
    const uploadsPlaylistId = channelId.replace("UC", "UU");

    const playlistItemsResponse = await axios.get(
      `${YOUTUBE_API_URL}/playlistItems`,
      {
        params: {
          key: config.youtubeApiKey,
          part: "contentDetails",
          playlistId: uploadsPlaylistId,
          maxResults: RECENT_VIDEOS_TO_FETCH,
        },
      }
    );

    if (!playlistItemsResponse.data.items?.length) {
      return {
        metrics: this._getDefaultVideoMetrics(),
        mostRecentVideoDate: null,
      };
    }

    const videoIds = playlistItemsResponse.data.items
      .map((item: any) => item.contentDetails.videoId)
      .join(",");

    const videoStatsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        key: config.youtubeApiKey,
        part: "statistics,snippet",
        id: videoIds,
      },
    });

    const recentVideos = videoStatsResponse.data.items || [];
    return this._calculateVideoMetrics(recentVideos);
  }

  private _calculateVideoMetrics(videos: any[]) {
    if (!videos.length) {
      return {
        metrics: this._getDefaultVideoMetrics(),
        mostRecentVideoDate: null,
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mostRecentVideoDate = new Date(videos[0].snippet.publishedAt);

    const videosLast30Days = videos.filter(
      (v) => new Date(v.snippet.publishedAt) > thirtyDaysAgo
    );

    const totalRecentViews = videos.reduce(
      (sum, v) => sum + (parseInt(v.statistics.viewCount, 10) || 0),
      0
    );
    const totalRecentLikes = videos.reduce(
      (sum, v) => sum + (parseInt(v.statistics.likeCount, 10) || 0),
      0
    );
    const totalRecentComments = videos.reduce(
      (sum, v) => sum + (parseInt(v.statistics.commentCount, 10) || 0),
      0
    );
    const viewsLast30Days = videosLast30Days.reduce(
      (sum, v) => sum + (parseInt(v.statistics.viewCount, 10) || 0),
      0
    );

    const engagementRate =
      totalRecentViews > 0
        ? (totalRecentLikes + totalRecentComments) / totalRecentViews
        : 0;

    const metrics = {
      avg_views_recent_videos: Math.round(totalRecentViews / videos.length),
      posts_last_30_days: videosLast30Days.length,
      views_last_30_days: viewsLast30Days,
      engagement_rate: parseFloat(engagementRate.toFixed(4)),
    };

    return { metrics, mostRecentVideoDate };
  }

  private _getDefaultVideoMetrics() {
    return {
      avg_views_recent_videos: 0,
      posts_last_30_days: 0,
      views_last_30_days: 0,
      engagement_rate: 0,
    };
  }
}
