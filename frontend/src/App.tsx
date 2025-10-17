// src/App.tsx
import { useEffect, useState, useMemo } from "react";
import type { Influencer } from "./types/influencer";
import { Input } from "@/components/ui/input";
import { NicheFilters } from "./components/NicheFilters";
import { InfluencersTable } from "./components/InfluencersTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const API_URL = "http://localhost:3333/influencers";
const NICHES = ["Tecnologia", "Fitness", "Moda", "Finanças"]; // Nossos nichos pré-definidos

function App() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para os filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfluencers = async () => {
      // ... (código de fetch existente, sem alterações)
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Falha ao buscar dados do servidor.");
        const data: Influencer[] = await response.json();
        setInfluencers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  // Filtra os dados com base nos estados de busca e nicho
  const filteredInfluencers = useMemo(() => {
    return influencers
      .filter((inf) => (selectedNiche ? inf.niche === selectedNiche : true))
      .filter((inf) =>
        inf.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [influencers, searchQuery, selectedNiche]);

  const renderContent = () => {
    if (isLoading) {
      // Skeleton para a tabela
      return (
        <div className="space-y-2 rounded-lg border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 flex-grow" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Ocorreu um Erro!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return <InfluencersTable influencers={filteredInfluencers} />;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          SaaS Influencers
        </h1>
        <p className="text-muted-foreground mt-2">
          Encontre os criadores ideais para sua marca
        </p>
      </header>

      {/* Seção de Filtros */}
      <section className="space-y-6 mb-8">
        <Input
          type="text"
          placeholder="Buscar por nome do canal..."
          className="mx-auto w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <NicheFilters
          niches={NICHES}
          selectedNiche={selectedNiche}
          onSelectNiche={setSelectedNiche}
        />
      </section>

      {/* Seção de Conteúdo (Tabela ou Loading/Error) */}
      <main>{renderContent()}</main>
    </div>
  );
}

export default App;
