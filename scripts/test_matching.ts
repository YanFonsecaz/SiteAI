/**
 * Script de verificação de matching semântico para destinos de inlinks.
 * Executa uma checagem simples entre um tópico sugerido (saída da IA)
 * e os atributos dos possíveis destinos (URL, clusters, tema).
 */
import { normalizeText } from "@/lib/inlinks/utils/text-matcher";

const targets = [
  {
    url: "https://neilpatel.com/br/blog/como-usar-o-facebook-live/",
    clusters: ["facebook live", "live streaming", "video marketing"],
    theme: "Redes Sociais",
    intencao: "Informativa",
  },
];

const targetTopic = "Facebook Live Tips"; // Exemplo de saída da IA

const targetTopicLower = normalizeText(targetTopic);

const target = targets.find((t) => {
  const clusters = t.clusters.map((c) => normalizeText(c));
  const theme = t.theme ? normalizeText(t.theme) : "";
  const url = normalizeText(t.url);

  console.log(`Checando destino: ${t.url}`);
  console.log(`Clusters: ${clusters}`);
  console.log(`Tópico alvo: ${targetTopicLower}`);

  const match =
    url.includes(targetTopicLower) ||
    targetTopicLower.includes(url) ||
    clusters.some(
      (c) => targetTopicLower.includes(c) || c.includes(targetTopicLower)
    ) ||
    (theme && targetTopicLower.includes(theme));

  console.log(`Match: ${match}`);
  return match;
});

console.log("Destino encontrado:", target ? target.url : "Nenhum");
