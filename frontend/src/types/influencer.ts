export interface Influencer {
  channel_id: string;
  name: string;
  description: string;
  avatar_url?: string;
  niche: string;
  subscriber_count: number;
  avg_recent_views: number;
  engagement_rate: number;
  last_updated: string;
  avg_views_recent_videos: number;
  posts_last_30_days: number;
}
