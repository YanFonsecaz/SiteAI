import ToolTabs from "@/components/dashboard/ToolTabs";
import { Button } from "@/components/ui/Button";

// Mock Tool Components
const StructuredDataTool = () => (
  <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm max-w-2xl">
    <h3 className="text-lg font-bold mb-4 font-display">Gerador de Schema Markup</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted mb-1">Tipo de Dado</label>
        <select className="w-full bg-background border border-primary/20 rounded-md px-4 py-2">
           <option>Artigo</option>
           <option>Produto</option>
           <option>FAQ</option>
           <option>Negócio Local</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-muted mb-1">URL</label>
        <input type="url" placeholder="https://..." className="w-full bg-background border border-primary/20 rounded-md px-4 py-2" />
      </div>
      <Button>Gerar Código JSON-LD</Button>
    </div>
  </div>
);

const RedirectsTool = () => (
  <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm max-w-4xl">
    <h3 className="text-lg font-bold mb-4 font-display">Verificador de Redirecionamentos</h3>
    <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Cole uma lista de URLs..." className="flex-1 bg-background border border-primary/20 rounded-md px-4 py-2" />
        <Button>Analisar</Button>
    </div>
    <div className="text-center py-12 border-2 border-dashed border-primary/10 rounded-lg text-muted">
       Nenhum redirecionamento analisado recentemente.
    </div>
  </div>
);

export default function TechnicalPage() {
  return (
    <ToolTabs 
      title="SEO Técnico"
      description="Ferramentas para otimização e auditoria técnica do seu site."
      tabs={[
        { id: "schema", label: "Dados Estruturados", component: <StructuredDataTool /> },
        { id: "redirects", label: "Redirecionamentos", component: <RedirectsTool /> },
      ]}
    />
  );
}
