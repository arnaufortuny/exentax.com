import type { Express } from "express";

const BASE_URL = "https://easyusllc.com";
const LINKTREE_URL = "https://creamostullc.com";

const PUBLIC_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/servicios", priority: 0.9, changefreq: "weekly" },
  { path: "/faq", priority: 0.8, changefreq: "monthly" },
  { path: "/contacto", priority: 0.7, changefreq: "monthly" },
  { path: "/llc/formation", priority: 0.9, changefreq: "weekly" },
  { path: "/llc/maintenance", priority: 0.8, changefreq: "weekly" },
  { path: "/tools/price-calculator", priority: 0.7, changefreq: "monthly" },
  { path: "/tools/invoice", priority: 0.6, changefreq: "monthly" },
  { path: "/tools/operating-agreement", priority: 0.6, changefreq: "monthly" },
  { path: "/legal/terminos", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/privacidad", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/reembolsos", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/cookies", priority: 0.4, changefreq: "yearly" },
];

const LINKTREE_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/tu-llc", priority: 0.9, changefreq: "weekly" },
];

export function generateSitemap(): string {
  const today = new Date().toISOString().split("T")[0];
  
  const urls = PUBLIC_ROUTES.map(route => `
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function generateLinktreeSitemap(): string {
  const today = new Date().toISOString().split("T")[0];
  
  const urls = LINKTREE_ROUTES.map(route => `
  <url>
    <loc>${LINKTREE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function setupSitemapRoute(app: Express): void {
  app.get("/sitemap.xml", (req, res) => {
    const host = req.get('host') || '';
    const isLinktree = host.includes('creamostullc');
    
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.send(isLinktree ? generateLinktreeSitemap() : generateSitemap());
  });
  
  app.get("/robots.txt", (req, res) => {
    const host = req.get('host') || '';
    const isLinktree = host.includes('creamostullc');
    
    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "public, max-age=86400");
    
    const robotsContent = isLinktree 
      ? `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${LINKTREE_URL}/sitemap.xml`
      : `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /auth/
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /auth/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /auth/
Crawl-delay: 2

Sitemap: ${BASE_URL}/sitemap.xml`;
    
    res.send(robotsContent);
  });
}
