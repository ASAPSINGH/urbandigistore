import { TOOLS_LIST } from '../data/toolsList';
import { SEO_DATA_MAP, SEOData } from '../data/seoData';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

export const DOMAIN = 'https://urbandigistore.com';
export const SITE_NAME = 'UrbanDigiStore';

export interface SEOMetaData {
  title: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  h1: string;
  faqs?: { question: string; answer: string }[];
  applicationCategory?: string;
  articleData?: {
    headline: string;
    description: string;
    author: string;
    publishDate: string;
    image: string;
  };
}

export function getToolSEO(toolId: string): SEOMetaData {
  const tool = TOOLS_LIST.find((t) => t.id === toolId);
  const seoData: SEOData | undefined = SEO_DATA_MAP[toolId];

  const title = seoData?.title || `${tool?.name || 'Instant Calculator'} | ${SITE_NAME}`;
  const metaDescription = seoData?.metaDescription || tool?.description || 'Free, instant high-precision online calculator with step-by-step formulas and amortization tables.';
  const keywords = seoData?.keywords || tool?.keywords || [toolId, 'calculator online', 'urbandigistore', 'urbandigistore.com'];
  const canonicalUrl = `${DOMAIN}/calculators/${toolId}`;
  const h1 = seoData?.h1 || tool?.name || 'Online Calculator Engine';

  const categoryMap: Record<string, string> = {
    finance: 'FinanceApplication',
    health: 'HealthApplication',
    math: 'EducationalApplication',
    time: 'BusinessApplication',
    unit: 'UtilitiesApplication',
  };

  return {
    title: `${title} | ${SITE_NAME}`,
    metaDescription,
    keywords,
    canonicalUrl,
    ogType: 'website',
    ogTitle: `${tool?.name || title} - Free Online Tool`,
    ogDescription: metaDescription,
    ogUrl: canonicalUrl,
    h1,
    faqs: seoData?.faqs || [],
    applicationCategory: categoryMap[tool?.category || 'finance'] || 'WebApplication',
  };
}

export function getBlogSEO(articleId: string): SEOMetaData {
  const post = BLOG_POSTS.find((p) => p.id === articleId || p.slug === articleId);

  if (!post) {
    return getHomepageSEO();
  }

  const canonicalUrl = `${DOMAIN}/blog/${post.slug}`;

  return {
    title: `${post.title} | ${SITE_NAME} Guides`,
    metaDescription: post.description,
    keywords: [post.category, 'calculator guide', 'financial analysis', 'health formula', 'urbandigistore'],
    canonicalUrl,
    ogType: 'article',
    ogTitle: post.title,
    ogDescription: post.description,
    ogUrl: canonicalUrl,
    h1: post.title,
    faqs: post.faqs || [],
    articleData: {
      headline: post.title,
      description: post.description,
      author: post.author,
      publishDate: post.publishDate,
      image: post.featuredImage,
    },
  };
}

export function getHomepageSEO(): SEOMetaData {
  return {
    title: `UrbanDigiStore | Free Online Instant Calculators & Digital Utility Suite`,
    metaDescription: `UrbanDigiStore offers high-precision online calculators: Mortgage Amortization, Auto Loans, Paycheck Tax, BMI & TDEE, TI-84 Scientific Graphing, Work Time Clock, and Unit Converters. 100% free and private.`,
    keywords: ['calculator online', 'urbandigistore', 'urbandigistore.com', 'urban digi store', 'mortgage calculator', 'car payment calculator', 'bmi calculator', 'tdee calculator', 'paycheck calculator', 'ti 84 calculator', 'time card calculator', 'unit converter'],
    canonicalUrl: DOMAIN,
    ogType: 'website',
    ogTitle: `UrbanDigiStore | 50+ High-Precision Free Online Calculators`,
    ogDescription: `Calculate mortgage payments, auto loans, BMI health charts, TI-84 function graphs, paycheck taxes, timesheets, and unit conversions instantly at UrbanDigiStore.com.`,
    ogUrl: DOMAIN,
    h1: 'UrbanDigiStore — Instant Precision Calculation Suite',
  };
}

export function generateJSONLDSchemas(meta: SEOMetaData): object[] {
  const schemas: object[] = [];

  // 1. Organization & Publisher Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: DOMAIN,
    logo: `${DOMAIN}/icon.png`,
    sameAs: [
      'https://twitter.com/urbandigistore',
      'https://facebook.com/urbandigistore',
      'https://github.com/urbandigistore',
    ],
  });

  // 2. WebSite Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: DOMAIN,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DOMAIN}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  // 3. Application or Article Schema
  if (meta.articleData) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: meta.articleData.headline,
      description: meta.articleData.description,
      author: {
        '@type': 'Person',
        name: meta.articleData.author,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${DOMAIN}/icon.png`,
        },
      },
      datePublished: meta.articleData.publishDate,
      image: meta.articleData.image,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': meta.canonicalUrl,
      },
    });
  } else if (meta.canonicalUrl !== DOMAIN) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: meta.h1,
      url: meta.canonicalUrl,
      applicationCategory: meta.applicationCategory || 'UtilitiesApplication',
      operatingSystem: 'All',
      description: meta.metaDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });
  }

  // 4. FAQPage Schema
  if (meta.faqs && meta.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: meta.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}

export function generateSitemapXml(): string {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // All Tools (41+ tools)
  TOOLS_LIST.forEach((tool) => {
    const priority = tool.isPopular ? '0.95' : '0.85';
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/calculators/${tool.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/?tool=${tool.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // All Blog Articles
  BLOG_POSTS.forEach((post) => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/?blog=${post.slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}
