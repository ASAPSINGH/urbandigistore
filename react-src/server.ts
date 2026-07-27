import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getToolSEO,
  getBlogSEO,
  getHomepageSEO,
  generateJSONLDSchemas,
  generateSitemapXml,
  SEOMetaData,
  DOMAIN,
} from './src/lib/seoHelper';
import { TOOLS_LIST } from './src/data/toolsList';
import { BLOG_POSTS } from './src/data/blogPosts';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Dynamic Sitemap Endpoint
  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.send(generateSitemapXml());
  });

  // Robots.txt
  app.get('/robots.txt', (_req, res) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.sendFile(robotsPath);
    } else {
      res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml`);
    }
  });

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', brand: 'ASAPCalculator', timestamp: new Date().toISOString() });
  });

  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // HTML Pre-rendering & Metadata Injection Handler
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl || req.url;

      // Skip static assets
      if (url.includes('.') && !url.includes('?')) {
        return next();
      }

      let meta: SEOMetaData = getHomepageSEO();

      // Check query params: ?tool=... or ?blog=...
      const urlObj = new URL(url, DOMAIN);
      const queryTool = urlObj.searchParams.get('tool');
      const queryBlog = urlObj.searchParams.get('blog');

      if (queryTool) {
        meta = getToolSEO(queryTool);
      } else if (queryBlog) {
        meta = getBlogSEO(queryBlog);
      } else {
        // Check clean routes
        const pathname = urlObj.pathname.toLowerCase().replace(/\/$/, '');

        if (pathname.startsWith('/calculators/')) {
          const toolId = pathname.replace('/calculators/', '');
          meta = getToolSEO(toolId);
        } else if (pathname.startsWith('/blog/')) {
          const articleId = pathname.replace('/blog/', '');
          meta = getBlogSEO(articleId);
        } else if (pathname.length > 1) {
          // Direct tool path e.g. /mortgage or /bmi
          const toolId = pathname.replace('/', '');
          const matchingTool = TOOLS_LIST.find((t) => t.id === toolId);
          const matchingBlog = BLOG_POSTS.find((b) => b.id === toolId || b.slug === toolId);

          if (matchingTool) {
            meta = getToolSEO(matchingTool.id);
          } else if (matchingBlog) {
            meta = getBlogSEO(matchingBlog.id);
          }
        }
      }

      // Read index.html template
      let template = '';
      if (!isProd) {
        const indexPath = path.join(process.cwd(), 'index.html');
        template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
        template = fs.readFileSync(distIndexPath, 'utf-8');
      }

      // Build JSON-LD Scripts String
      const jsonLDSchemas = generateJSONLDSchemas(meta);
      const jsonLDScripts = jsonLDSchemas
        .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n    ');

      // Replace Title
      let html = template.replace(
        /<title>.*?<\/title>/gi,
        `<title>${escapeHtml(meta.title)}</title>`
      );

      // Replace or Inject Meta Description
      const metaDescTag = `<meta name="description" content="${escapeHtml(meta.metaDescription)}" />`;
      if (html.includes('<meta name="description"')) {
        html = html.replace(/<meta name="description" content=".*?"\s*\/?>/gi, metaDescTag);
      } else {
        html = html.replace('</head>', `  ${metaDescTag}\n</head>`);
      }

      // Replace or Inject Meta Keywords
      const metaKeywordsTag = `<meta name="keywords" content="${escapeHtml(meta.keywords.join(', '))}" />`;
      if (html.includes('<meta name="keywords"')) {
        html = html.replace(/<meta name="keywords" content=".*?"\s*\/?>/gi, metaKeywordsTag);
      } else {
        html = html.replace('</head>', `  ${metaKeywordsTag}\n</head>`);
      }

      // Replace or Inject Canonical Tag
      const canonicalTag = `<link rel="canonical" href="${meta.canonicalUrl}" />`;
      if (html.includes('<link rel="canonical"')) {
        html = html.replace(/<link rel="canonical" href=".*?"\s*\/?>/gi, canonicalTag);
      } else {
        html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
      }

      // Replace or Inject OG Tags
      html = replaceOrInjectMeta(html, 'og:title', meta.ogTitle);
      html = replaceOrInjectMeta(html, 'og:description', meta.ogDescription);
      html = replaceOrInjectMeta(html, 'og:url', meta.ogUrl);
      html = replaceOrInjectMeta(html, 'twitter:title', meta.ogTitle);
      html = replaceOrInjectMeta(html, 'twitter:description', meta.ogDescription);

      // Inject JSON-LD
      html = html.replace('</head>', `  ${jsonLDScripts}\n</head>`);

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (err) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(err);
      }
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ASAPCalculator server running on http://0.0.0.0:${PORT}`);
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function replaceOrInjectMeta(html: string, property: string, content: string): string {
  const isOg = property.startsWith('og:');
  const attr = isOg ? 'property' : 'name';
  const tagRegex = new RegExp(`<meta\\s+${attr}="${property}"\\s+content=".*?"\\s*\\/?>`, 'gi');
  const newTag = `<meta ${attr}="${property}" content="${escapeHtml(content)}" />`;

  if (tagRegex.test(html)) {
    return html.replace(tagRegex, newTag);
  } else {
    return html.replace('</head>', `  ${newTag}\n</head>`);
  }
}

startServer();
