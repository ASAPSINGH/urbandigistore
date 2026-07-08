import json
import os
import glob
import markdown
from flask import Flask, render_template, abort, Response, request, jsonify

app = Flask(__name__)

# Load structured SEO data
seo_data_path = os.path.join(os.path.dirname(__file__), 'seo_data.json')
with open(seo_data_path, 'r') as f:
    seo_data = json.load(f)

# Helper function to load and parse blog posts
def get_blog_posts():
    blog_dir = os.path.join(os.path.dirname(__file__), 'content', 'blog')
    posts = []
    if not os.path.exists(blog_dir):
        return posts
        
    for filepath in glob.glob(os.path.join(blog_dir, '*.md')):
        slug = os.path.basename(filepath).replace('.md', '')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        meta = {}
        body = content
        if content.startswith('title:') or '---' in content:
            parts = content.split('---', 1)
            header = parts[0]
            body = parts[1] if len(parts) > 1 else ''
            for line in header.split('\n'):
                line = line.strip()
                if not line or ':' not in line:
                    continue
                k, v = line.split(':', 1)
                meta[k.strip().lower()] = v.strip()
                
        html_content = markdown.markdown(body, extensions=['tables'])
        posts.append({
            'slug': slug,
            'title': meta.get('title', slug.replace('-', ' ').title()),
            'description': meta.get('description', ''),
            'date': meta.get('date', '2026-07-08'),
            'category': meta.get('category', 'General'),
            'author': meta.get('author', 'Admin'),
            'content': html_content,
            'excerpt': meta.get('description', '')[:140] + '...' if len(meta.get('description', '')) > 140 else meta.get('description', '')
        })
    posts.sort(key=lambda x: x['date'], reverse=True)
    return posts


# Helper function to generate SEO metadata
def get_seo_context(tool_key, **kwargs):
    tool_conf = seo_data['tools'][tool_key]
    template = tool_conf['template']
    
    # Construct replacements
    replacements = {}
    for k, v in kwargs.items():
        replacements[f"{k}_lower"] = v.lower()
        replacements[f"{k}_upper"] = v.upper()
        # Convert hyphenated values to Title Case (e.g. 'facebook-ads' -> 'Facebook Ads')
        replacements[f"{k}_title"] = v.replace('-', ' ').title()
        replacements[k] = v
        
    # Apply format insertions
    meta_title = template['meta_title'].format(**replacements)
    meta_description = template['meta_description'].format(**replacements)
    h1 = template['h1'].format(**replacements)
    h2 = template['h2'].format(**replacements)
    description = template['description'].format(**replacements)
    
    steps = [step.format(**replacements) for step in template['steps']]
    faqs = []
    for faq in template['faqs']:
        faqs.append({
            'q': faq['q'].format(**replacements),
            'a': faq['a'].format(**replacements)
        })
        
    # Check if there is an explicit override for this URL slug
    slug = request.path.lstrip('/')
    if slug in seo_data.get('overrides', {}):
        override = seo_data['overrides'][slug]
        if 'meta_title' in override:
            meta_title = override['meta_title']
        if 'meta_description' in override:
            meta_description = override['meta_description']
            
    # Generate related links dynamically (Variation-to-Variation Spoke Linking)
    related_links = []
    category = tool_conf.get('category', '')
    
    if tool_key == 'image-converter':
        current_in = kwargs.get('input_format', '')
        current_out = kwargs.get('output_format', '')
        for out_fmt in tool_conf['params']['output_format']:
            if out_fmt != current_out and out_fmt != current_in:
                related_links.append({
                    'title': f"{current_in.upper()} to {out_fmt.upper()}",
                    'url': f"/convert-{current_in}-to-{out_fmt}"
                })
        for in_fmt in tool_conf['params']['input_format']:
            if in_fmt != current_in and in_fmt != current_out:
                related_links.append({
                    'title': f"{in_fmt.upper()} to {current_out.upper()}",
                    'url': f"/convert-{in_fmt}-to-{current_out}"
                })
    elif tool_key == 'image-cropper':
        current_ps = kwargs.get('platform_size', '')
        for ps in tool_conf['params']['platform_size']:
            if ps != current_ps:
                related_links.append({
                    'title': f"Crop for {ps.replace('-', ' ').title()}",
                    'url': f"/crop-image-for-{ps}"
                })
    elif tool_key == 'utm-builder':
        current_p = kwargs.get('platform', '')
        for p in tool_conf['params']['platform']:
            if p != current_p:
                related_links.append({
                    'title': f"UTM for {p.replace('-ads', '').replace('-', ' ').title()}",
                    'url': f"/utm-builder-for-{p}"
                })
    elif tool_key == 'whatsapp-generator':
        current_c = kwargs.get('country', '')
        for c in tool_conf['params']['country']:
            if c != current_c:
                related_links.append({
                    'title': f"Link for {c.replace('-', ' ').title()}",
                    'url': f"/whatsapp-link-generator-for-{c}"
                })
    elif tool_key == 'json-formatter':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Format for {uc.replace('-', ' ').title()}",
                    'url': f"/format-json-for-{uc}"
                })
    elif tool_key == 'position-calculator':
        current_ac = kwargs.get('asset_class', '')
        for ac in tool_conf['params']['asset_class']:
            if ac != current_ac:
                related_links.append({
                    'title': f"Sizing for {ac.replace('-', ' ').title()}",
                    'url': f"/position-size-calculator-{ac}"
                })
    elif tool_key == 'fibonacci-calculator':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Fibonacci: {uc.replace('-', ' ').title()}",
                    'url': f"/fibonacci-retracement-calculator-{uc}"
                })
    elif tool_key == 'character-counter':
        current_p = kwargs.get('platform', '')
        for p in tool_conf['params']['platform']:
            if p != current_p:
                related_links.append({
                    'title': f"Counter for {p.replace('-', ' ').title()}",
                    'url': f"/character-counter-for-{p}"
                })
    elif tool_key == 'cpm-calculator':
        current_ch = kwargs.get('channel', '')
        for ch in tool_conf['params']['channel']:
            if ch != current_ch:
                related_links.append({
                    'title': f"CPM for {ch.replace('-ads', '').replace('-', ' ').title()}",
                    'url': f"/cpm-calculator-for-{ch}"
                })
    elif tool_key == 'base64-converter':
        current_ft = kwargs.get('file_type', '')
        for ft in tool_conf['params']['file_type']:
            if ft != current_ft:
                related_links.append({
                    'title': f"Decode to {ft.upper()}",
                    'url': f"/decode-base64-to-{ft}"
                })

    related_links = related_links[:6]

    # Generate category sibling links dynamically
    sibling_tools = []
    for k, v in seo_data['tools'].items():
        if k != tool_key and v.get('category') == category:
            first_param_key = list(v['params'].keys())[0]
            first_param_val = v['params'][first_param_key][0]
            sibling_slug = v['slug_pattern'].replace(f"<{first_param_key}>", first_param_val)
            sibling_tools.append({
                'name': v['name'],
                'url': sibling_slug
            })
            
    return {
        'tool_key': tool_key,
        'meta_title': meta_title,
        'meta_description': meta_description,
        'h1': h1,
        'h2': h2,
        'description': description,
        'steps': steps,
        'faqs': faqs,
        'params': kwargs,
        'aeo_definition': tool_conf.get('aeo_definition', ''),
        'geo_reference': tool_conf.get('geo_reference', ''),
        'technical_comparison': tool_conf.get('technical_comparison', {}),
        'affiliate_partner': tool_conf.get('affiliate_partner', None),
        'related_links': related_links,
        'sibling_tools': sibling_tools
    }

@app.route('/')
def home():
    # Pass tools dictionary to render categories and direct links to programmatic pages
    return render_template('home.html', tools=seo_data['tools'])

@app.route('/convert-<input_format>-to-<output_format>')
def image_converter(input_format, output_format):
    tool = seo_data['tools']['image-converter']
    if input_format not in tool['params']['input_format'] or output_format not in tool['params']['output_format']:
        abort(404)
    ctx = get_seo_context('image-converter', input_format=input_format, output_format=output_format)
    return render_template('tool_template.html', **ctx)

@app.route('/crop-image-for-<platform_size>')
def image_cropper(platform_size):
    tool = seo_data['tools']['image-cropper']
    if platform_size not in tool['params']['platform_size']:
        abort(404)
    ctx = get_seo_context('image-cropper', platform_size=platform_size)
    return render_template('tool_template.html', **ctx)

@app.route('/utm-builder-for-<platform>')
def utm_builder(platform):
    tool = seo_data['tools']['utm-builder']
    if platform not in tool['params']['platform']:
        abort(404)
    ctx = get_seo_context('utm-builder', platform=platform)
    return render_template('tool_template.html', **ctx)

@app.route('/whatsapp-link-generator-for-<country>')
def whatsapp_generator(country):
    tool = seo_data['tools']['whatsapp-generator']
    if country not in tool['params']['country']:
        abort(404)
    ctx = get_seo_context('whatsapp-generator', country=country)
    return render_template('tool_template.html', **ctx)

@app.route('/format-json-for-<use_case>')
def json_formatter(use_case):
    tool = seo_data['tools']['json-formatter']
    if use_case not in tool['params']['use_case']:
        abort(404)
    ctx = get_seo_context('json-formatter', use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/position-size-calculator-<asset_class>')
def position_calculator(asset_class):
    tool = seo_data['tools']['position-calculator']
    if asset_class not in tool['params']['asset_class']:
        abort(404)
    ctx = get_seo_context('position-calculator', asset_class=asset_class)
    return render_template('tool_template.html', **ctx)

@app.route('/fibonacci-retracement-calculator-<use_case>')
def fibonacci_calculator(use_case):
    tool = seo_data['tools']['fibonacci-calculator']
    if use_case not in tool['params']['use_case']:
        abort(404)
    ctx = get_seo_context('fibonacci-calculator', use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/character-counter-for-<platform>')
def character_counter(platform):
    tool = seo_data['tools']['character-counter']
    if platform not in tool['params']['platform']:
        abort(404)
    ctx = get_seo_context('character-counter', platform=platform)
    return render_template('tool_template.html', **ctx)

@app.route('/cpm-calculator-for-<channel>')
def cpm_calculator(channel):
    tool = seo_data['tools']['cpm-calculator']
    if channel not in tool['params']['channel']:
        abort(404)
    ctx = get_seo_context('cpm-calculator', channel=channel)
    return render_template('tool_template.html', **ctx)

@app.route('/decode-base64-to-<file_type>')
def base64_converter(file_type):
    tool = seo_data['tools']['base64-converter']
    if file_type not in tool['params']['file_type']:
        abort(404)
    ctx = get_seo_context('base64-converter', file_type=file_type)
    return render_template('tool_template.html', **ctx)

@app.route('/sitemap.xml')
def sitemap():
    base_url = request.url_root.rstrip('/')
    urls = []
    
    # 1. Home
    urls.append(f"{base_url}/")
    
    # 2. Image Converter
    ic = seo_data['tools']['image-converter']
    for inf in ic['params']['input_format']:
        for outf in ic['params']['output_format']:
            urls.append(f"{base_url}/convert-{inf}-to-{outf}")
            
    # 3. Image Cropper
    icr = seo_data['tools']['image-cropper']
    for ps in icr['params']['platform_size']:
        urls.append(f"{base_url}/crop-image-for-{ps}")
        
    # 4. UTM Builder
    utm = seo_data['tools']['utm-builder']
    for p in utm['params']['platform']:
        urls.append(f"{base_url}/utm-builder-for-{p}")
        
    # 5. WhatsApp Generator
    wa = seo_data['tools']['whatsapp-generator']
    for c in wa['params']['country']:
        urls.append(f"{base_url}/whatsapp-link-generator-for-{c}")
        
    # 6. JSON Formatter
    jf = seo_data['tools']['json-formatter']
    for uc in jf['params']['use_case']:
        urls.append(f"{base_url}/format-json-for-{uc}")
        
    # 7. Position Size Calculator
    pc = seo_data['tools']['position-calculator']
    for ac in pc['params']['asset_class']:
        urls.append(f"{base_url}/position-size-calculator-{ac}")
        
    # 8. Fibonacci Calculator
    fc = seo_data['tools']['fibonacci-calculator']
    for uc in fc['params']['use_case']:
        urls.append(f"{base_url}/fibonacci-retracement-calculator-{uc}")

    # 9. Character Counter
    cc = seo_data['tools']['character-counter']
    for p in cc['params']['platform']:
        urls.append(f"{base_url}/character-counter-for-{p}")

    # 10. CPM Calculator
    cpm = seo_data['tools']['cpm-calculator']
    for ch in cpm['params']['channel']:
        urls.append(f"{base_url}/cpm-calculator-for-{ch}")

    # 11. Base64 File Converter
    b64 = seo_data['tools']['base64-converter']
    for ft in b64['params']['file_type']:
        urls.append(f"{base_url}/decode-base64-to-{ft}")
        
    # 12. Blog Pages
    urls.append(f"{base_url}/blog")
    for post in get_blog_posts():
        urls.append(f"{base_url}/blog/{post['slug']}")
        
    # Render XML Structure
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url in urls:
        xml_content += f'  <url>\n    <loc>{url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    xml_content += '</urlset>'
    
    return Response(xml_content, mimetype='application/xml')

@app.route('/blog')
def blog_index():
    posts = get_blog_posts()
    return render_template('blog/index.html', posts=posts)

@app.route('/blog/<slug>')
def blog_post(slug):
    posts = get_blog_posts()
    post = next((p for p in posts if p['slug'] == slug), None)
    if not post:
        abort(404)
    return render_template('blog/post.html', post=post)

@app.route('/robots.txt')
def robots():
    base_url = request.url_root.rstrip('/')
    content = f"User-agent: *\nAllow: /\nSitemap: {base_url}/sitemap.xml\n"
    return Response(content, mimetype='text/plain')

@app.route('/googlenH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY.html')
def google_verification():
    return "google-site-verification: googlenH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY.html"

@app.route('/google419e02c86ce25995.html')
def google_verification_new():
    return "google-site-verification: google419e02c86ce25995.html"

@app.route('/subscribe', methods=['POST'])
def subscribe():
    import csv
    import re
    from datetime import datetime
    
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required.'}), 400
        
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400
        
    subscribers_file = os.path.join(os.path.dirname(__file__), 'subscribers.csv')
    existing = set()
    if os.path.exists(subscribers_file):
        try:
            with open(subscribers_file, 'r', newline='') as f:
                reader = csv.reader(f)
                for row in reader:
                    if row:
                        existing.add(row[0].strip().lower())
        except Exception:
            pass
            
    if email.lower() in existing:
        return jsonify({'success': False, 'message': 'You are already subscribed!'}), 200
        
    try:
        file_exists = os.path.exists(subscribers_file)
        with open(subscribers_file, 'a', newline='') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(['Email', 'Subscription Date'])
            writer.writerow([email, datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')])
    except Exception:
        return jsonify({'success': False, 'message': 'Server error. Please try again later.'}), 500
        
    return jsonify({'success': True, 'message': 'Successfully subscribed! Welcome to the matrix.'}), 200

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
