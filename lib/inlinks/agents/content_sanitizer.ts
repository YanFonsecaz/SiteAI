import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getLLM } from "@/lib/inlinks/core/llm";
import { z } from "zod";

const sanitizerSchema = z.object({
  main_content: z
    .string()
    .describe(
      "O conteúdo principal do artigo, limpo de menus, widgets, sidebars e rodapés. Mantenha a formatação Markdown original do texto narrativo."
    ),
  is_article: z
    .boolean()
    .describe(
      "True se o texto parece ser um artigo/conteúdo editorial válido. False se for apenas uma página de erro, login ou sem conteúdo."
    ),
  removed_sections: z
    .array(z.string())
    .describe(
      "Lista resumida do tipo de seções removidas (ex: 'Sidebar', 'Footer', 'Menu de Navegação')"
    ),
});

export async function sanitizeContent(rawContent: string): Promise<string> {
  console.log(`[Content Sanitizer] Iniciando limpeza inteligente via LLM...`);
  if (rawContent.length < 300) {
    console.log(`[Content Sanitizer] Texto muito curto, retornando original.`);
    return rawContent;
  }

  const model = await getLLM(undefined, "gpt-4o-mini", 0);
  const structuredLLM = model.withStructuredOutput(sanitizerSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Você é um Especialista Sênior em Extração de Conteúdo Web e Processamento de Linguagem Natural.

      🎯 OBJETIVO PRINCIPAL:
      Sua tarefa é limpar um texto em Markdown extraído de uma página web, separando o "Conteúdo Principal" (Main Content) do "Ruído" (Boilerplate).
      Você deve retornar APENAS o texto jornalístico/editorial, mantendo sua estrutura original.

      🛑 O QUE DEVE SER REMOVIDO (RUÍDO):
      1. Elementos de Navegação: Menus, breadcrumbs, "Voltar ao topo", "Ir para conteúdo".
      2. Sidebars e Widgets: "Posts Populares", "Categorias", banners laterais, widgets de redes sociais.
      3. CTAs Intrusivas: "Assine agora", "Baixe o Ebook", "Inscreva-se na newsletter".
      4. Rodapé: Copyright, links institucionais, bios genéricas de autor.
      5. Metadados e Poluição Visual: Datas repetitivas, listas de tags, "Publicado em", "Tempo de leitura".
      6. Comentários e Engajamento.
      7. Blocos de "Leia Também".

      ⚠️ INSTRUÇÃO DE FORMATAÇÃO:
      - Mantenha a formatação Markdown original (negrito, itálico, headers) para o conteúdo preservado.
      - Retorne apenas o conteúdo.`,
    ],
    [
      "human",
      `Analise e limpe o seguinte conteúdo bruto:
      
      ---
      {text}
      ---`,
    ],
  ]);

  const chain = prompt.pipe(structuredLLM);
  try {
    const inputSlice = rawContent.slice(0, 20000);
    const result = await chain.invoke({ text: inputSlice });
    if (!result.is_article) {
      console.warn(`[Content Sanitizer] Conteúdo não parece artigo válido.`);
      return rawContent;
    }
    console.log(`[Content Sanitizer] Limpeza concluída.`);
    return result.main_content;
  } catch (error) {
    console.error(`[Content Sanitizer] Erro na limpeza via LLM:`, error);
    return rawContent;
  }
}

