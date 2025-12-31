import { normalizeText } from "@/lib/inlinks/utils/text-matcher";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "@/lib/inlinks/core/llm";
import { AnchorOpportunity } from "@/lib/inlinks/types";
import { validateOpportunitiesInDOM } from "./dom_validator";
import { getVectorStore } from "@/lib/inlinks/core/vector-store";
import { normalizeUrlForMetadata } from "@/lib/inlinks/utils/url-normalizer";
import { Document } from "@langchain/core/documents";

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

  // RAG: Buscar contexto relevante no Supabase Vector Store com filtro por URL de origem
  let contextToAnalyze = "";
  try {
    const relevantDocs = new Set<string>();
    const intro = contentToUse.slice(0, 1500);
    if (intro.length > 50) relevantDocs.add(intro);
    const store = getVectorStore();
    const normalizedOrigin = normalizeUrlForMetadata(originUrl);
    const mainTargets = targets.slice(0, 3);
    for (const t of mainTargets) {
      const query = t.clusters[0] || t.theme || t.url;
      const results = await store.similaritySearch(query, 2, { url: normalizedOrigin });
      results.forEach((doc: Document) => {
        if (doc.pageContent.length > 50) relevantDocs.add(doc.pageContent);
      });
    }
    contextToAnalyze =
      relevantDocs.size > 0
        ? Array.from(relevantDocs).join("\n\n---\n\n")
        : contentToUse.slice(0, 20000);
  } catch {
    contextToAnalyze = contentToUse.slice(0, 20000);
  }

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
      3. **Tamanho Ideal**: 2 a 10 palavras; prefira termos compostos (ex.: "SEO vs GEO", "otimização para IA generativa"). Evite termos genéricos de 1 palavra como "seo", "marketing".

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
        
        // Filtro de palavra única: apenas siglas conhecidas são permitidas
        if (wordCount < 2) {
          const allowedSingles = new Set([
            "SEO",
            "GEO",
            "IA",
            "GPT",
            "OpenAI",
            "Google",
            "YouTube",
            "LinkedIn",
          ]);
          const raw = opp.anchor.trim();
          const isAcronym = /^[A-Z]{2,6}$/.test(raw);
          if (!allowedSingles.has(raw) && !isAcronym) {
            console.log(
              `[Anchor Selector] Rejeitado (Palavra única não permitida): "${raw}"`
            );
            continue;
          }
        }

        let finalTrecho = opp.trecho;

        if (!content.toLowerCase().includes(opp.anchor.toLowerCase())) continue;

        const realSentence = extractSentenceWithAnchor(content, opp.anchor);
        if (realSentence) {
          finalTrecho = realSentence;
        } else {
          continue;
        }

        if (!isNaturalSentence(finalTrecho)) {
          console.log(
            `[Anchor Selector] Rejeitado (Frase não natural): "${finalTrecho.slice(0, 60)}..."`
          );
          continue;
        }
        
        // --- VALIDAÇÃO DE CONTEXTO: Detecção de Widget/Sidebar ---
        // Rejeita items de lista curta que parecem ser widgets ou sidebars
        const originalLine = content.slice(
          Math.max(0, content.indexOf(opp.anchor) - 20),
          content.indexOf(opp.anchor) + opp.anchor.length + 20
        );
        const isListItem =
          /^\s*[\*\-]\s+/.test(originalLine) ||
          /^\s*[\*\-]\s+/.test(opp.trecho);
        
        if (isListItem) {
          const wordCount = opp.trecho.split(/\s+/).length;
          // Se for lista curta (< 15 palavras), rejeita (suspeita de Widget)
          if (wordCount < 15) {
            console.log(
              `[Anchor Selector] Rejeitado (Suspeita de Widget/Lista Curta): "${opp.trecho}"`
            );
            continue;
          }
        }
        // Bloqueio de boilerplates
        const lowerAnchor = opp.anchor.toLowerCase();
        const lowerTrecho = finalTrecho.toLowerCase();
        const blockedPhrases = [
          "colocamos seu site no topo",
          "todos os direitos reservados",
          "política de privacidade",
          "termos de uso",
          "fale conosco",
          "mapa do site",
          "seo meta tags",
          "clique aqui",
          "saiba mais",
          "skip to content",
          "ir para o conteúdo",
          "copyright",
          "all rights reserved",
          "read more",
          "subscribe",
          "inscreva-se",
          "login",
          "entrar",
          "sign up",
          "cadastre-se",
          "follow us",
          "siga-nos",
          "share",
          "compartilhar",
          "posted by",
          "postado por",
          "leave a comment",
          "deixe um comentário",
          "previous post",
          "post anterior",
          "next post",
          "próximo post",
          "you may also like",
          "você também pode gostar",
          "related posts",
          "posts relacionados",
          "ubersuggest",
          "run in-depth",
          "technical audits",
          "case studies",
          "estudos de caso",
          "advertisement",
          "publicidade",
          "sponsored",
          "patrocinado",
        ];
        if (
          blockedPhrases.some(
            (phrase) =>
              lowerAnchor.includes(phrase) || lowerTrecho.includes(phrase)
          )
        )
          continue;
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

      if (bestTarget) {
        const normDest = normalizeUrlForMetadata(bestTarget.url);
        const normOrigin = normalizeUrlForMetadata(originUrl);
        if (normDest === normOrigin) continue;
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

    // --- VALIDAÇÃO ANTI-ALUCINAÇÃO (HARD CONSTRAINT) ---
    // O trecho PRECISA existir no conteúdo original
    const validContentOpps = opportunities.filter((o) => {
      // Normalização para ignorar diferenças de quebra de linha/espaços múltiplos
      const normalizeForCheck = (s: string) => s.replace(/\s+/g, " ").trim();
      const cleanContent = normalizeForCheck(content);
      const cleanTrecho = normalizeForCheck(o.trecho);

      // Verificação 1: Existe exatamente (case-sensitive)?
      if (content.includes(o.trecho)) return true;

      // Verificação 2: Existe com normalização de espaços?
      if (cleanContent.includes(cleanTrecho)) return true;

      // Verificação 3: Existe ignorando case (fallback final)?
      if (cleanContent.toLowerCase().includes(cleanTrecho.toLowerCase())) {
        return true;
      }

      console.log(
        `[Anchor Selector] ❌ ALUCINAÇÃO DETECTADA: O trecho sugerido não existe no texto original.\n   Trecho IA: "${o.trecho.slice(0, 100)}..."`
      );
      return false;
    });

    if (opportunities.length !== validContentOpps.length) {
      console.log(
        `[Anchor Selector] 🛡️ Anti-Hallucination: ${
          opportunities.length - validContentOpps.length
        } oportunidades removidas por não existirem no texto.`
      );
    }

    // Filtro de qualidade e ordenação
    const highQuality = validContentOpps.filter((o) => o.score >= 0.8);
    const finalOpportunities = (highQuality.length ? highQuality : opportunities)
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
