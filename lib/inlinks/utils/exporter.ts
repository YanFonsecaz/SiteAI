"use client";

import { AnchorOpportunity } from "@/lib/inlinks/types";

export function generateCSV(
  data: AnchorOpportunity[],
  pillarUrl: string
): string {
  if (!data || data.length === 0) return "";

  const sanitize = (str: string | number | undefined) => {
    if (str === undefined || str === null) return "";
    const stringValue = String(str);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  let domain = "";
  try {
    domain = new URL(pillarUrl).hostname;
  } catch {
    domain = pillarUrl;
  }

  const today = new Date().toLocaleDateString("pt-BR");

  const lines = [
    `"","","Auditoria de Linkagem Interna: ${domain} ","","","","","","","","",""`,
    `"","","","","","","","","","","",""`,
    `"","","","","","","","","","","",""`,
    `"#1","URL da Página Pilar","","","Produto/Serviço","","","","","Data de Implementação","",""`,
    `${sanitize(pillarUrl)},"","","","","","","","","${today}","",""`,
    `"","","","","","","","","","","",""`,
    `"","URL Onde Inserir (Origem)","","Texto Âncora","URL Destino (Alvo)","Score","Instrução/Parágrafo","Contexto na Origem","Otimização Implementada","Justificativa"`,
  ];

  data.forEach((row, index) => {
    const instruction = `Inserir a marcação do hiperlink na âncora sinalizada em negrito:\n\n${row.trecho}`;
    const line = [
      index + 1,
      sanitize(row.origem),
      "",
      sanitize(row.anchor),
      sanitize(row.destino),
      sanitize(row.score?.toFixed(2) || "0.00"),
      sanitize(instruction),
      sanitize(row.trecho),
      "TRUE",
      sanitize(row.reason || row.pillar_context || "N/A"),
    ].join(",");
    lines.push(line);
  });

  return "\uFEFF" + lines.join("\n");
}

export function downloadCSV(
  content: string,
  filename: string = "inlinks_opportunities.csv"
) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateJSON(data: AnchorOpportunity[]): string {
  return JSON.stringify(data, null, 2);
}

export function generateMarkdown(data: AnchorOpportunity[]): string {
  const header = `| Origem | Âncora | Tipo | Destino | Score | Motivo |\n|---|---|---|---|---|---|`;
  const rows = data.map((r) => {
    const score = r.score?.toFixed(2) || "0.00";
    const reason = r.reason ?? "";
    const type = r.type ?? "exact";
    return `| ${r.origem} | ${r.anchor} | ${type} | ${r.destino} | ${score} | ${reason} |`;
  });
  return [header, ...rows].join("\n");
}

export function downloadText(content: string, filename: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
