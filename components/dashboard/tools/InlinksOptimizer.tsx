"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Link2,
  Loader2,
  Play,
  Activity,
  ArrowRight,
  Settings,
  ChevronDown,
  ChevronUp,
  Layout,
  CheckCircle2,
  BarChart3,
  Terminal,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateCSV,
  downloadCSV,
  generateJSON,
  generateMarkdown,
  downloadText,
} from "@/lib/inlinks/utils/exporter";

interface Opportunity {
  anchor: string;
  trecho: string;
  destino: string;
  score: number;
  reason: string;
  origem: string;
}

interface AnalysisMeta {
  mode: string;
  scanned_pages: number;
  total_opportunities: number;
}

interface ClusterData {
  pillars: string[];
  satellites: Record<string, string[]>;
  clusterIndex: Record<string, string[]>;
}

interface PageAnalysis {
  title: string;
  theme: string;
  intencao: string;
  funil: string;
  clusters: string[];
}

export default function InlinksOptimizer() {
  const [pillarUrl, setPillarUrl] = useState("");
  const [urlsInput, setUrlsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Opportunity[] | null>(null);
  const [meta, setMeta] = useState<AnalysisMeta | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [strategyMode, setStrategyMode] = useState<
    "inlinks" | "outlinks" | "hybrid"
  >("inlinks");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxInlinks, setMaxInlinks] = useState(3);
  const [activeTab, setActiveTab] = useState<"resultados" | "analise" | "logs">(
    "resultados"
  );
  const [cluster, setCluster] = useState<ClusterData | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, PageAnalysis> | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, []);

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const analyze = async () => {
    const satelliteUrlsArray = urlsInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (!pillarUrl || satelliteUrlsArray.length === 0) {
      const msg = "Erro: Preencha a URL Pilar e pelo menos uma URL satélite.";
      setError(msg);
      addLog(msg);
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);
    setMeta(null);
    setLogs([]);
    setActiveTab("logs");
    setProgress(5);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    tickRef.current = window.setInterval(() => {
      setProgress((p) => (p < 70 ? p + 1 : p));
    }, 250);

    addLog("Iniciando análise de Inlinks...");
    addLog(`Modo selecionado: ${strategyMode}`);
    addLog(`URL Pilar: ${pillarUrl}`);
    addLog(`URLs Satélites identificadas: ${satelliteUrlsArray.length}`);

    try {
      addLog("Enviando requisição para API...");
      setProgress(25);
      const apiKeyHeader = localStorage.getItem("openai_api_key") || "";
      if (!apiKeyHeader) {
        const msg =
          "Chave da API ausente. Configure em Configurações > IA & Integrações.";
        setError(msg);
        addLog(msg);
        setLoading(false);
        setActiveTab("logs");
        return;
      }
      const res = await fetch("/api/analyze-inlinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKeyHeader,
          "x-provider": localStorage.getItem("ai_provider") || "openai",
          "x-model": localStorage.getItem("ai_model") || "gpt-4o",
        },
        body: JSON.stringify({
          pillarUrl,
          satelliteUrls: satelliteUrlsArray,
          mode: strategyMode,
          maxInlinks,
        }),
      });

      const data = await res.json();
      setProgress(80);

      if (!res.ok) {
        if (res.status === 401) {
          const msg =
            data.error ||
            "Chave da API ausente. Configure em Configurações > IA & Integrações.";
          setError(msg);
          addLog(msg);
          setActiveTab("logs");
          throw new Error(msg);
        }
        throw new Error(data.error || "Erro na análise");
      }

      // Log server-side errors and stage logs
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err: string) => addLog(`[API] ${err}`));
        if (data.opportunities.length === 0) {
          addLog("A análise falhou para todas as URLs.");
          setError("Falha na análise. Verifique os Logs para detalhes.");
          setActiveTab("logs");
        }
      }
      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((log: string) => addLog(log));
      }

      setResults(data.opportunities);
      setMeta(data.meta);
      setCluster(data.cluster || null);
      setAnalyses(data.analyses || null);
      setProgress(95);

      if (data.opportunities.length > 0) {
        addLog(
          `Sucesso! ${data.opportunities.length} oportunidades encontradas.`
        );
        addLog(`Páginas escaneadas: ${data.meta.scanned_pages}`);
        setActiveTab("resultados");
      }
    } catch (e: any) {
      setError(e.message);
      addLog(`Erro crítico: ${e.message}`);
    } finally {
      setLoading(false);
      setProgress(100);
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }
  };

  const totalOpportunities = results?.length || 0;
  const avgScore =
    results && results.length > 0
      ? (
          results.reduce((acc, curr) => acc + curr.score, 0) / results.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sans">
      {/* Sidebar / Config Panel */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="bg-surface rounded-xl shadow-sm border border-primary/10 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 font-display">
            <Settings className="w-5 h-5 text-muted" />
            Configuração
          </h2>

          <div className="space-y-4">
            {/* Pillar Content Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                URL do Conteúdo Pilar <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={pillarUrl}
                onChange={(e) => setPillarUrl(e.target.value)}
                placeholder="https://exemplo.com/guia-completo"
                className="w-full p-2.5 rounded-lg border border-primary/20 text-sm focus:ring-2 focus:ring-primary/50 transition-colors bg-background focus:bg-surface outline-none"
              />
              <p className="mt-1 text-xs text-muted">
                Obrigatório. Será usado como referência central.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                URLs Satélites{" "}
                <span className="text-muted text-xs font-normal">
                  (Uma por linha)
                </span>
              </label>
              <textarea
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                placeholder={`https://exemplo.com/post-1\nhttps://exemplo.com/post-2`}
                className="w-full h-40 p-3 rounded-lg border border-primary/20 text-sm font-mono focus:ring-2 focus:ring-primary/50 transition-all resize-none bg-background focus:bg-surface outline-none"
              />
            </div>

            {/* Estratégia de Linkagem */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">
                Direção da Linkagem
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(["inlinks", "outlinks", "hybrid"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setStrategyMode(mode)}
                    className={cn(
                      "p-3 rounded-lg border text-sm font-medium transition-all text-left flex items-center gap-3",
                      strategyMode === mode
                        ? "bg-primary/5 border-primary text-primary ring-1 ring-primary/20"
                        : "bg-surface border-primary/10 text-muted hover:bg-background"
                    )}
                  >
                    <div className="p-1.5 bg-surface rounded border border-primary/10 shrink-0">
                      {mode === "hybrid" ? (
                        <Activity className="w-4 h-4" />
                      ) : mode === "outlinks" ? (
                        <ArrowRight className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold capitalize">
                        {mode === "inlinks"
                          ? "Inlinks (Padrão)"
                          : mode === "outlinks"
                          ? "Outlinks (Cluster)"
                          : "Híbrido"}
                      </div>
                      <div className="text-[10px] opacity-70 font-normal">
                        {mode === "inlinks"
                          ? "Satélites → Pilar"
                          : mode === "outlinks"
                          ? "Pilar → Satélites"
                          : "Bidirecional"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-primary/10 pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-sm text-muted hover:text-primary py-2 transition-colors"
              >
                <span className="font-medium">Configurações Avançadas</span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Max Inlinks por Página
                    </label>
                    <select
                      value={maxInlinks}
                      onChange={(e) => setMaxInlinks(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-primary/20 text-sm focus:ring-2 focus:ring-primary/50 bg-background outline-none"
                    >
                      {[1, 2, 3, 5, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} links
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={analyze}
              disabled={loading || !pillarUrl}
              className="w-full py-6 text-white rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Análise
                </>
              )}
            </Button>

            {error && (
              <div className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded border border-red-100 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5" />
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <h3 className="text-foreground font-semibold text-sm mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Modo:{" "}
            {strategyMode === "inlinks"
              ? "Inlinks (Padrão)"
              : strategyMode === "outlinks"
              ? "Outlinks (Cluster)"
              : "Híbrido (Bidirecional)"}
          </h3>
          <p className="text-muted text-xs leading-relaxed">
            {strategyMode === "inlinks" &&
              "Analisa URLs Satélites buscando oportunidades para linkar PARA a URL Pilar (Fortalece o Pilar)."}
            {strategyMode === "outlinks" &&
              "Analisa a URL Pilar buscando oportunidades para linkar PARA as URLs Satélites (Distribui Autoridade)."}
            {strategyMode === "hybrid" &&
              "Analisa bidirecionalmente: sugere links dos Satélites para o Pilar e do Pilar para os Satélites."}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-primary/10 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Oportunidades</p>
              <p className="text-2xl font-bold text-foreground">
                {totalOpportunities}
              </p>
            </div>
          </div>
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-primary/10 flex items-center gap-4">
            <div className="p-3 bg-background text-muted rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Score médio</p>
              <p className="text-2xl font-bold text-foreground">{avgScore}</p>
            </div>
          </div>
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-primary/10 flex items-center justify-between gap-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Layout className="w-6 h-6 text-muted" />
              <p className="text-sm text-muted font-medium">
                Exportar resultados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!results || results.length === 0}
                onClick={() => {
                  if (!results) return;
                  const csv = generateCSV(results, pillarUrl);
                  downloadCSV(csv, "inlinks_opportunities.csv");
                }}
              >
                CSV
              </Button>
              <Button
                variant="outline"
                disabled={!results || results.length === 0}
                onClick={() => {
                  if (!results) return;
                  const json = generateJSON(results);
                  downloadText(json, "inlinks_opportunities.json");
                }}
              >
                JSON
              </Button>
              <Button
                variant="outline"
                disabled={!results || results.length === 0}
                onClick={() => {
                  if (!results) return;
                  const md = generateMarkdown(results);
                  downloadText(md, "inlinks_opportunities.md");
                }}
              >
                Markdown
              </Button>
            </div>
          </div>
          <div className="md:col-span-4">
            {loading && (
              <div className="w-full bg-primary/10 rounded-lg h-3 overflow-hidden border border-primary/20">
                <div
                  className="h-3 bg-primary rounded"
                  style={{
                    width: `${progress}%`,
                    transition: "width 300ms linear",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Results/Tabs Area */}
        <div className="bg-surface rounded-xl shadow-sm border border-primary/10 min-h-[500px] flex flex-col">
          {/* Tabs Navigation */}
          <div className="border-b border-primary/10 px-2 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("resultados")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === "resultados"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              )}
            >
              <CheckCircle2 className="w-4 h-4" /> Resultados
            </button>
            <button
              onClick={() => setActiveTab("analise")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === "analise"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              )}
            >
              <BarChart3 className="w-4 h-4" /> Análise
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === "logs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              )}
            >
              <Terminal className="w-4 h-4" /> Logs
            </button>
          </div>

          <div className="p-6 flex-1">
            {/* TAB: RESULTADOS */}
            {activeTab === "resultados" &&
              (!results || results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted opacity-50 min-h-[300px]">
                  <Layout size={48} className="mb-4 text-primary/30" />
                  <p>Nenhum resultado ainda</p>
                  <span className="text-xs">
                    Inicie uma análise para ver as oportunidades.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 text-xs font-semibold text-muted px-2">
                    <div className="col-span-4">Origem / Destino</div>
                    <div className="col-span-4">Ação Recomendada</div>
                    <div className="col-span-2">Score</div>
                    <div className="col-span-2">Contexto/Motivo</div>
                  </div>
                  {results.map((r, i) => {
                    const isOutlink = r.origem === pillarUrl.trim();
                    const topic = (r as any).target_topic
                      ? (r as any).target_topic
                      : (r.reason || "").replace(/^Tópico:\s*/i, "") || "Geral";
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-4 p-4 border border-primary/10 rounded-xl bg-white hover:border-primary/30 transition-colors"
                      >
                        <div className="col-span-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isOutlink
                                  ? "bg-primary/10 text-primary"
                                  : "bg-background text-muted"
                              )}
                            >
                              <ArrowRight
                                className={cn(
                                  "w-4 h-4",
                                  !isOutlink && "rotate-180"
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-[10px] uppercase tracking-wider">
                                Origem {isOutlink ? "Pilar" : "Satélite"}
                              </div>
                              <a
                                href={r.origem}
                                target="_blank"
                                className="text-primary hover:underline break-words"
                              >
                                {r.origem}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isOutlink
                                  ? "bg-background text-muted"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              <ArrowRight
                                className={cn(
                                  "w-4 h-4",
                                  isOutlink && "rotate-180"
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-[10px] uppercase tracking-wider">
                                Destino {isOutlink ? "Satélite" : "Pilar"}
                              </div>
                              <a
                                href={r.destino}
                                target="_blank"
                                className="text-primary hover:underline break-words"
                              >
                                {r.destino}
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/10">
                              EXACT
                            </span>
                            <span className="text-[10px] px-2 py-1 rounded bg-background text-foreground border border-primary/10">
                              # {topic}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            {r.anchor}
                          </div>
                          <div className="text-sm text-foreground/80 italic bg-background p-3 rounded border-l-2 border-primary/30 line-clamp-4">
                            "
                            {r.trecho.split(r.anchor).map((part, idx, arr) => (
                              <span key={idx}>
                                {part}
                                {idx < arr.length - 1 && (
                                  <strong className="bg-yellow-100 text-yellow-800 px-1 rounded mx-0.5 border border-yellow-200 shadow-sm">
                                    {r.anchor}
                                  </strong>
                                )}
                              </span>
                            ))}
                            "
                          </div>
                        </div>
                        <div className="col-span-2 flex items-start">
                          <span className="text-primary font-bold text-lg">
                            {r.score.toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">
                            {r.reason ? r.reason : `Tópico: ${topic}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

            {/* TAB: ANÁLISE */}
            {activeTab === "analise" && (
              <div className="h-full flex flex-col">
                {!meta ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted opacity-50 min-h-[300px]">
                    <BarChart3 size={48} className="mb-4 text-primary/30" />
                    <p>Sem dados de análise</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-background p-6 rounded-lg border border-primary/10">
                        <h4 className="font-bold text-foreground mb-4">
                          Resumo da Execução
                        </h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex justify-between border-b border-primary/5 pb-2">
                            <span className="text-muted">Modo</span>
                            <span className="font-medium text-foreground capitalize">
                              {meta.mode}
                            </span>
                          </li>
                          <li className="flex justify-between border-b border-primary/5 pb-2">
                            <span className="text-muted">
                              Páginas Escaneadas
                            </span>
                            <span className="font-medium text-foreground">
                              {meta.scanned_pages}
                            </span>
                          </li>
                          <li className="flex justify-between border-b border-primary/5 pb-2">
                            <span className="text-muted">
                              Oportunidades Totais
                            </span>
                            <span className="font-medium text-primary">
                              {meta.total_opportunities}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-background p-6 rounded-lg border border-primary/10">
                        <h4 className="font-bold text-foreground mb-4">
                          Estrutura do Cluster
                        </h4>
                        {!cluster ? (
                          <div className="text-muted text-sm">Sem clusters</div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs text-muted mb-1">
                                Pilares Identificados
                              </div>
                              <ul className="space-y-1">
                                {cluster.pillars.map((p) => (
                                  <li key={p} className="text-sm">
                                    <a
                                      href={p}
                                      target="_blank"
                                      className="text-primary hover:underline"
                                    >
                                      {p}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-xs text-muted mb-1">
                                Distribuição de Tópicos
                              </div>
                              <div className="space-y-2">
                                {Object.entries(cluster.clusterIndex).map(
                                  ([topic, urls]) => (
                                    <div
                                      key={topic}
                                      className="flex items-center gap-3"
                                    >
                                      <span className="text-sm w-52 truncate">
                                        {topic}
                                      </span>
                                      <div className="flex-1 h-2 bg-primary/10 rounded">
                                        <div
                                          className="h-2 bg-primary rounded"
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              urls.length * 20
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted">
                                        {urls.length} páginas
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analyses &&
                        Object.entries(analyses).map(([url, a]) => (
                          <div
                            key={url}
                            className="p-6 rounded-lg border border-primary/10 bg-white space-y-3"
                          >
                            <div className="font-bold text-foreground">
                              {a.title || "Sem título"}
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              className="text-primary text-sm hover:underline"
                            >
                              {url}
                            </a>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-2 border border-primary/10 rounded">
                                <div className="text-muted">Intenção</div>
                                <div className="font-medium">{a.intencao}</div>
                              </div>
                              <div className="p-2 border border-primary/10 rounded">
                                <div className="text-muted">Funil</div>
                                <div className="font-medium">{a.funil}</div>
                              </div>
                              <div className="p-2 border border-primary/10 rounded">
                                <div className="text-muted">Tema Principal</div>
                                <div className="font-medium">{a.theme}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {a.clusters?.slice(0, 6).map((c, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/10"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LOGS */}
            {activeTab === "logs" && (
              <div className="h-full bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[500px] border border-slate-800">
                {logs.length === 0 ? (
                  <span className="text-slate-600">
                    Aguardando início do processo...
                  </span>
                ) : (
                  logs.map((log, i) => (
                    <div
                      key={i}
                      className="mb-1 text-slate-300 border-b border-slate-900/50 pb-0.5 last:border-0"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
