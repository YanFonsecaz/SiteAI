# PRD - SiteIA: Plataforma de SEO & IA

## 1. Visão Geral
O **SiteIA** é uma plataforma SaaS (Software as a Service) focada em automação de tarefas críticas de SEO através de Inteligência Artificial. O objetivo central é tracionar sites através de otimização de inlinks (links internos), geração de conteúdo estratégico e análise de tendências, tudo sob uma interface moderna e intuitiva.

## 2. Personas e Usuários-Alvo
- **Especialistas em SEO**: Profissionais que gerenciam clusters de conteúdo e precisam otimizar a autoridade interna (PageRank).
- **Editores de Conteúdo**: Interessados em gerar artigos rápidos baseados em pilares temáticos.
- **Dono de Site/Nicho**: Usuários que buscam uma solução "tudo em um" para melhorar o ranking sem expertise técnica profunda.

## 3. Requisitos Funcionais

### 3.1. Dashboard & Interface (UI/UX)
- **Visual**: Design premium com glassmorphism, paleta Taupe/Bege (#F5F5F0) e modo escuro sutil.
- **Navegação**: Sidebar fixa com acesso a "Conteúdo", "Configurações" e "Suporte".
- **Componentes**: Uso intensivo de abas interativas (`ToolTabs`) para separar funcionalidades dentro de uma mesma ferramenta.

### 3.2. Otimizador de Inlinks (Core Feature)
Esta é a ferramenta mais madura do sistema. Ela analisa a relação entre um "Conteúdo Pilar" e múltiplos "Conteúdos Satélites".
- **Modos de Operação**:
    - **Inlinks (Padrão)**: Sugere links dos satélites para o pilar (fortalecer o pilar).
    - **Outlinks (Cluster)**: Sugere links do pilar para os satélites (distribuir autoridade).
    - **Híbrido**: Sugestões bidirecionais.
- **Crawler Inteligente**:
    1. Tenta `fetch` direto (rápido).
    2. Fallback para `Jina Reader` (contorno de bloqueios).
    3. Fallback para `Puppeteer` (extração em sites JS-heavy).
- **Lógica de IA**:
    - Usa LLMs (OpenAI/Claude/Gemini) para identificar as melhores frases (âncoras) no contexto para inserir o link.
    - Atribui um `Confidence Score` baseado na semântica.
- **Exibição**: Abas de "Resultados" (cards), "Análise" (tabela detalhada) e "Logs" (processamento em tempo real).

### 3.3. Configurações & Persistência
- **Gerenciamento de Chaves de API**: Suporte a OpenAI, Anthropic, Gemini, Perplexity e DeepSeek.
- **Persistência**: Integração com **Supabase** via Server Actions. As chaves são armazenadas de forma segura e associadas a um `siteia_user_id`.
- **Seleção de Modelo**: Interface para o usuário escolher o modelo (ex: GPT-4o, Claude 3.5 Sonnet) por provedor.

### 3.4. Ferramentas em Roadmap (Mocks Implementados)
- **Gerador de Artigos**: Criação de posts baseados em keywords.
- **Trends Master**: Monitoramento de tendências de busca.
- **Auto-Image**: Geração de banners promocionais.

## 4. Requisitos Não Funcionais
- **Performance**: Tempo de resposta de crawling < 30s por página (via timeouts controlados).
- **Segurança**: Chaves de API nunca devem ser expostas no frontend em texto limpo (uso de headers específicos e DB persistence).
- **Escalabilidade**: Arquitetura baseada em Next.js API Routes (Serverless ready).

## 5. Arquitetura Técnica

### 5.1. Tech Stack
- **Framework**: Next.js 14 (App Router).
- **Linguagem**: TypeScript.
- **Estilização**: Tailwind CSS.
- **Banco de Dados**: Supabase (Auth/Postgres).
- **Navegação Real**: Puppeteer (Headless Browser).
- **Ícones**: Lucide React.

### 5.2. Estrutura de Pastas
- `/app`: Rotas e Server Actions.
- `/components`: UI kit e componentes de ferramentas.
- `/lib/inlinks`: Lógica core (Agentes, Crawler, Utils).
- `/app/api`: Endpoints REST para processamento pesado.

### 5.3. Schema do Banco de Dados (Supabase)
Tabela: `user_settings`
- `user_id` (text): ID único do usuário.
- `openai_key` (text): Chave de API (criptografada em repouso).
- `openai_model` (text): Modelo padrão.
- `provider` (text): Provedor selecionado.

## 6. Próximos Passos para a Equipe de Dev
1.  **Finalizar Ferramentas de Conteúdo**: Transformar os mocks de "Gerador de Artigos" e "Trends" em funcionalidades reais usando os agentes existentes.
2.  **Auth Real**: Implementar Supabase Auth para substituir o sistema de UUID local.
3.  **Histórico de Análises**: Criar tabelas no Supabase para salvar os resultados das análises de links por usuário.
4.  **Sistema de Exportação**: Implementar download de CSV/PDF para os resultados do inlinks.

---
**PRD Version**: 1.0 (Initial Documentation)
**Responsável**: Antigravity AI
