import { normalizeText } from "@/lib/inlinks/utils/text-matcher";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "@/lib/inlinks/core/llm";
import { AnchorOpportunity } from "@/lib/inlinks/types";
import { validateOpportunitiesInDOM } from "./dom_validator";

const anchorSchema = z.object({
  opportunities: z.array(
    z.object({
      anchor: z
        .string()
        .describe("O texto exato da âncora (ou o novo texto sugerido)"),
      trecho: z
        .string()
        .describe("A frase completa onde a âncora aparece ou será inserida"),
      type: z.string().describe("Tipo de oportunidade: 'exact'"),
      original_text: z
        .string()
        .nullable()
        .optional()
        .describe(
          "O texto original que será substituído (apenas para 'rewrite')"
        ),
      pillar_context: z
        .string()
        .nullable()
        .optional()
        .describe("Justificativa semântica para a inserção ou reescrita"),
      target_url: z
        .string()
        .describe("A URL exata do destino escolhido da lista fornecida"),
      target_topic: z
        .string()
        .describe("O nome do tópico para qual a âncora aponta"),
      score: z.number().describe("Relevância da âncora (0-1)"),
    })
  ),
});

function searchNormalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[#*_`]/g, "")
    .trim();
}

function extractSentenceWithAnchor(
  content: string,
  anchor: string
): string | null {
  const cleanAnchor = searchNormalize(anchor);
  const contentLower = content.toLowerCase();

  let searchIndex = 0;
  let index = -1;

  while (true) {
    index = contentLower.indexOf(cleanAnchor, searchIndex);
    if (index === -1) {
      return null;
    }

    const prevChar = index > 0 ? content[index - 1] : "";
    const nextChar =
      index + cleanAnchor.length < content.length
        ? content[index + cleanAnchor.length]
        : "";

    if (prevChar === "[" && (nextChar === "]" || nextChar === "(")) {
      searchIndex = index + 1;
      continue;
    }

    if (prevChar === "(" && content.slice(index - 2, index) === "](") {
      searchIndex = index + 1;
      continue;
    }

    const surroundingText = content.slice(
      Math.max(0, index - 10),
      Math.min(content.length, index + cleanAnchor.length + 10)
    );
    if (
      !/\s/.test(surroundingText) &&
      (/[\/\.]/.test(surroundingText) || surroundingText.includes("-"))
    ) {
      searchIndex = index + 1;
      continue;
    }

    break;
  }

  let start = index;
  while (start > 0) {
    const char = content[start - 1];
    if (/[.?!]/.test(char) || char === "\n") {
      break;
    }
    start--;
  }

  let end = index + cleanAnchor.length;
  while (end < content.length) {
    const char = content[end];
    if (/[.?!]/.test(char) || char === "\n") {
      end++;
      break;
    }
    end++;
  }

  let sentence = content.slice(start, end).trim();

  if (sentence.startsWith("![") || sentence.startsWith("[Image")) {
    return null;
  }

  return sentence;
}

function isNaturalSentence(text: string): boolean {
  if (!text) return false;
  if ((text.match(/\|/g) || []).length > 1) return false;
  if ((text.match(/•/g) || []).length > 1) return false;

  if (/^[\{\[\(]/.test(text.trim())) return false;
  if (/function\s*\(/.test(text)) return false;
  if (/var\s+|const\s+|let\s+/.test(text)) return false;

  if (/^[\d\/\.\-\:]+$/.test(text.trim())) return false;
  if (text.length < 20) return false;

  if (/^\s*(fig|figure|image|imagem|foto|video|vídeo)\s*\d+/i.test(text))
    return false;
  if (/\.(jpg|png|webp|gif)$/i.test(text.trim())) return false;

  return true;
}

export async function findAnchorOpportunities(
  content: string,
  html: string | undefined,
  targets: {
    url: string;
    clusters: string[];
    theme?: string;
    intencao?: string;
  }[],
  originUrl: string,
  maxInlinks: number = 3,
  apiKey?: string,
  modelName?: string
): Promise<AnchorOpportunity[]> {
  const limit = Math.floor(Number(maxInlinks)) || 3;
  console.log(
    `[Anchor Selector] Iniciando para ${originUrl} com ${targets.length} targets.`
  );

  const contentToUse = content;

  // Use temperature 0.3
  const model = await getLLM(apiKey, modelName || "gpt-4-turbo", 0.3);
  const structuredLLM = model.withStructuredOutput(anchorSchema);

  const targetsDescription = targets
    .map(
      (t) =>
        `- URL: ${t.url}\n  Tópicos: ${t.clusters.join(", ")}\n  Tema: ${
          t.theme || "N/A"
        }\n  Intenção: ${t.intencao || "N/A"}`
    )
    .join("\n\n");

  // RAG Removed for simple integration, using sliced content
  const contextToAnalyze = contentToUse.slice(0, 20000); 

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `🎯 OBJETIVO
      Atue como um Especialista Sênior em Link Building e SEO Técnico.
      Sua missão é identificar oportunidades precisas para inserção de links internos (Internal Linking) no CONTEÚDO PRINCIPAL.

      🛡️ DIRETRIZES DE SEGURANÇA (ONDE NÃO LINKAR):
      Você deve ignorar completamente áreas que não são corpo de texto editorial.
      ❌ **NÃO SUGIRA LINKS EM**:
      1. **Elementos de Navegação**: Menus, breadcrumbs, rodapés.
      2. **Sidebars e Widgets**: Áreas laterais com "Posts Populares", "Categorias", "Assine".
      3. **Listas de Features/Produtos**: Itens curtos de venda ou bullets de especificações técnicas.
      4. **CTAs e Botões**: "Clique aqui", "Saiba mais", "Comprar".
      5. **Bios de Autor**: Descrições "Sobre o autor".
      6. **Títulos e Subtítulos**: Não insira links em H1, H2, H3.

      ✅ ONDE SUGERIR LINKS (ZONA SEGURA):
      1. **Parágrafos Narrativos**: Onde o autor explica conceitos, conta histórias ou desenvolve argumentos.
      2. **Listas Explicativas**: Itens de lista longos que detalham um passo ou conceito.
      3. **Contexto Semântico**: Onde a âncora surge naturalmente como parte da frase.

       CRITÉRIOS DE QUALIDADE:
      1. **Relevância Extrema**: O link deve ser útil para quem está lendo *aquela* frase específica.
      2. **Naturalidade**: A âncora deve ser parte gramatical da frase. Não force termos.
      3. **Tamanho Ideal**: 1 a 5 palavras. Evite linkar frases inteiras.

      ⚠️ REGRAS DE OURO (HARD CONSTRAINTS):
      - **TIPO PERMITIDO**: Apenas "exact" (A palavra/frase já existe no texto).
      - **SEM ALUCINAÇÕES**: O texto da âncora deve existir caractere por caractere no original.
      - **SEM DUPLICIDADE**: Não sugira linkar se já houver um link na mesma frase ou muito próximo.
      - **IDIOMA**: Analise apenas conteúdo em Português.

      FORMATO DE SAÍDA (JSON):
      Retorne um array de oportunidades conforme o schema, focando nas top {maxInlinks} mais relevantes.`,
    ],
    [
      "human",
      `Texto para Análise:
      {content}
      
      ---
      
      Tópicos Alvo (URLs para linkar):
      {targets}
      
      ---
      
      Encontre até {maxInlinks} melhores oportunidades.
      Retorne JSON.`,
    ],
  ]);

  const chain = prompt.pipe(structuredLLM);

  console.log(`[Anchor Selector] Invocando LLM...`);
  try {
    const result = await chain.invoke({
      content: contextToAnalyze,
      targets: targetsDescription,
      maxInlinks: Math.ceil(maxInlinks * 1.5).toString(),
    });

    const opportunities: AnchorOpportunity[] = [];
    const seenAnchors = new Set<string>();

    // @ts-ignore
    for (const opp of result.opportunities) {
      const type = opp.type.toLowerCase();
      const uniqueKey = `${opp.anchor.trim().toLowerCase()}|${opp.target_url}`;

      if (seenAnchors.has(uniqueKey)) continue;

      if (/\.(jpg|png|webp|gif|pdf)$/i.test(opp.anchor.trim())) continue;

      if (type === "exact") {
        const wordCount = opp.anchor.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount > 8) continue;

        let finalTrecho = opp.trecho;

        if (!content.toLowerCase().includes(opp.anchor.toLowerCase())) continue;

        const realSentence = extractSentenceWithAnchor(content, opp.anchor);
        if (realSentence) {
          finalTrecho = realSentence;
        } else {
          continue;
        }

        if (!isNaturalSentence(finalTrecho)) continue;
        opp.trecho = finalTrecho;
      } else {
         continue;
      }

      // @ts-ignore
      let bestTarget = targets.find((t) => t.url === opp.target_url);
      if (!bestTarget) {
        // Fallback matching
        const targetTopicLower = normalizeText(opp.target_topic);
        bestTarget = targets.find((t) => {
          const url = normalizeText(t.url);
          return url.includes(targetTopicLower) || targetTopicLower.includes(url);
        });
      }

      if (bestTarget && bestTarget.url !== originUrl) {
        seenAnchors.add(uniqueKey);
        opportunities.push({
            anchor: opp.anchor,
            trecho: opp.trecho,
            origem: originUrl,
            destino: bestTarget.url,
            score: opp.score,
            reason: opp.pillar_context || `Tópico: ${opp.target_topic}`,
            type: "exact",
            original_text: opp.original_text ?? undefined,
            pillar_context: opp.pillar_context ?? undefined,
            target_topic: opp.target_topic,
        });
      }
    }

    // Ordenar por score
    const finalOpportunities = opportunities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Validação DOM
    if (html) {
      return await validateOpportunitiesInDOM(finalOpportunities, html);
    } else {
      return finalOpportunities;
    }

  } catch (e) {
    console.error(`[Anchor Selector] Erro crítico na cadeia LLM:`, e);
    throw e; // Rethrow to allow API to handle critical failures (like Auth)
  }
}
