import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/inlinks/core/vector-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = getVectorStore();
    const docId = `test-${Date.now()}`;
    await store.addDocuments([
      {
        pageContent:
          "Este é um teste de verificação do Supabase Vector Store do SiteIA.",
        metadata: { type: "test", id: docId },
      },
    ]);
    const results = await store.similaritySearch("teste verificação", 1);
    return NextResponse.json({
      success: true,
      message: "Vector Store conectado e funcionando!",
      insertedId: docId,
      searchResult: results.map((r) => r.pageContent),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint:
          "Verifique extensão 'vector', tabela 'documents' e função 'match_documents' no Supabase.",
      },
      { status: 500 }
    );
  }
}
