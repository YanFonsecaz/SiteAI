import { NextRequest, NextResponse } from "next/server";
import { extractContent } from "@/lib/inlinks/agents/crawler";
import { findAnchorOpportunities } from "@/lib/inlinks/agents/anchor_selector";
import { rankAnchors } from "@/lib/inlinks/agents/ranker";
import { getSettings } from "@/app/actions/settings";
import { getServerSupabase } from "@/lib/supabase-server";

export const maxDuration = 300; // Allow 5 minutes for processing multiple URLs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pillarUrl, satelliteUrls, mode = "inlinks", maxInlinks = 3, config } = body;

    const supabase = getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    let apiKey = req.headers.get("x-api-key") || config?.apiKey;
    let modelName = req.headers.get("x-model") || config?.modelName || "gpt-4-turbo";

    if (userId) {
        const settings = await getSettings();
        if (settings) {
            if (settings.openai_key) apiKey = settings.openai_key;
            if (settings.openai_model) modelName = settings.openai_model;
        }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key não encontrada. Configure na aba de Configurações." },
        { status: 401 }
      );
    }

    if (!pillarUrl) {
      return NextResponse.json({ error: "URL Pilar obrigatória" }, { status: 400 });
    }

    if (!satelliteUrls || satelliteUrls.length === 0) {
      return NextResponse.json({ error: "Pelo menos uma URL satélite é necessária" }, { status: 400 });
    }

    console.log(`[API] Iniciando análise. Modo: ${mode}, Pilar: ${pillarUrl}, Satélites: ${satelliteUrls.length}`);

    const allOpportunities: any[] = [];
    const processedUrls: string[] = [];
    const errors: string[] = [];

    // Helper function to process a direction
    const processDirection = async (sources: string[], targets: string[]) => {
      // Create target objects for the agent
      const targetObjects = targets.map((url) => ({
        url,
        clusters: [url.split('/').pop()?.replace(/-/g, ' ') || 'tópico geral'],
        theme: 'conteúdo relacionado'
      }));

      // Process each source URL
      // We limit concurrency to 3 to avoid timeouts or rate limits
      const BATCH_SIZE = 3;
      for (let i = 0; i < sources.length; i += BATCH_SIZE) {
        const batch = sources.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (sourceUrl) => {
            if (processedUrls.includes(sourceUrl)) return; // Avoid re-crawling if already done (unlikely here but good practice)
            
            try {
                console.log(`[API] Crawling source: ${sourceUrl}`);
                const contentData = await extractContent(sourceUrl);
                
                if (contentData && contentData.content) {
                    const opportunities = await findAnchorOpportunities(
                        contentData.content,
                        contentData.rawHtml,
                        targetObjects,
                        sourceUrl,
                        maxInlinks,
                        apiKey,
                        modelName
                    );

                    // Add origin to opportunities for frontend display
                    const opportunitiesWithOrigin = opportunities.map(opp => ({
                        ...opp,
                        origem: sourceUrl
                    }));

                    allOpportunities.push(...opportunitiesWithOrigin);
                    processedUrls.push(sourceUrl);
                }
            } catch (err: any) {
                console.error(`[API] Falha ao processar ${sourceUrl}:`, err);
                const msg = err.message || "Erro desconhecido";
                errors.push(`Falha em ${sourceUrl}: ${msg}`);
            }
        }));
      }
    };

    // Determine Directions
    // Mode Inlinks: Source=Satellites, Target=Pillar
    if (mode === 'inlinks' || mode === 'hybrid') {
        await processDirection(satelliteUrls, [pillarUrl]);
    }

    // Mode Outlinks: Source=Pillar, Target=Satellites
    if (mode === 'outlinks' || mode === 'hybrid') {
        await processDirection([pillarUrl], satelliteUrls);
    }

    // Rank all found opportunities
    // We pass all potential targets (pillar + satellites) for ranking context, 
    // though distinct ranking per direction might be better, global ranking works for now.
    const allTargets = [{
        url: pillarUrl,
        clusters: ['Pilar'],
        theme: 'Pilar'
    }, ...satelliteUrls.map((u: string) => ({
        url: u,
        clusters: ['Satélite'],
        theme: 'Satélite'
    }))];

    const ranked = rankAnchors(allOpportunities, allTargets);

    return NextResponse.json({
        opportunities: ranked,
        errors, // Return caught errors
        meta: {
            mode,
            scanned_pages: processedUrls.length,
            total_opportunities: ranked.length
        }
    });

  } catch (error: any) {
    console.error("[API] Erro ao processar inlinks:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
