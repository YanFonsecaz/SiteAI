import ToolTabs from "@/components/dashboard/ToolTabs";
import { Button } from "@/components/ui/Button";

const TrendsTool = () => (
    <div className="bg-surface p-8 rounded-xl border border-primary/10 shadow-sm">
       <h3 className="text-lg font-bold mb-6 font-display">Tópicos em Alta (Real-Time)</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {["Inteligência Artificial", "Marketing Digital 2024", "Automação de SEO", "Core Web Vitals Update"].map((topic, i) => (
               <div key={i} className="flex items-center justify-between p-6 bg-background rounded-lg border border-primary/5 hover:border-primary/30 cursor-pointer transition-colors">
                   <span className="font-medium text-lg">#{i + 1} {topic}</span>
                   <span className="text-green-500 font-bold text-sm">+{(Math.random() * 100).toFixed(0)}%</span>
               </div>
           ))}
       </div>
    </div>
);

const NewsTool = () => (
    <div className="space-y-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface p-6 rounded-xl border border-primary/10 shadow-sm">
                <div className="text-xs text-primary font-bold mb-2">NEWS • HÁ 2 HORAS</div>
                <h3 className="text-xl font-bold mb-2">Google anuncia nova atualização no algoritmo de busca</h3>
                <p className="text-muted mb-4">A mudança foca principalmente em conteúdo gerado por IA sem revisão humana...</p>
                <Button variant="link" className="p-0 h-auto">Ler análsie completa</Button>
            </div>
        ))}
    </div>
);

export default function TrendsPage() {
    return (
      <ToolTabs 
        title="Google Trends/News"
        description="Fique por dentro do que está acontecendo agora no seu nicho."
        tabs={[
          { id: "trending", label: "Em Alta", component: <TrendsTool /> },
          { id: "news", label: "Notícias Recentes", component: <NewsTool /> },
        ]}
      />
    );
  }
