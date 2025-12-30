import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export const metadata = {
  title: "Planos e Preços - SEO.IA",
  description: "Escolha o plano ideal para alavancar seu tráfego orgânico.",
};

const plans = [
  {
    name: "Starter",
    price: "R$ 97",
    period: "/mês",
    description: "Para freelancers e pequenos sites.",
    features: ["5 Projetos", "10.000 Palavras-chave", "Auditoria Semanal", "Suporte por Email"],
    cta: "Começar Starter",
    featured: false,
  },
  {
    name: "Pro",
    price: "R$ 297",
    period: "/mês",
    description: "Para agências e empresas em crescimento.",
    features: ["20 Projetos", "50.000 Palavras-chave", "Auditoria Diária", "Conteúdo IA Ilimitado", "Suporte Prioritário"],
    cta: "Começar Pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Sob Consulta",
    period: "",
    description: "Para grandes operações e alta escala.",
    features: ["Projetos Ilimitados", "Palavras-chave Ilimitadas", "API Dedicada", "Gerente de Contas", "SLA Garantido"],
    cta: "Falar com Vendas",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <PageHeader 
        title="Preços Transparentes" 
        description="Invista no crescimento do seu negócio com planos que cabem no seu bolso."
      />
      
      <section className="py-20 px-4">
        <div className="container mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`relative p-8 rounded-2xl border flex flex-col transition-transform hover:scale-[1.02] duration-300 ${
                    plan.featured 
                      ? "bg-surface border-primary shadow-2xl shadow-primary/10 scale-105 z-10" 
                      : "bg-surface border-primary/10 hover:shadow-xl hover:shadow-primary/5"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Mais Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-display font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted text-sm mb-8">{plan.description}</p>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm">
                        <Check className="w-5 h-5 text-primary mr-3 shrink-0" />
                        <span className="text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant={plan.featured ? "primary" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </div>
              ))}
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
