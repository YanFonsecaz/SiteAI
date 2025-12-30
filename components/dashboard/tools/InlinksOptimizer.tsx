"use client";

import { useState } from "react";
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

    addLog("Iniciando análise de Inlinks...");
    addLog(`Modo selecionado: ${strategyMode}`);
    addLog(`URL Pilar: ${pillarUrl}`);
    addLog(`URLs Satélites identificadas: ${satelliteUrlsArray.length}`);

    try {
      addLog("Enviando requisição para API...");
      const res = await fetch("/api/analyze-inlinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": localStorage.getItem("openai_api_key") || "",
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

      if (!res.ok) {
        throw new Error(data.error || "Erro na análise");
      }

      // Log server-side errors if any
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((err: string) => addLog(`[ERRO API] ${err}`));
        if (data.opportunities.length === 0) {
          addLog("A análise falhou para todas as URLs.");
          setError("Falha na análise. Verifique os Logs para detalhes.");
          setActiveTab("logs");
        }
      }

      setResults(data.opportunities);
      setMeta(data.meta);

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
                <div className="space-y-4">
                  {results.map((r, i) => {
                    const isOutlink = r.origem === pillarUrl.trim();
                    return (
                      <div
                        key={i}
                        className="flex gap-4 p-4 border border-primary/10 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-colors bg-white"
                      >
                        <div className="mt-1">
                          {isOutlink ? (
                            <div
                              className="p-2 bg-primary/10 text-primary rounded-lg"
                              title="Outlink (Pilar -> Satélite)"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          ) : (
                            <div
                              className="p-2 bg-background text-muted rounded-lg"
                              title="Inlink (Satélite -> Pilar)"
                            >
                              <ArrowRight className="w-4 h-4 rotate-180" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                                <span className="text-muted uppercase tracking-wider">
                                  Origem:
                                </span>
                                <a
                                  href={r.origem}
                                  target="_blank"
                                  className="text-primary hover:underline truncate max-w-[300px] block"
                                >
                                  {r.origem}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="text-muted uppercase tracking-wider">
                                  Destino:
                                </span>
                                <a
                                  href={r.destino}
                                  target="_blank"
                                  className="text-primary hover:underline truncate max-w-[300px] block"
                                >
                                  {r.destino}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                {r.score.toFixed(1)} Score
                              </span>
                            </div>
                          </div>

                          <div className="bg-background p-3 rounded text-sm text-foreground/80 italic border-l-2 border-primary/30">
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
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <span className="text-xs text-muted">
                              Âncora sugerida:
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {r.anchor}
                            </span>
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
                          <span className="text-muted">Páginas Escaneadas</span>
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
