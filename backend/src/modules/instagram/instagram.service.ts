import { Pool } from "pg";
import axios from "axios";
import { config } from "../../config";
import { InstagramRepository } from "./instagram.repository";

const META_GRAPH_API_URL = "https://graph.facebook.com/v19.0";

export class InstagramService {
  private repository: InstagramRepository;

  constructor(pool: Pool) {
    this.repository = new InstagramRepository(pool);
  }

  public async enrichInfluencersWithInstagramData(): Promise<void> {
    console.log("--- INICIANDO WORKER DE ENRIQUECIMENTO DO INSTAGRAM ---");
    const influencersToEnrich =
      await this.repository.findInfluencersWithoutInstagram();
    console.log(
      `[Instagram Worker] Encontrados ${influencersToEnrich.length} influenciadores para enriquecer.`
    );

    // Para obter o ID da conta de negócio do Instagram
    const igBusinessAccountId = await this._getInstagramBusinessAccountId();
    if (!igBusinessAccountId) {
      console.error(
        "[Instagram Worker] Não foi possível obter o ID da conta de negócio do Instagram."
      );
      return;
    }

    for (const influencer of influencersToEnrich) {
      try {
        // Busca o usuário do Instagram pelo nome
        const searchResult = await this._searchInstagramUser(
          igBusinessAccountId,
          influencer.display_name
        );
        if (searchResult) {
          console.log(
            `[Instagram Worker] Perfil encontrado para "${influencer.display_name}": @${searchResult.username}`
          );

          // Adiciona o ID do nosso sistema ao objeto para salvar no banco
          searchResult.influencer_id = influencer.id;

          await this.repository.saveInstagramProfile(searchResult);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error?.message || error.message;
        console.error(
          `[Instagram Worker] Erro ao enriquecer "${influencer.display_name}": ${errorMessage}`
        );
      }
    }
    console.log("--- WORKER DE ENRIQUECIMENTO DO INSTAGRAM FINALIZADO ---");
  }

  // Pega o ID da sua própria conta do Instagram (necessário para fazer buscas)
  private async _getInstagramBusinessAccountId(): Promise<string | null> {
    const response = await axios.get(`${META_GRAPH_API_URL}/me/accounts`, {
      params: {
        access_token: config.instagramAccessToken,
        fields: "instagram_business_account{id}",
      },
    });
    return response.data?.data?.[0]?.instagram_business_account?.id || null;
  }

  // Busca por um usuário do Instagram (esta busca é limitada)
  private async _searchInstagramUser(
    igBusinessAccountId: string,
    username: string
  ): Promise<any | null> {
    const response = await axios.get(
      `${META_GRAPH_API_URL}/${igBusinessAccountId}`,
      {
        params: {
          access_token: config.instagramAccessToken,
          fields: `business_discovery.username(${username}){username,website,followers_count,media_count,profile_picture_url,id}`,
        },
      }
    );
    return response.data?.business_discovery || null;
  }
}
