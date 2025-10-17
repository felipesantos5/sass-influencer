export interface SocialProfile {
  platform: "youtube" | "instagram" | string;
  channel_id: string;
  name: string;
  avatar_url?: string;
  subscriber_count: number;
  avg_views_recent_videos?: number; // Específico do YouTube
  engagement_rate?: number; // Específico do YouTube
  posts_last_30_days?: number; // Específico do YouTube
}

// Descreve a entidade principal "Influenciador" que agrupa os perfis
export interface InfluencerEntity {
  id: number;
  display_name: string;
  main_niche: string;
  profiles: SocialProfile[];
}
