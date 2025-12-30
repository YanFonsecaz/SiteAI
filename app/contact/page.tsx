import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contato - SEO.IA",
  description: "Entre em contato com nossa equipe.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <PageHeader 
        title="Fale Conosco" 
        description="Estamos prontos para ajudar sua empresa a crescer."
      />
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Contact Info */}
              <div>
                 <h2 className="font-display text-2xl font-bold mb-8 text-foreground">Informações de Contato</h2>
                 <div className="space-y-6">
                    <div className="flex items-start">
                       <Mail className="w-6 h-6 text-primary mt-1 mr-4" />
                       <div>
                          <h3 className="font-bold mb-1 text-foreground">Email</h3>
                          <p className="text-muted">contato@seo.ia</p>
                          <p className="text-muted">suporte@seo.ia</p>
                       </div>
                    </div>
                    <div className="flex items-start">
                       <Phone className="w-6 h-6 text-primary mt-1 mr-4" />
                       <div>
                          <h3 className="font-bold mb-1 text-foreground">Telefone</h3>
                          <p className="text-muted">+55 (11) 9999-9999</p>
                       </div>
                    </div>
                    <div className="flex items-start">
                       <MapPin className="w-6 h-6 text-primary mt-1 mr-4" />
                       <div>
                          <h3 className="font-bold mb-1 text-foreground">Escritório</h3>
                          <p className="text-muted">Av. Paulista, 1000 - São Paulo, SP</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Form */}
              <div className="bg-surface border border-primary/10 p-8 rounded-2xl shadow-md">
                 <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-medium mb-2 text-muted">Nome</label>
                          <input type="text" className="w-full bg-background border border-primary/10 rounded-md px-4 py-3 focus:border-primary outline-none transition-colors text-foreground" placeholder="Seu nome" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium mb-2 text-muted">Sobrenome</label>
                          <input type="text" className="w-full bg-background border border-primary/10 rounded-md px-4 py-3 focus:border-primary outline-none transition-colors text-foreground" placeholder="Seu sobrenome" />
                       </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted">Email</label>
                        <input type="email" className="w-full bg-background border border-primary/10 rounded-md px-4 py-3 focus:border-primary outline-none transition-colors text-foreground" placeholder="seu@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted">Mensagem</label>
                        <textarea className="w-full bg-background border border-primary/10 rounded-md px-4 py-3 focus:border-primary outline-none transition-colors h-32 text-foreground" placeholder="Como podemos ajudar?"></textarea>
                    </div>
                    <Button className="w-full" size="lg">Enviar Mensagem</Button>
                 </form>
              </div>

           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
