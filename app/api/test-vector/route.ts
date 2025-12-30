import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/inlinks/core/vector-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = getVectorStore();
    const docId = `test-${Date.now()}`;
    await store.addDocuments([
      {
        pageContent: "Teste de verificação do Supabase Vector Store.",
        metadata: { type: "test", id: docId },
      },
    ]);
    const results = await store.similaritySearch("verificação", 1);
    return NextResponse.json({
      success: true,
      message: "Vector Store conectado e funcionando!",
      insertedId: docId,
      searchResult: results.map((r: { pageContent: string }) => r.pageContent),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: "Verifique se rodou o SQL de setup no Supabase (extensions, table, function).",
      },
      { status: 500 }
    );
  }
}
