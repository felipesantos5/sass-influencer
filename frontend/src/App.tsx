// src/App.tsx
import { useEffect, useState, useMemo } from "react";
// Importamos o novo tipo principal
// Importamos o novo tipo principal
import type { InfluencerEntity } from "./types/influencer";
import { Input } from "@/components/ui/input";
import { NicheFilters } from "./components/NicheFilters";
import { InfluencersTable } from "./components/InfluencersTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const API_URL = "http://localhost:3333/influencers";
const NICHES = ["Tecnologia", "Fitness", "Moda", "Finanças"];

function App() {
  // O estado agora armazena a nova estrutura de dados
  const [influencers, setInfluencers] = useState<InfluencerEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Falha ao buscar dados do servidor.");
        // O fetch agora espera receber o novo tipo de dado
        const data: InfluencerEntity[] = await response.json();
        setInfluencers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  // Lógica de filtragem corrigida para usar as novas propriedades
  const filteredInfluencers = useMemo(() => {
    return influencers
      .filter((inf) =>
        // Filtra pelo nicho principal
        selectedNiche ? inf.main_niche === selectedNiche : true
      )
      .filter((inf) =>
        // Filtra pelo nome de exibição (CORRIGE O ERRO!)
        inf.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [influencers, searchQuery, selectedNiche]);

  const renderContent = () => {
    if (isLoading) {
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

    // Passa a lista filtrada de InfluencerEntity para a tabela
    return <InfluencersTable influencers={filteredInfluencers} />;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight">SaaS Influencers</h1>
        <p className="text-muted-foreground mt-2">Encontre os criadores ideais para sua marca</p>
      </header>

      <section className="space-y-6 mb-8">
        <Input
          type="text"
          placeholder="Buscar por nome do canal..."
          className="w-full mx-auto"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <NicheFilters niches={NICHES} selectedNiche={selectedNiche} onSelectNiche={setSelectedNiche} />
      </section>

      <main>{renderContent()}</main>
    </div>
  );
}

export default App;
