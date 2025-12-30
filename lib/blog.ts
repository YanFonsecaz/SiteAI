export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  coverImage: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "como-a-ia-esta-mudando-o-seo",
    title: "Como a IA está mudando o SEO em 2024",
    excerpt: "Descubra as novas tendências de otimização para motores de busca com a chegada de modelos de linguagem avançados.",
    content: `
      <p>A inteligência artificial não é mais o futuro do SEO, é o presente. Com a introdução do SGE (Search Generative Experience) pelo Google, a forma como otimizamos conteúdo está mudando drasticamente.</p>
      <h2>O fim das palavras-chave exatas?</h2>
      <p>Embora as palavras-chave ainda sejam importantes, a intenção de busca e a relevância semântica ganharam muito mais peso. O Google agora entende o contexto de uma forma muito mais humana.</p>
      <h2>Como se adaptar?</h2>
      <ul>
        <li>Foque em criar conteúdo profundo e original.</li>
        <li>Use dados estruturados para ajudar o Google a entender seu site.</li>
        <li>Otimize para a experiência do usuário (Core Web Vitals).</li>
      </ul>
    `,
    date: "2024-03-15",
    author: "Yan Tech",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
  },
  {
    slug: "guia-completo-core-web-vitals",
    title: "Guia Completo de Core Web Vitals para Desenvolvedores",
    excerpt: "Aprenda a otimizar o LCP, FID e CLS do seu site para garantir melhores posições no Google.",
    content: "<p>Core Web Vitals são um conjunto de métricas que o Google usa para medir a experiência do usuário em uma página web.</p>",
    date: "2024-03-10",
    author: "Ana SEO",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
  },
  {
    slug: "backlinks-em-2024",
    title: "Estratégias de Backlinks que funcionam hoje",
    excerpt: "Esqueça as técnicas antigas de link building. Veja o que realmente traz autoridade para seu domínio.",
    content: "<p>Construir backlinks de qualidade é mais sobre relacionamento e conteúdo de valor do que troca de links.</p>",
    date: "2024-03-05",
    author: "Carlos Marketing",
    coverImage: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=1000",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
