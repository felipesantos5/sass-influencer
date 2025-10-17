import { Button } from "@/components/ui/button";

interface NicheFiltersProps {
  niches: string[];
  selectedNiche: string | null;
  onSelectNiche: (niche: string | null) => void;
}

export const NicheFilters: React.FC<NicheFiltersProps> = ({
  niches,
  selectedNiche,
  onSelectNiche,
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={selectedNiche === null ? "default" : "outline"}
        onClick={() => onSelectNiche(null)}
      >
        Todos
      </Button>
      {niches.map((niche) => (
        <Button
          key={niche}
          variant={selectedNiche === niche ? "default" : "outline"}
          onClick={() => onSelectNiche(niche)}
        >
          {niche}
        </Button>
      ))}
    </div>
  );
};
