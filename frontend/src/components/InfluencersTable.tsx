// src/components/InfluencersTable.tsx
// src/components/InfluencersTable.tsx
import type { InfluencerEntity } from "@/types/influencer";
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
import { Youtube, Instagram } from "lucide-react"; // Ícones para as plataformas!

const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

const getEngagementBadge = (rate: number | undefined) => {
  if (rate === undefined) return <Badge variant="outline">N/A</Badge>;
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
  influencers: InfluencerEntity[];
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
            <TableHead>Plataformas</TableHead>
            <TableHead>Seguidores (Total)</TableHead>
            <TableHead className="text-right">Média Views (YT)</TableHead>
            <TableHead className="text-right">Engajamento (YT)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((influencer) => {
            // Lógica para encontrar os perfis e agregar os dados
            const youtubeProfile = influencer.profiles.find(
              (p) => p.platform === "youtube"
            );
            const instagramProfile = influencer.profiles.find(
              (p) => p.platform === "instagram"
            );

            const totalFollowers = influencer.profiles.reduce(
              (sum, profile) => sum + (profile.subscriber_count || 0),
              0
            );
            const avatarUrl =
              youtubeProfile?.avatar_url || instagramProfile?.avatar_url;

            return (
              <TableRow key={influencer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={avatarUrl}
                        alt={influencer.display_name}
                      />
                      <AvatarFallback>
                        {influencer.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{influencer.display_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {youtubeProfile && (
                      <Youtube className="h-5 w-5 text-red-600" />
                    )}
                    {instagramProfile && (
                      <Instagram className="h-5 w-5 text-pink-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatNumber(totalFollowers)}</TableCell>
                <TableCell className="text-right">
                  {youtubeProfile
                    ? formatNumber(youtubeProfile.avg_views_recent_videos || 0)
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {getEngagementBadge(youtubeProfile?.engagement_rate)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
