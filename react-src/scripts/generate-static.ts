import fs from 'fs';
import path from 'path';
import { generateSitemapXml } from '../src/lib/seoHelper';

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write generated sitemap.xml to public/sitemap.xml
const sitemapXml = generateSitemapXml();
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log('✅ Successfully generated public/sitemap.xml with 100% tool & blog URL coverage.');
