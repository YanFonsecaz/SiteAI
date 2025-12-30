import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[80px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
          Domine o Google com <br />
          <span className="text-primary relative inline-block">
            Inteligência Artificial
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" fill="currentColor" />
            </svg>
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Nossa plataforma analisa milhões de dados em segundos para criar a estratégia de SEO perfeita para o seu negócio. Elegância e performance em um só lugar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing">
            <Button size="lg" className="w-full sm:w-auto text-lg shadow-xl shadow-primary/20">
              Começar Agora Grátis
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg hover:bg-primary/5">
              Ver Como Funciona
            </Button>
          </Link>
        </div>

        {/* Floating UI Element / Mockup Placeholder */}
        <div className="mt-20 relative mx-auto max-w-5xl rounded-xl border border-primary/20 bg-surface/50 backdrop-blur-sm p-4 shadow-2xl shadow-primary/5">
           <div className="aspect-video rounded-lg bg-white overflow-hidden flex items-center justify-center border border-primary/10 shadow-inner">
              <p className="text-muted font-mono text-sm tracking-widest uppercase">[Interface Minimalista do Dashboard]</p>
           </div>
        </div>
      </div>
    </section>
  );
}
