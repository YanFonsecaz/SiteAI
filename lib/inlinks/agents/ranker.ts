import { AnchorOpportunity } from "@/lib/inlinks/types";

/**
 * Qualidade do snippet baseada em tamanho e legibilidade simples
 * @param snippet trecho textual
 * @returns score 0–1
 */
function snippetQuality(snippet: string): number {
  const len = snippet.length;
  if (len === 0) return 0;
  // Faixa ideal 40–160 caracteres
  if (len >= 40 && len <= 160) return 1;
  if (len < 40) return len / 40;
  if (len > 160) return Math.max(0, 1 - (len - 160) / 200);
  return 0.5;
}

/**
 * Ranking ponderado
 * @param anchors lista de oportunidades
 * @param targets clusters por URL de destino
 * @returns lista ordenada por score final
 */
export function rankAnchors(
  anchors: AnchorOpportunity[],
  targets: { url: string; clusters: string[] }[]
): AnchorOpportunity[] {
  const ranked = anchors.map((a) => {
    // Use LLM score (High Quality) as primary - 80% weight
    // Add Snippet Quality check - 20% weight
    const qual = snippetQuality(a.trecho);
    const final = 0.8 * a.score + 0.2 * qual;
    
    return { ...a, score: final };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
