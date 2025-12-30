import ToolTabs from "@/components/dashboard/ToolTabs";
import { Button } from "@/components/ui/Button";
import InlinksOptimizer from "@/components/dashboard/tools/InlinksOptimizer";

const ArticleGenerator = () => (
    <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm">
      <h3 className="text-lg font-bold mb-4 font-display">SEO Writer IA</h3>
      <div className="space-y-4 max-w-2xl">
        <div>
           <label className="block text-sm font-medium text-muted mb-1">Palavra-chave Principal</label>
           <input type="text" placeholder="Ex: inteligência artificial para marketing" className="w-full bg-background border border-primary/20 rounded-md px-4 py-2" />
        </div>
        <div>
           <label className="block text-sm font-medium text-muted mb-1">Tom de Voz</label>
           <select className="w-full bg-background border border-primary/20 rounded-md px-4 py-2">
             <option>Profissional</option>
             <option>Descontraído</option>
             <option>Acadêmico</option>
           </select>
        </div>
        <Button>Gerar Artigo</Button>
      </div>
    </div>
);

const KeywordAnalysis = () => (
    <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm">
       <h3 className="text-lg font-bold mb-4 font-display">Explorador de Palavras-Chave</h3>
       <div className="flex gap-4 mb-8">
           <input type="text" placeholder="Digite um termo para pesquisar..." className="flex-1 bg-background border border-primary/20 rounded-md px-4 py-2" />
           <Button>Pesquisar Volume</Button>
       </div>
       <div className="space-y-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-background rounded-lg border border-primary/5">
                <div className="w-1/3 h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/6 h-4 bg-gray-200 animate-pulse rounded"></div>
             </div>
           ))}
       </div>
    </div>
);

export default function ContentPage() {
    return (
      <ToolTabs 
        title="SEO Conteúdo"
        description="Crie e otimize conteúdo com o poder da Inteligência Artificial."
        tabs={[
          { id: "writer", label: "Gerador de Artigos", component: <ArticleGenerator /> },
          { id: "inlinks", label: "Otimizador de Inlinks", component: <InlinksOptimizer /> },
          { id: "keywords", label: "Análise de Palavras-Chave", component: <KeywordAnalysis /> },
        ]}
      />
    );
  }
