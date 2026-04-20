const DEFAULT_CEPEA_URL = "https://www.cepea.esalq.usp.br/br";

const KEYWORD_TO_URL: Array<{ keys: string[]; url: string }> = [
  { keys: ["acucar", "açucar"], url: "https://cepea.org.br/br/indicador/series/acucar.aspx?id=53" },
  { keys: ["algodao", "algodão"], url: "https://cepea.org.br/br/indicador/series/algodao.aspx?id=54" },
  { keys: ["arroz"], url: "https://cepea.org.br/br/indicador/series/arroz.aspx?id=91" },
  { keys: ["bezerro"], url: "https://cepea.org.br/br/indicador/series/bezerro.aspx?id=8" },
  { keys: ["boi"], url: "https://cepea.org.br/br/indicador/series/boi-gordo.aspx?id=2" },
  { keys: ["cafe", "café"], url: "https://cepea.org.br/br/indicador/series/cafe.aspx?id=23" },
  { keys: ["etanol"], url: "https://cepea.org.br/br/indicador/series/etanol.aspx?id=103" },
  { keys: ["feijao", "feijão"], url: "https://cepea.org.br/br/indicador/series/feijao.aspx?id=380" },
  { keys: ["frango"], url: "https://cepea.org.br/br/indicador/series/frango.aspx?id=181" },
  { keys: ["leite"], url: "https://cepea.org.br/br/indicador/series/leite.aspx?id=leitep" },
  { keys: ["milho"], url: "https://cepea.org.br/br/indicador/series/milho.aspx?id=77" },
  { keys: ["mandioca"], url: "https://cepea.org.br/br/indicador/series/mandioca.aspx?id=72" },
  { keys: ["ovinos"], url: DEFAULT_CEPEA_URL },
  { keys: ["ovos"], url: "https://cepea.org.br/br/indicador/series/ovos.aspx?id=159" },
  { keys: ["soja"], url: "https://cepea.org.br/br/indicador/series/soja.aspx?id=92" },
  { keys: ["suino", "suíno"], url: "https://cepea.org.br/br/indicador/series/suino.aspx?id=129" },
  { keys: ["tilapia", "tilápia"], url: "https://cepea.org.br/br/indicador/series/tilapia.aspx?id=349" },
  { keys: ["trigo"], url: "https://cepea.org.br/br/indicador/series/trigo.aspx?id=178" },
  { keys: ["citros", "laranja"], url: DEFAULT_CEPEA_URL },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function getCepeaDownloadLink(commodity: string): string {
  const normalizedCommodity = normalize(commodity);
  const match = KEYWORD_TO_URL.find((rule) =>
    rule.keys.some((k) => normalizedCommodity.includes(normalize(k))),
  );
  return match?.url || DEFAULT_CEPEA_URL;
}

