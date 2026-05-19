export const BR_STATES_CITIES: Record<string, string[]> = {
  SP: ["Sao Paulo", "Campinas", "Ribeirao Preto", "Santos"],
  RJ: ["Rio de Janeiro", "Niteroi", "Petropolis", "Campos dos Goytacazes"],
  MG: ["Belo Horizonte", "Uberlandia", "Vicosa", "Juiz de Fora"],
  PR: ["Curitiba", "Londrina", "Maringa", "Cascavel"],
  RS: ["Porto Alegre", "Caxias do Sul", "Passo Fundo", "Pelotas"],
  GO: ["Goiania", "Rio Verde", "Jatai", "Anapolis"],
  MT: ["Cuiaba", "Rondonopolis", "Sinop", "Sorriso"],
  MS: ["Campo Grande", "Dourados", "Tres Lagoas", "Ponta Pora"],
  BA: ["Salvador", "Luis Eduardo Magalhaes", "Barreiras", "Feira de Santana"],
};

export const BR_STATES = Object.keys(BR_STATES_CITIES).sort((a, b) => a.localeCompare(b, "pt-BR"));
