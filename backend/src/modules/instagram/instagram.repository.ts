// src/modules/instagram/instagram.repository.ts
import { Pool } from "pg";

export class InstagramRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Busca influenciadores que ainda não têm um perfil do Instagram
  async findInfluencersWithoutInstagram(): Promise<
    { id: number; display_name: string }[]
  > {
    const query = `
      SELECT i.id, i.display_name
      FROM influencers i
      WHERE NOT EXISTS (
        SELECT 1
        FROM social_profiles sp
        WHERE sp.influencer_id = i.id AND sp.platform = 'instagram'
      );
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Salva um novo perfil do Instagram
  async saveInstagramProfile(profileData: any): Promise<void> {
    const query = `
      INSERT INTO social_profiles (
        influencer_id, platform, channel_id, name, 
        subscriber_count, total_videos, avatar_url
      )
      VALUES ($1, 'instagram', $2, $3, $4, $5, $6)
      ON CONFLICT (channel_id) DO NOTHING; -- Se já existe, não faz nada
    `;
    await this.pool.query(query, [
      profileData.influencer_id,
      profileData.id,
      profileData.username,
      profileData.followers_count,
      profileData.media_count,
      profileData.profile_picture_url,
    ]);
  }
}
