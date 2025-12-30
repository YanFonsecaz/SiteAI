/**
 * Cria e retorna uma instância do ChatOpenAI de forma dinâmica e segura
 * @param apiKey chave opcional (usa `process.env.OPENAI_API_KEY` por padrão)
 * @param modelName modelo opcional (usa `process.env.OPENAI_MODEL` ou `gpt-4o`)
 * @returns instância pronta de chat model
 */
export const getLLM = async (
  apiKey?: string,
  modelName?: string,
  temperature: number = 0
) => {
  const { ChatOpenAI } = await import("@langchain/openai");
  const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
  // Default seguro: gpt-4o (modelo carro-chefe).
  // Para tarefas simples, quem chama deve especificar 'gpt-4o-mini' explicitamente.
  const finalModelName = modelName || process.env.OPENAI_MODEL || "gpt-4o";

  if (!finalApiKey) {
    throw new Error("API Key não configurada. Por favor, adicione sua chave nas configurações.");
  }

  return new ChatOpenAI({
    openAIApiKey: finalApiKey,
    modelName: finalModelName,
    temperature: temperature,
  });
};
