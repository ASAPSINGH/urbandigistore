import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_DATA_MAP } from '../src/data/seoData.ts';
import { BLOG_POSTS } from '../src/data/blogPosts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Export SEO data to JSON
const seoJsonPath = path.resolve(__dirname, '../../seo_calculators_data.json');
fs.writeFileSync(seoJsonPath, JSON.stringify(SEO_DATA_MAP, null, 2), 'utf-8');
console.log('✅ Exported seo_calculators_data.json');

// 2. Convert blog posts to markdown files
const blogDestDir = path.resolve(__dirname, '../../content/blog');
if (!fs.existsSync(blogDestDir)) {
  fs.mkdirSync(blogDestDir, { recursive: true });
}

BLOG_POSTS.forEach((post) => {
  // Convert "July 24, 2026" or similar to YYYY-MM-DD
  let dateStr = '2026-07-24';
  try {
    const d = new Date(post.publishDate);
    if (!isNaN(d.getTime())) {
      dateStr = d.toISOString().split('T')[0];
    }
  } catch (e) {
    // Fallback
  }

  // Format category to Title Case
  const categoryStr = post.category.charAt(0).toUpperCase() + post.category.slice(1);

  // Compile markdown content
  let md = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${post.description.replace(/"/g, '\\"')}"
date: ${dateStr}
category: ${categoryStr}
author: "${post.author.replace(/"/g, '\\"')}"
---

${post.summary}

`;

  // Key Takeaways
  if (post.keyTakeaways && post.keyTakeaways.length > 0) {
    md += `## Key Takeaways
${post.keyTakeaways.map((k) => `- ${k}`).join('\n')}

`;
  }

  // Sections
  post.sections.forEach((sec) => {
    md += `## ${sec.heading}

${sec.content}

`;
    if (sec.calloutText) {
      md += `> [!NOTE]
> **Use the Online Tool:** ${sec.calloutText} - [Open Calculator](/calculators/${sec.calloutToolId || ''})

`;
    }
  });

  // FAQs
  if (post.faqs && post.faqs.length > 0) {
    md += `## Frequently Asked Questions

`;
    post.faqs.forEach((faq) => {
      md += `### ${faq.question}
${faq.answer}

`;
    });
  }

  const filePath = path.join(blogDestDir, `${post.slug}.md`);
  fs.writeFileSync(filePath, md, 'utf-8');
  console.log(`✅ Saved blog post markdown: ${post.slug}.md`);
});
