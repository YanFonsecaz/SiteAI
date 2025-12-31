import { NextRequest, NextResponse } from "next/server";
import { extractContent } from "@/lib/inlinks/agents/crawler";
import { findAnchorOpportunities } from "@/lib/inlinks/agents/anchor_selector";
import { rankAnchors } from "@/lib/inlinks/agents/ranker";
import { getVectorStore } from "@/lib/inlinks/core/vector-store";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { analyzeContent } from "@/lib/inlinks/chains/analyze_chain";
import { buildClusterMap } from "@/lib/inlinks/agents/cluster_builder";
import { sanitizeContent } from "@/lib/inlinks/agents/content_sanitizer";
import { normalizeUrlForMetadata } from "@/lib/inlinks/utils/url-normalizer";
// Supabase server client não é necessário para este endpoint no modo teste

export const maxDuration = 300; // Allow 5 minutes for processing multiple URLs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pillarUrl,
      satelliteUrls,
      mode = "inlinks",
      maxInlinks = 3,
      config,
    } = body;

    let apiKey =
      req.headers.get("x-api-key") ||
      config?.apiKey ||
      process.env.OPENAI_API_KEY ||
      "";
    let modelName =
      req.headers.get("x-model") ||
      config?.modelName ||
      process.env.OPENAI_MODEL ||
      "gpt-4-turbo";

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key não encontrada. Configure na aba de Configurações." },
        { status: 401 }
      );
    }

    if (!pillarUrl) {
      return NextResponse.json(
        { error: "URL Pilar obrigatória" },
        { status: 400 }
      );
    }

    if (!satelliteUrls || satelliteUrls.length === 0) {
      return NextResponse.json(
        { error: "Pelo menos uma URL satélite é necessária" },
        { status: 400 }
      );
    }

    console.log(
      `[API] Iniciando análise. Modo: ${mode}, Pilar: ${pillarUrl}, Satélites: ${satelliteUrls.length}`
    );

    const allOpportunities: any[] = [];
    const processedUrls: string[] = [];
    const errors: string[] = [];
    const analyses: Record<string, any> = {};

    // Helper function to process a direction
    const processDirection = async (sources: string[], targets: string[]) => {
      // Create target objects for the agent
      const targetObjects = targets.map((url) => ({
        url,
        clusters: [url.split("/").pop()?.replace(/-/g, " ") || "tópico geral"],
        theme: "conteúdo relacionado",
      }));

      // Process each source URL
      // Processa em lotes para desempenho conforme solicitado
      const BATCH_SIZE = 32;
      for (let i = 0; i < sources.length; i += BATCH_SIZE) {
        const batch = sources.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (sourceUrl) => {
            if (processedUrls.includes(sourceUrl)) return; // Avoid re-crawling if already done (unlikely here but good practice)

            try {
              console.log(`[API] Crawling source: ${sourceUrl}`);
              const stageLogs: string[] = [];
              stageLogs.push(`Crawling: ${sourceUrl}`);
              const contentData = await extractContent(sourceUrl);

              if (contentData && contentData.content) {
                const sanitized = await sanitizeContent(contentData.content);
                stageLogs.push(`Sanitizing: ${sourceUrl}`);
                try {
                  const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 2000,
                    chunkOverlap: 200,
                  });
                  const docs = await splitter.createDocuments([sanitized]);
                  const store = getVectorStore();
                  await store.addDocuments(
                    docs.map((d, i) => ({
                      pageContent: d.pageContent,
                      metadata: {
                        url: normalizeUrlForMetadata(sourceUrl),
                        idx: i,
                      },
                    }))
                  );
                  stageLogs.push(
                    `Seeding: ${sourceUrl} (${docs.length} chunks)`
                  );
                } catch (e: any) {
                  console.warn(
                    `[API] Vector seed falhou para ${sourceUrl}: ${e.message}`
                  );
                }

                try {
                  const analysis = await analyzeContent(
                    sanitized,
                    contentData.title || ""
                  );
                  analyses[sourceUrl] = {
                    title: contentData.title || "",
                    ...analysis,
                  };
                  stageLogs.push(`Analyzing: ${sourceUrl}`);
                } catch (e: any) {
                  console.warn(
                    `[API] Análise semântica falhou para ${sourceUrl}: ${e.message}`
                  );
                }

                const opportunities = await findAnchorOpportunities(
                  sanitized,
                  contentData.rawHtml,
                  targetObjects,
                  sourceUrl,
                  maxInlinks,
                  apiKey,
                  modelName
                );
                stageLogs.push(`Anchor Selection: ${sourceUrl}`);

                // Add origin to opportunities for frontend display
                const opportunitiesWithOrigin = opportunities.map((opp) => ({
                  ...opp,
                  origem: sourceUrl,
                }));

                allOpportunities.push(...opportunitiesWithOrigin);
                processedUrls.push(sourceUrl);
                stageLogs.push(`DOM Validation: ${sourceUrl}`);
                stageLogs.push(`Done: ${sourceUrl}`);

                // Append stage logs into errors array for UI visibility or create dedicated logs
                errors.push(...stageLogs);
              }
            } catch (err: any) {
              console.error(`[API] Falha ao processar ${sourceUrl}:`, err);
              const msg = err.message || "Erro desconhecido";
              errors.push(`Falha em ${sourceUrl}: ${msg}`);
            }
          })
        );
      }
    };

    // Determine Directions
    // Mode Inlinks: Source=Satellites, Target=Pillar
    if (mode === "inlinks" || mode === "hybrid") {
      await processDirection(satelliteUrls, [pillarUrl]);
    }

    // Mode Outlinks: Source=Pillar, Target=Satellites
    if (mode === "outlinks" || mode === "hybrid") {
      await processDirection([pillarUrl], satelliteUrls);
    }

    // Rank all found opportunities
    // We pass all potential targets (pillar + satellites) for ranking context,
    // though distinct ranking per direction might be better, global ranking works for now.
    const allTargets = [
      {
        url: pillarUrl,
        clusters: ["Pilar"],
        theme: "Pilar",
      },
      ...satelliteUrls.map((u: string) => ({
        url: u,
        clusters: ["Satélite"],
        theme: "Satélite",
      })),
    ];

    const ranked = rankAnchors(allOpportunities, allTargets);

    const clusterInput = Object.entries(analyses).map(([url, analysis]) => ({
      url,
      analysis,
    }));
    let cluster: any = { pillars: [], satellites: {}, clusterIndex: {} };
    try {
      cluster = buildClusterMap(clusterInput as any);
    } catch (e: any) {
      console.warn(`[API] Falha ao construir cluster: ${e.message}`);
    }

    return NextResponse.json({
      opportunities: ranked,
      errors, // Return caught errors and stage logs
      meta: {
        mode,
        scanned_pages: processedUrls.length,
        total_opportunities: ranked.length,
      },
      cluster,
      analyses,
      logs: errors.filter((e) => !e.startsWith("Falha em ")),
    });
  } catch (error: any) {
    console.error("[API] Erro ao processar inlinks:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
