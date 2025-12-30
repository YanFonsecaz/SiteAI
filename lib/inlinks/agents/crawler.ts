import { cleanText, extractTitle, cleanMarkdown } from "@/lib/inlinks/utils/clean_text";
import { ExtractedContent } from "@/lib/inlinks/types";

/**
 * Helper para buscar conteúdo via Jina Reader quando o fetch direto falha
 */
async function fetchWithJina(
  url: string,
  defaultTitle = "Sem título"
): Promise<ExtractedContent | null> {
  try {
    // Jina Reader aceita a URL direta após o prefixo
    const readerUrl = `https://r.jina.ai/${url}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const readerResp = await fetch(readerUrl, {
      redirect: "follow",
      headers: {
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (readerResp.ok) {
      const readerText = await readerResp.text();
      const cleanedText = cleanMarkdown(readerText);
      const fallbackTitle = readerText.split("\n")[0] || defaultTitle;

      // Garantir que o título esteja no conteúdo para contexto da IA
      let finalContent = cleanedText;
      if (
        !cleanedText.trim().startsWith(fallbackTitle) &&
        !cleanedText.trim().startsWith("#")
      ) {
        finalContent = `# ${fallbackTitle}\n\n${cleanedText}`;
      }

      return {
        url,
        title: fallbackTitle,
        content: finalContent,
      };
    }
  } catch (error) {
    console.error(`Erro no Jina Reader para ${url}:`, error);
  }
  return null;
}

/**
 * Helper para buscar conteúdo via Puppeteer quando outros métodos falham (JS-heavy)
 */
async function fetchWithPuppeteer(
  url: string,
  defaultTitle = "Sem título"
): Promise<ExtractedContent | null> {
  let browser = null;
  try {
    console.log(`[Crawler] Iniciando Puppeteer para ${url}...`);
    // Import dinâmico para evitar problemas de dependência em ambientes que não suportam
    const puppeteer = await import("puppeteer");
    
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    
    // Timeout de 30s
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const html = await page.content();
    const title = (await page.title()) || defaultTitle;
    const content = await cleanText(html);

    await browser.close();

    if (content && content.trim().length > 100) {
      return {
        url,
        title,
        content: content.includes(title) ? content : `# ${title}\n\n${content}`,
        rawHtml: html
      };
    }
  } catch (error) {
    console.error(`Erro no Puppeteer para ${url}:`, error);
  } finally {
    if (browser) await browser.close();
  }
  return null;
}

/**
 * Busca HTML de uma URL e extrai título e texto limpo
 * @param url endereço da página
 * @returns conteúdo extraído com título e texto
 */
export async function extractContent(url: string): Promise<ExtractedContent> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        Referer: "https://www.google.com/",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(
        `[Crawler] Fetch direto falhou (${response.status}). Tentando Jina Reader...`
      );
      const jinaResult = await fetchWithJina(url);
      if (jinaResult) return jinaResult;

      console.warn(`[Crawler] Jina Reader falhou. Tentando Puppeteer...`);
      const puppeteerResult = await fetchWithPuppeteer(url);
      if (puppeteerResult) return puppeteerResult;

      throw new Error(
        `Falha ao acessar ${url}: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    const title = await extractTitle(html);
    const content = await cleanText(html);

    // Se o conteúdo veio muito curto (provavelmente JS renderizado), tenta alternativas
    if (!content || content.trim().length < 500) {
      console.warn(`[Crawler] Conteúdo insuficiente (${content?.length || 0} chars). Tentando alternativas...`);
      
      const jinaResult = await fetchWithJina(url, title);
      if (jinaResult && jinaResult.content.length > (content?.length || 0)) {
        return { ...jinaResult, rawHtml: html };
      }

      const puppeteerResult = await fetchWithPuppeteer(url, title);
      if (puppeteerResult) return puppeteerResult;
    }

    return {
      url,
      title,
      content: (title && content && !content.includes(title)) ? `# ${title}\n\n${content}` : content,
      rawHtml: html,
    };
  } catch (error) {
    console.error(`Erro ao extrair ${url}:`, error);
    
    // Tenta Jina
    const jinaResult = await fetchWithJina(url);
    if (jinaResult) return jinaResult;

    // Tenta Puppeteer
    const puppeteerResult = await fetchWithPuppeteer(url);
    if (puppeteerResult) return puppeteerResult;

    return { url, title: "Erro na extração", content: "" };
  }
}
