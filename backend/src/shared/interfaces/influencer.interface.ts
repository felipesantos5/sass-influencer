export interface IInfluencer {
  channel_id: string;
  name: string;
  description: string;
  avatar_url?: string;
  niche: string;
  subscriber_count: number;
  total_channel_views: number;
  total_videos: number;
  avg_views_recent_videos: number;
  posts_last_30_days: number;
  views_last_30_days: number;
  engagement_rate: number;
}
