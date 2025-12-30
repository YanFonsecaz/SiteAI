"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como a IA ajuda no SEO do meu site?",
    answer: "Nossa IA analisa milhões de dados de pesquisa em tempo real para identificar tendências, sugerir palavras-chave de alto potencial e até mesmo gerar conteúdo otimizado, economizando horas de trabalho manual."
  },
  {
    question: "Preciso ter conhecimentos técnicos para usar?",
    answer: "Não! Nossa plataforma foi desenhada para ser intuitiva. Traduzimos métricas complexas em ações simples e diretas que qualquer pessoa pode executar."
  },
  {
    question: "Existe período de fidelidade?",
    answer: "Não. Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas escondidas."
  },
  {
    question: "Vocês garantem a primeira posição no Google?",
    answer: "Nenhuma ferramenta pode garantir a primeira posição devido à natureza variável dos algoritmos do Google. No entanto, fornecemos as melhores ferramentas e dados para maximizar suas chances de alcançar o topo."
  },
  {
    question: "Posso testar antes de comprar?",
    answer: "Sim! Oferecemos um período de teste gratuito de 7 dias para você conhecer todas as funcionalidades da ferramenta."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-surface" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">Perguntas Frequentes</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Tire suas dúvidas sobre como nossa plataforma pode transformar o seu negócio.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={cn(
                "border rounded-xl transition-all duration-300 overflow-hidden",
                openIndex === index ? "border-primary bg-background shadow-md" : "border-primary/10 bg-white hover:border-primary/30"
              )}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={cn(
                  "text-lg font-medium transition-colors",
                  openIndex === index ? "text-primary" : "text-foreground"
                )}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted" />
                )}
              </button>
              
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="p-6 pt-0 text-muted leading-relaxed border-t border-primary/5">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
