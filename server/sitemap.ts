import type { Express } from "express";

const BASE_URL = "https://exentax.com";

const SUPPORTED_LANGS = ["es", "en", "fr", "de", "it", "pt", "ca"];

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
  { path: "/tools/csv-generator", priority: 0.5, changefreq: "monthly" },
  { path: "/legal/terminos", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/privacidad", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/reembolsos", priority: 0.4, changefreq: "yearly" },
  { path: "/legal/cookies", priority: 0.4, changefreq: "yearly" },
  { path: "/links", priority: 0.6, changefreq: "monthly" },
  { path: "/start", priority: 0.9, changefreq: "weekly" },
  { path: "/agendar-consultoria", priority: 0.8, changefreq: "weekly" },
];

export function generateSitemap(): string {
  const today = new Date().toISOString().split("T")[0];
  
  const urls = PUBLIC_ROUTES.map(route => {
    const loc = `${BASE_URL}${route.path}`;
    const hreflangs = SUPPORTED_LANGS.map(
      lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}" />`
    ).join("\n");
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`;

    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
${hreflangs}
${xDefault}
  </url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}


export function setupSitemapRoute(app: Express): void {
  app.get("/sitemap.xml", (_req, res) => {
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.send(generateSitemap());
  });
  
  app.get("/robots.txt", (_req, res) => {
    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "public, max-age=86400");
    
    const robotsContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /admin
Disallow: /admin/*
Disallow: /auth/forgot-password
Disallow: /uploads/
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /logo-icon.png
Allow: /favicon.png
Allow: /og-image.png

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-images.xml

Host: ${BASE_URL}`;
    
    res.send(robotsContent);
  });
}
