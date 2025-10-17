import { Pool } from "pg";
import { IInfluencer } from "../../shared/interfaces/influencer.interface";

export class YouTubeRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async saveOrUpdateYouTubeProfile(influencerData: IInfluencer): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN"); // Inicia a transação

      // 1. Tenta inserir o influenciador. Se o nome já existir, apenas retorna o ID.
      const influencerInsertQuery = `
        INSERT INTO influencers (display_name, main_niche)
        VALUES ($1, $2)
        ON CONFLICT (display_name) DO UPDATE
        SET main_niche = EXCLUDED.main_niche
        RETURNING id;
      `;
      const influencerResult = await client.query(influencerInsertQuery, [
        influencerData.name,
        influencerData.niche,
      ]);
      const influencerId = influencerResult.rows[0].id;

      // 2. Com o ID do influenciador, insere ou atualiza o perfil social na tabela 'social_profiles'.
      const profileUpsertQuery = `
        INSERT INTO social_profiles (
          influencer_id, platform, channel_id, name, description, avatar_url,
          subscriber_count, total_channel_views, total_videos, avg_views_recent_videos,
          posts_last_30_days, views_last_30_days, engagement_rate
        )
        VALUES ($1, 'youtube', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (channel_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          avatar_url = EXCLUDED.avatar_url,
          subscriber_count = EXCLUDED.subscriber_count,
          total_channel_views = EXCLUDED.total_channel_views,
          total_videos = EXCLUDED.total_videos,
          avg_views_recent_videos = EXCLUDED.avg_views_recent_videos,
          posts_last_30_days = EXCLUDED.posts_last_30_days,
          views_last_30_days = EXCLUDED.views_last_30_days,
          engagement_rate = EXCLUDED.engagement_rate,
          updated_at = NOW();
      `;
      await client.query(profileUpsertQuery, [
        influencerId,
        influencerData.channel_id,
        influencerData.name,
        influencerData.description,
        influencerData.avatar_url,
        influencerData.subscriber_count,
        influencerData.total_channel_views,
        influencerData.total_videos,
        influencerData.avg_views_recent_videos,
        influencerData.posts_last_30_days,
        influencerData.views_last_30_days,
        influencerData.engagement_rate,
      ]);

      await client.query("COMMIT"); // Confirma a transação
    } catch (error) {
      await client.query("ROLLBACK"); // Desfaz a transação em caso de erro
      console.error("[YouTubeRepository] Erro na transação:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca todos os influenciadores e agrega seus perfis sociais em um array JSON.
   */
  async findAllInfluencersWithProfiles(): Promise<any[]> {
    const query = `
      SELECT
        i.id,
        i.display_name,
        i.main_niche,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'platform', sp.platform,
            'channel_id', sp.channel_id,
            'name', sp.name,
            'avatar_url', sp.avatar_url,
            'subscriber_count', sp.subscriber_count,
            'avg_views_recent_videos', sp.avg_views_recent_videos,
            'engagement_rate', sp.engagement_rate,
            'posts_last_30_days', sp.posts_last_30_days
          )
        ) AS profiles
      FROM influencers i
      LEFT JOIN social_profiles sp ON i.id = sp.influencer_id
      GROUP BY i.id
      ORDER BY (
        SELECT MAX(p.subscriber_count) 
        FROM social_profiles p 
        WHERE p.influencer_id = i.id
      ) DESC NULLS LAST;
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }
}
