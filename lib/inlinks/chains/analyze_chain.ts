import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "@/lib/inlinks/core/llm";

/**
 * Analisa conteúdo e retorna estrutura padronizada (intenção, funil, clusters, entidades)
 * @param content texto limpo da página
 * @param title título da página
 * @param modelName modelo opcional
 * @returns JSON estruturado com metadados estratégicos
 */
export async function analyzeContent(
  content: string,
  title: string,
  modelName?: string
) {
  const analysisSchema = z.object({
    theme: z.string().describe("O tema principal da página em uma frase curta"),
    intencao: z
      .string()
      .describe(
        "A intenção de busca do usuário (ex: Informacional, Transacional, Navegacional)"
      ),
    funil: z
      .string()
      .describe("O estágio do funil de vendas (ex: Topo, Meio, Fundo)"),
    clusters: z
      .array(z.string())
      .describe("Lista de clusters semânticos ou tópicos principais abordados"),
    entidades: z
      .array(z.string())
      .describe(
        "Lista de entidades importantes mencionadas (pessoas, empresas, tecnologias, conceitos)"
      ),
  });

  const llm = await getLLM(undefined, modelName || "gpt-4o-mini");
  const structuredLLM = llm.withStructuredOutput(analysisSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Você é um Especialista Sênior em Estratégia de SEO e Análise Semântica.
      
      🎯 OBJETIVO:
      Analise profundamente o conteúdo fornecido para extrair metadados estratégicos que guiarão a linkagem interna.
      
      📋 DEFINIÇÕES PARA EXTRAÇÃO:

      1. CLUSTERS (Tópicos Principais):
         - Identifique de 3 a 5 grandes temas ou categorias semânticas que este conteúdo cobre.
         - NÃO use palavras-chave de cauda longa; use categorias amplas.

      2. INTENÇÃO DE BUSCA (User Intent):
         - Classifique estritamente em: Informacional, Transacional, Comercial, Navegacional.

      3. FUNIL DE VENDAS:
         - Classifique em: Topo (ToFu), Meio (MoFu), Fundo (BoFu).

      4. ENTIDADES:
         - Liste nomes próprios relevantes: Pessoas, Empresas, Ferramentas, Tecnologias, Locais.
         - Ignore termos genéricos.

      5. TEMA:
         - Uma frase concisa que resume "Sobre o que é esta página?".

      Saída deve ser estritamente o JSON solicitado.`,
    ],
    ["user", "Título: {title}\n\nConteúdo:\n{content}"],
  ]);

  const chain = prompt.pipe(structuredLLM);

  return await chain.invoke({
    title,
    content: content.substring(0, 15000),
  });
}
