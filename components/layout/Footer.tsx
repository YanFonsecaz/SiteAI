import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-primary/10 pt-16 pb-8 text-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-display text-2xl font-bold text-foreground tracking-wider">
              SEO<span className="text-primary">.IA</span>
            </Link>
            <p className="mt-4 text-muted text-sm leading-relaxed">
              Revolucionando o SEO com inteligência artificial. Aumente seu tráfego e domine as buscas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/features" className="hover:text-primary transition-colors">Funcionalidades</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Preços</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrações</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Carreiras</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} SEO.IA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
