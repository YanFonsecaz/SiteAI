export function normalizeUrlForMetadata(url: string): string {
  try {
    const urlToParse = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlToParse);
    let hostname = urlObj.hostname.replace(/^www\./, "").toLowerCase();
    let pathname = urlObj.pathname.replace(/\/$/, "");
    if (pathname === "") pathname = "/";
    return `https://${hostname}${pathname}`;
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, "").split("#")[0];
  }
}

export function normalizeUrlForComparison(url: string): string {
  try {
    const urlToParse = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlToParse);
    const hostname = urlObj.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = urlObj.pathname.replace(/\/$/, "");
    return `${hostname}${pathname}`;
  } catch {
    return url
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/$/, "");
  }
}
