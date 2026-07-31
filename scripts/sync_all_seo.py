#!/usr/bin/env python3
"""
Syncs all 83 tools from toolsList.ts into seoData.ts and seo_calculators_data.json.
Ensures every tool has category property set and complete SEO metadata.
"""
import re, json, os

TOOLS_LIST_PATH = 'react-src/src/data/toolsList.ts'
SEO_DATA_TS_PATH = 'react-src/src/data/seoData.ts'
SEO_JSON_PATH = 'seo_calculators_data.json'

def parse_tools():
    content = open(TOOLS_LIST_PATH, 'r').read()
    # Match tool objects cleanly by splitting on { id: '...'
    blocks = content.split("id: '")[1:]
    tools = []
    for block in blocks:
        tool_id = block.split("'")[0]
        cat_match = re.search(r"category:\s*'([^']+)'", block)
        name_match = re.search(r"name:\s*(['\"])(.*?)\1", block)
        desc_match = re.search(r"description:\s*(['\"])(.*?)\1", block)
        cat = cat_match.group(1) if cat_match else 'everyday'
        name = name_match.group(2) if name_match else tool_id
        desc = desc_match.group(2) if desc_match else name
        tools.append({
            'id': tool_id,
            'name': name,
            'category': cat,
            'description': desc,
            'keywords': [tool_id.replace('-', ' '), name.lower()]
        })
    return tools

def main():
    tools = parse_tools()
    print(f"Parsed {len(tools)} tools from toolsList.ts")

    # Load existing JSON if available
    existing_json = {}
    if os.path.exists(SEO_JSON_PATH):
        try:
            existing_json = json.load(open(SEO_JSON_PATH, 'r'))
        except Exception as e:
            print("Could not parse existing JSON:", e)

    seo_map = {}
    for t in tools:
        tid = t['id']
        ext = existing_json.get(tid, {})
        
        seo_map[tid] = {
            'toolId': tid,
            'category': t['category'],
            'title': ext.get('title', f"{t['name']} (2026)"),
            'metaDescription': ext.get('metaDescription', t['description']),
            'keywords': ext.get('keywords', t['keywords']),
            'h1': ext.get('h1', t['name']),
            'directAnswer': ext.get('directAnswer', f"{t['name']} calculates instant, accurate results based on standard formulas and inputs."),
            'formula': ext.get('formula', {
                'title': f"{t['name']} Formula",
                'expression': 'Result = f(Inputs)',
                'explanation': 'Standard mathematical and empirical formulas applied to inputs.'
            }),
            'keyTakeaways': ext.get('keyTakeaways', [
                f"{t['name']} provides real-time calculations.",
                'All computations run client-side in your browser for privacy.',
                'Export and share calculations instantly.'
            ]),
            'faqs': ext.get('faqs', [
                {
                    'question': f"How does the {t['name']} work?",
                    'answer': f"Enter your input values in the fields above. The {t['name']} will immediately calculate and display the output results."
                }
            ])
        }

    # Write to seo_calculators_data.json
    with open(SEO_JSON_PATH, 'w') as f:
        json.dump(seo_map, f, indent=2, ensure_ascii=False)
    print(f"✅ Updated {SEO_JSON_PATH} with {len(seo_map)} tools with category field.")

    # Write seoData.ts
    ts_content = f"""export interface SEOData {{
  toolId: string;
  category: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  directAnswer: string;
  formula: {{
    title: string;
    expression: string;
    explanation: string;
  }};
  keyTakeaways: string[];
  faqs: {{
    question: string;
    answer: string;
  }}[];
}}

export const SEO_DATA_MAP: Record<string, SEOData> = {json.dumps(seo_map, indent=2, ensure_ascii=False)};
"""
    with open(SEO_DATA_TS_PATH, 'w') as f:
        f.write(ts_content)
    print(f"✅ Updated {SEO_DATA_TS_PATH} with {len(seo_map)} tools.")

if __name__ == '__main__':
    main()
