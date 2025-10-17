// src/components/InfluencersTable.tsx
// src/components/InfluencersTable.tsx
import type { Influencer } from "@/types/influencer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

const getEngagementBadge = (rate: number) => {
  const percentage = rate * 100;
  if (percentage > 5)
    return (
      <Badge variant="default" className="bg-green-600">
        Excelente
      </Badge>
    );
  if (percentage > 2)
    return (
      <Badge variant="default" className="bg-sky-600">
        Bom
      </Badge>
    );
  if (percentage > 0) return <Badge variant="secondary">Médio</Badge>;
  return <Badge variant="outline">N/A</Badge>;
};

interface InfluencersTableProps {
  influencers: Influencer[];
}

export const InfluencersTable: React.FC<InfluencersTableProps> = ({
  influencers,
}) => {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Influenciador</TableHead>
            <TableHead>Nicho</TableHead>
            <TableHead className="text-right">Inscritos</TableHead>
            <TableHead className="text-right">Média Views</TableHead>
            <TableHead className="text-right">Engajamento</TableHead>
            <TableHead className="text-right">Vídeos/Mês</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((influencer) => (
            <TableRow key={influencer.channel_id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={influencer.avatar_url}
                      alt={influencer.name}
                    />
                    <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{influencer.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{influencer.niche}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(influencer.subscriber_count)}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(influencer.avg_views_recent_videos)}
              </TableCell>
              <TableCell className="text-right">
                {getEngagementBadge(influencer.engagement_rate)}
              </TableCell>
              <TableCell className="text-right">
                {influencer.posts_last_30_days}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
