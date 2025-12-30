import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      <Hero />
      <Features />
      <FAQ />
      <section className="py-24 bg-background border-y border-primary/10">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display text-foreground">Pronto para dominar o topo das buscas?</h2>
            <p className="text-muted mb-8 text-lg">Junte-se a mais de 1000 empresas que usam SEO.IA</p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    className="flex-1 px-4 py-3 rounded-md bg-surface border border-primary/20 text-foreground focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                />
                <button className="px-8 py-3 bg-primary text-white font-bold rounded-md hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                    Começar
                </button>
            </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
