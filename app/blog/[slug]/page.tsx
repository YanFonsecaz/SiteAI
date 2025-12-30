import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { getPostBySlug, blogPosts } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post não encontrado" };
  
  return {
    title: `${post.title} - SEO.IA`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      
      <article className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar para o Blog
          </Link>
          
          <div className="mb-10">
            <div className="flex items-center space-x-4 text-sm text-muted mb-6">
                <span className="text-primary font-bold">{post.author}</span>
                <span>•</span>
                <time>{new Date(post.date).toLocaleDateString('pt-BR')}</time>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-6 text-foreground">
              {post.title}
            </h1>
            <p className="text-xl text-muted leading-relaxed font-light">
               {post.excerpt}
            </p>
          </div>

          <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12 border border-primary/10 shadow-lg">
             <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div 
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted prose-a:text-primary prose-strong:text-foreground prose-li:text-muted"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-16 pt-8 border-t border-primary/10">
             <h3 className="text-2xl font-bold mb-6 font-display text-foreground">Gostou deste artigo?</h3>
             <div className="bg-surface p-8 rounded-2xl border border-primary/10 shadow-sm text-center">
                <p className="mb-6 text-muted">Inscreva-se na nossa newsletter para receber as melhores dicas de SEO diretamente na sua caixa de entrada.</p>
                <div className="flex gap-4 justify-center max-w-md mx-auto">
                    <input type="email" placeholder="Seu e-mail" className="flex-1 bg-background border border-primary/20 rounded-md px-4 py-2 text-foreground" />
                    <Button>Inscrever-se</Button>
                </div>
             </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
