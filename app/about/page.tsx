import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import { Users, Target, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Sobre Nós - SEO.IA",
  description: "Conheça a equipe e a missão por trás da plataforma de SEO mais avançada do mercado.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <PageHeader 
        title="Nossa Missão" 
        description="Democratizar o acesso às primeiras posições do Google utilizando a inteligência artificial mais avançada do mundo."
      />
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
           <div className="prose prose-lg max-w-none text-muted">
              <h2 className="font-display text-3xl mb-6 text-foreground">A Revolução do SEO</h2>
              <p className="mb-8">
                 Fundada em 2024, a SEO.IA nasceu da frustração de ver excelentes empresas perderem espaço para concorrentes apenas por não dominarem os aspectos técnicos dos motores de busca.
                 Nós combinamos décadas de experiência em SEO com os recentes avanços em LLMs (Large Language Models) para criar uma ferramenta que não apenas analisa, mas executa.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-surface border border-primary/10 p-8 rounded-xl text-center shadow-sm">
                 <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                 <h3 className="text-xl font-bold mb-2 text-foreground">Precisão</h3>
                 <p className="text-muted">Dados baseados em milhões de SERPs analisadas em tempo real.</p>
              </div>
              <div className="bg-surface border border-primary/10 p-8 rounded-xl text-center shadow-sm">
                 <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                 <h3 className="text-xl font-bold mb-2 text-foreground">Foco no Usuário</h3>
                 <p className="text-muted">Ferramentas complexas tornadas simples para qualquer um usar.</p>
              </div>
              <div className="bg-surface border border-primary/10 p-8 rounded-xl text-center shadow-sm">
                 <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                 <h3 className="text-xl font-bold mb-2 text-foreground">Ética</h3>
                 <p className="text-muted">Práticas 100% White Hat e transparentes com os motores de busca.</p>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
