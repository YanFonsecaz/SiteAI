import { Zap, Target, BarChart3, Search, FileText, Globe } from "lucide-react";

const features = [
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: "Análise de Palavras-Chave",
    description: "Descubra termos inexplorados com alto potencial de tráfego usando nossa IA preditiva.",
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Geração de Conteúdo",
    description: "Crie artigos otimizados completos em segundos que passam nos detectores de IA.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Auditoria Técnica",
    description: "Identifique e corrija erros técnicos que estão impedindo seu site de rankear.",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    title: "Monitoramento de Ranking",
    description: "Acompanhe suas posições diariamente com relatórios detalhados e alertas de mudança.",
  },
  {
    icon: <Globe className="w-8 h-8 text-primary" />,
    title: "SEO Local e Global",
    description: "Otimize para buscas locais ou expanda internacionalmente com suporte a 40 idiomas.",
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Otimização de Velocidade",
    description: "Sugestões automáticas para melhorar o Core Web Vitals e a experiência do usuário.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-surface relative" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">Tudo o que você precisa</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Uma suíte completa de ferramentas alimentadas por inteligência artificial para cobrir todas as frentes do SEO moderno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-background border border-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-6 bg-primary/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 font-display">{feature.title}</h3>
              <p className="text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
