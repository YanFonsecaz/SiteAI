import { NextRequest, NextResponse } from "next/server";
import { extractContent } from "@/lib/inlinks/agents/crawler";
import { getVectorStore } from "@/lib/inlinks/core/vector-store";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "url obrigatória" }, { status: 400 });
    }
    const contentData = await extractContent(url);
    if (!contentData?.content) {
      return NextResponse.json({ error: "conteúdo vazio" }, { status: 422 });
    }
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const docs = await splitter.createDocuments([contentData.content]);
    const store = getVectorStore();
    await store.addDocuments(
      docs.map((d, i) => ({
        pageContent: d.pageContent,
        metadata: { url, idx: i },
      }))
    );
    return NextResponse.json({
      success: true,
      url,
      chunks: docs.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
