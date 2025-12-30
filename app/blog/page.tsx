import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { blogPosts } from "@/lib/blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - SEO.IA",
  description: "Dicas, tendências e estratégias de SEO com Inteligência Artificial.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 px-4 border-b border-primary/10 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">Blog & Insights</h1>
          <p className="text-xl text-muted">
            Fique à frente da concorrência com nossas análises profundas sobre o futuro das buscas.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card
                key={post.slug}
                title={post.title}
                description={post.excerpt}
                image={post.coverImage}
                date={new Date(post.date).toLocaleDateString('pt-BR')}
                href={`/blog/${post.slug}`}
              />
            ))}
          </div>
          
          {/* Pagination Placeholder */}
          <div className="mt-16 flex justify-center space-x-2">
             <span className="px-4 py-2 border border-primary bg-primary text-white rounded-md cursor-default">1</span>
             <span className="px-4 py-2 border border-primary/20 text-muted rounded-md hover:border-primary hover:text-primary cursor-pointer transition-colors">2</span>
             <span className="px-4 py-2 border border-primary/20 text-muted rounded-md hover:border-primary hover:text-primary cursor-pointer transition-colors">3</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
