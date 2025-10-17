// src/components/InfluencerCard.tsx
import React from "react";
import type { Influencer } from "../types/influencer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// A função para formatar números continua útil
const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num;
};

const InfluencerCard: React.FC<{ influencer: Influencer }> = ({
  influencer,
}) => {
  return (
    <Card className="flex flex-col text-center transition-all hover:border-sky-400">
      <CardHeader className="items-center pb-4">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src={influencer.avatar_url} alt={influencer.name} />
          <AvatarFallback className="text-3xl">
            {influencer.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{influencer.name}</CardTitle>
        <p className="text-xs font-semibold px-2 py-0.5 rounded-full text-sky-400 border border-sky-400/50">
          {influencer.niche}
        </p>
      </CardHeader>

      {/* SEÇÃO PRINCIPAL DE MÉTRICAS */}
      <CardContent className="grid grid-cols-2 gap-4 text-center pb-4">
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            {formatNumber(influencer.subscriber_count)}
          </span>
          <span className="text-xs text-muted-foreground">Inscritos</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            {formatNumber(influencer.avg_views_recent_videos)}
          </span>
          <span className="text-xs text-muted-foreground">Média Views</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            {influencer.posts_last_30_days}
          </span>
          <span className="text-xs text-muted-foreground">Vídeos/Mês</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            {(influencer.engagement_rate * 100).toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">Engajamento</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluencerCard;
