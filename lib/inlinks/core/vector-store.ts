import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { supabase } from "@/lib/supabase";
import type { Document } from "@langchain/core/documents";

/**
 * Retorna uma instância do Vector Store conectado ao Supabase
 * Usa embeddings OpenAI `text-embedding-3-small` (1536 dims) por custo/benefício.
 */
export function getVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
    dimensions: 1536,
  });

  return new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
  });
}

/**
 * Busca documentos similares no banco com filtro de qualidade e metadados
 * @param query texto para buscar similaridade
 * @param k número máximo de resultados
 * @param filter filtro de metadados do Supabase (ex: { url: '...' })
 * @param threshold score mínimo de similaridade (0–1), default 0.75
 */
export async function searchSimilarDocuments(
  query: string,
  k = 4,
  filter?: Record<string, any>,
  threshold = 0.75
) {
  const store = getVectorStore();
  try {
    const resultsWithScore: [Document, number][] =
      await store.similaritySearchWithScore(query, k, filter);
    const highQualityResults = resultsWithScore
      .filter(([, score]) => score >= threshold)
      .map(([doc]) => doc);
    
    // Log quando filtramos resultados de baixa qualidade
    if (highQualityResults.length < resultsWithScore.length) {
      console.log(
        `[Vector Store] Filtrados ${
          resultsWithScore.length - highQualityResults.length
        } resultados com score < ${threshold}`
      );
    }
    
    return highQualityResults;
  } catch (error) {
    console.error(`[Vector Store] Erro ao buscar documentos:`, error);
    return [];
  }
}
