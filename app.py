import json
import os
import glob
import markdown
import uuid
from flask import Flask, render_template, abort, Response, request, jsonify, redirect, url_for

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


# Consolidated URL Paths Mapping
CONSOLIDATED_PATHS = {
    'image-converter': '/image-converter',
    'image-cropper': '/image-cropper',
    'utm-builder': '/utm-builder',
    'whatsapp-generator': '/whatsapp-link-generator',
    'json-formatter': '/json-formatter',
    'position-calculator': '/position-size-calculator',
    'fibonacci-calculator': '/fibonacci-calculator',
    'character-counter': '/character-counter',
    'cpm-calculator': '/cpm-calculator',
    'base64-converter': '/base64-file-converter'
}

# Helper function to generate SEO metadata
def get_seo_context(tool_key, slug=None, **kwargs):
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
    if slug is None:
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
                    'url': f"/image-converter?input_format={current_in}&output_format={out_fmt}"
                })
        for in_fmt in tool_conf['params']['input_format']:
            if in_fmt != current_in and in_fmt != current_out:
                related_links.append({
                    'title': f"{in_fmt.upper()} to {current_out.upper()}",
                    'url': f"/image-converter?input_format={in_fmt}&output_format={current_out}"
                })
    elif tool_key == 'image-cropper':
        current_ps = kwargs.get('platform_size', '')
        for ps in tool_conf['params']['platform_size']:
            if ps != current_ps:
                related_links.append({
                    'title': f"Crop for {ps.replace('-', ' ').title()}",
                    'url': f"/image-cropper?platform_size={ps}"
                })
    elif tool_key == 'utm-builder':
        current_p = kwargs.get('platform', '')
        for p in tool_conf['params']['platform']:
            if p != current_p:
                related_links.append({
                    'title': f"UTM for {p.replace('-ads', '').replace('-', ' ').title()}",
                    'url': f"/utm-builder?platform={p}"
                })
    elif tool_key == 'whatsapp-generator':
        current_c = kwargs.get('country', '')
        for c in tool_conf['params']['country']:
            if c != current_c:
                related_links.append({
                    'title': f"Link for {c.replace('-', ' ').title()}",
                    'url': f"/whatsapp-link-generator?country={c}"
                })
    elif tool_key == 'json-formatter':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Format for {uc.replace('-', ' ').title()}",
                    'url': f"/json-formatter?use_case={uc}"
                })
    elif tool_key == 'position-calculator':
        current_ac = kwargs.get('asset_class', '')
        for ac in tool_conf['params']['asset_class']:
            if ac != current_ac:
                related_links.append({
                    'title': f"Sizing for {ac.replace('-', ' ').title()}",
                    'url': f"/position-size-calculator?asset_class={ac}"
                })
    elif tool_key == 'fibonacci-calculator':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Fibonacci: {uc.replace('-', ' ').title()}",
                    'url': f"/fibonacci-calculator?use_case={uc}"
                })
    elif tool_key == 'character-counter':
        current_p = kwargs.get('platform', '')
        for p in tool_conf['params']['platform']:
            if p != current_p:
                related_links.append({
                    'title': f"Counter for {p.replace('-', ' ').title()}",
                    'url': f"/character-counter?platform={p}"
                })
    elif tool_key == 'cpm-calculator':
        current_ch = kwargs.get('channel', '')
        for ch in tool_conf['params']['channel']:
            if ch != current_ch:
                related_links.append({
                    'title': f"CPM for {ch.replace('-ads', '').replace('-', ' ').title()}",
                    'url': f"/cpm-calculator?channel={ch}"
                })
    elif tool_key == 'base64-converter':
        current_ft = kwargs.get('file_type', '')
        for ft in tool_conf['params']['file_type']:
            if ft != current_ft:
                related_links.append({
                    'title': f"Decode to {ft.upper()}",
                    'url': f"/base64-file-converter?file_type={ft}"
                })

    related_links = related_links[:6]

    # Generate category sibling links dynamically
    sibling_tools = []
    for k, v in seo_data['tools'].items():
        if k != tool_key and v.get('category') == category:
            sibling_tools.append({
                'name': v['name'],
                'url': CONSOLIDATED_PATHS.get(k, '#')
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

@app.context_processor
def inject_ga_id():
    ga_id = os.environ.get('GA_MEASUREMENT_ID')
    if not ga_id and not app.testing:
        ga_id = 'G-7F1SCZWSCX'
    return {
        'ga_measurement_id': ga_id
    }

@app.route('/')
def home():
    # Pass tools dictionary to render categories and direct links to programmatic pages
    return render_template('home.html', tools=seo_data['tools'])

# --- Consolidated Routes & Redirects ---

@app.route('/image-converter')
def consolidated_image_converter():
    input_format = request.args.get('input_format', 'png')
    output_format = request.args.get('output_format', 'webp')
    tool = seo_data['tools']['image-converter']
    if input_format not in tool['params']['input_format'] or output_format not in tool['params']['output_format']:
        input_format = 'png'
        output_format = 'webp'
    slug = f"convert-{input_format}-to-{output_format}"
    ctx = get_seo_context('image-converter', slug=slug, input_format=input_format, output_format=output_format)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-<input_format>-to-<output_format>')
def image_converter_redirect(input_format, output_format):
    tool = seo_data['tools']['image-converter']
    if input_format not in tool['params']['input_format'] or output_format not in tool['params']['output_format']:
        abort(404)
    return redirect(url_for('consolidated_image_converter', input_format=input_format, output_format=output_format), code=301)


@app.route('/image-cropper')
def consolidated_image_cropper():
    platform_size = request.args.get('platform_size', 'instagram-post')
    tool = seo_data['tools']['image-cropper']
    if platform_size not in tool['params']['platform_size']:
        platform_size = 'instagram-post'
    slug = f"crop-image-for-{platform_size}"
    ctx = get_seo_context('image-cropper', slug=slug, platform_size=platform_size)
    return render_template('tool_template.html', **ctx)

@app.route('/crop-image-for-<platform_size>')
def image_cropper_redirect(platform_size):
    tool = seo_data['tools']['image-cropper']
    if platform_size not in tool['params']['platform_size']:
        abort(404)
    return redirect(url_for('consolidated_image_cropper', platform_size=platform_size), code=301)


@app.route('/utm-builder')
def consolidated_utm_builder():
    platform = request.args.get('platform', 'facebook-ads')
    tool = seo_data['tools']['utm-builder']
    if platform not in tool['params']['platform']:
        platform = 'facebook-ads'
    slug = f"utm-builder-for-{platform}"
    ctx = get_seo_context('utm-builder', slug=slug, platform=platform)
    return render_template('tool_template.html', **ctx)

@app.route('/utm-builder-for-<platform>')
def utm_builder_redirect(platform):
    tool = seo_data['tools']['utm-builder']
    if platform not in tool['params']['platform']:
        abort(404)
    return redirect(url_for('consolidated_utm_builder', platform=platform), code=301)


@app.route('/whatsapp-link-generator')
def consolidated_whatsapp_generator():
    country = request.args.get('country', 'united-states')
    tool = seo_data['tools']['whatsapp-generator']
    if country not in tool['params']['country']:
        country = 'united-states'
    slug = f"whatsapp-link-generator-for-{country}"
    ctx = get_seo_context('whatsapp-generator', slug=slug, country=country)
    return render_template('tool_template.html', **ctx)

@app.route('/whatsapp-link-generator-for-<country>')
def whatsapp_generator_redirect(country):
    tool = seo_data['tools']['whatsapp-generator']
    if country not in tool['params']['country']:
        abort(404)
    return redirect(url_for('consolidated_whatsapp_generator', country=country), code=301)


@app.route('/json-formatter')
def consolidated_json_formatter():
    use_case = request.args.get('use_case', 'rest-api')
    tool = seo_data['tools']['json-formatter']
    if use_case not in tool['params']['use_case']:
        use_case = 'rest-api'
    slug = f"format-json-for-{use_case}"
    ctx = get_seo_context('json-formatter', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/format-json-for-<use_case>')
def json_formatter_redirect(use_case):
    tool = seo_data['tools']['json-formatter']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_json_formatter', use_case=use_case), code=301)


@app.route('/position-size-calculator')
def consolidated_position_calculator():
    asset_class = request.args.get('asset_class', 'forex-trading')
    tool = seo_data['tools']['position-calculator']
    if asset_class not in tool['params']['asset_class']:
        asset_class = 'forex-trading'
    slug = f"position-size-calculator-{asset_class}"
    ctx = get_seo_context('position-calculator', slug=slug, asset_class=asset_class)
    return render_template('tool_template.html', **ctx)

@app.route('/position-size-calculator-<asset_class>')
def position_calculator_redirect(asset_class):
    tool = seo_data['tools']['position-calculator']
    if asset_class not in tool['params']['asset_class']:
        abort(404)
    return redirect(url_for('consolidated_position_calculator', asset_class=asset_class), code=301)


@app.route('/fibonacci-calculator')
def consolidated_fibonacci_calculator():
    use_case = request.args.get('use_case', 'stock-trends')
    tool = seo_data['tools']['fibonacci-calculator']
    if use_case not in tool['params']['use_case']:
        use_case = 'stock-trends'
    slug = f"fibonacci-retracement-calculator-{use_case}"
    ctx = get_seo_context('fibonacci-calculator', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/fibonacci-retracement-calculator-<use_case>')
def fibonacci_calculator_redirect(use_case):
    tool = seo_data['tools']['fibonacci-calculator']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_fibonacci_calculator', use_case=use_case), code=301)


@app.route('/character-counter')
def consolidated_character_counter():
    platform = request.args.get('platform', 'twitter-post')
    tool = seo_data['tools']['character-counter']
    if platform not in tool['params']['platform']:
        platform = 'twitter-post'
    slug = f"character-counter-for-{platform}"
    ctx = get_seo_context('character-counter', slug=slug, platform=platform)
    return render_template('tool_template.html', **ctx)

@app.route('/character-counter-for-<platform>')
def character_counter_redirect(platform):
    tool = seo_data['tools']['character-counter']
    if platform not in tool['params']['platform']:
        abort(404)
    return redirect(url_for('consolidated_character_counter', platform=platform), code=301)


@app.route('/cpm-calculator')
def consolidated_cpm_calculator():
    channel = request.args.get('channel', 'facebook-ads')
    tool = seo_data['tools']['cpm-calculator']
    if channel not in tool['params']['channel']:
        channel = 'facebook-ads'
    slug = f"cpm-calculator-for-{channel}"
    ctx = get_seo_context('cpm-calculator', slug=slug, channel=channel)
    return render_template('tool_template.html', **ctx)

@app.route('/cpm-calculator-for-<channel>')
def cpm_calculator_redirect(channel):
    tool = seo_data['tools']['cpm-calculator']
    if channel not in tool['params']['channel']:
        abort(404)
    return redirect(url_for('consolidated_cpm_calculator', channel=channel), code=301)


@app.route('/base64-file-converter')
def consolidated_base64_converter():
    file_type = request.args.get('file_type', 'pdf-document')
    tool = seo_data['tools']['base64-converter']
    if file_type not in tool['params']['file_type']:
        file_type = 'pdf-document'
    slug = f"decode-base64-to-{file_type}"
    ctx = get_seo_context('base64-converter', slug=slug, file_type=file_type)
    return render_template('tool_template.html', **ctx)

@app.route('/decode-base64-to-<file_type>')
def base64_converter_redirect(file_type):
    tool = seo_data['tools']['base64-converter']
    if file_type not in tool['params']['file_type']:
        abort(404)
    return redirect(url_for('consolidated_base64_converter', file_type=file_type), code=301)

@app.route('/sitemap.xml')
def sitemap():
    base_url = request.url_root.rstrip('/')
    urls = []
    
    # 1. Home
    urls.append(f"{base_url}/")
    
    # 2. Main Tool Hubs
    for pth in CONSOLIDATED_PATHS.values():
        urls.append(f"{base_url}{pth}")
        
    # 3. Blog Pages
    urls.append(f"{base_url}/blog")
    for post in get_blog_posts():
        urls.append(f"{base_url}/blog/{post['slug']}")
        
    # 4. Static Pages
    urls.append(f"{base_url}/about")
    urls.append(f"{base_url}/privacy")
    urls.append(f"{base_url}/terms")
        
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

@app.route('/about')
def about():
    return render_template('about.html', meta_title="About Us - Urbandigistore Platform", meta_description="Learn more about Urbandigistore, a privacy-first, 100% free browser-based digital operations utility suite built for developers, marketers, and traders.")

@app.route('/privacy')
def privacy():
    return render_template('privacy.html', meta_title="Privacy Policy - Urbandigistore Platform", meta_description="Read the privacy policy of Urbandigistore to understand how we secure your data locally in your browser memory.")

@app.route('/terms')
def terms():
    return render_template('terms.html', meta_title="Terms of Service - Urbandigistore Platform", meta_description="Read the terms of service of Urbandigistore governing browser-based utility tools.")

@app.route('/api/mock', methods=['POST'])
def api_mock():
    data = request.get_json()
    if data is None:
        return jsonify({'success': False, 'message': 'Invalid or missing JSON payload.'}), 400
    
    # Generate unique ID
    mock_id = uuid.uuid4().hex[:8]
    
    # Ensure mocks directory exists
    mocks_dir = os.path.join(os.path.dirname(__file__), 'mocks')
    if not os.path.exists(mocks_dir):
        try:
            os.makedirs(mocks_dir)
        except Exception:
            pass
        
    # Save payload to file
    mock_file = os.path.join(mocks_dir, f"{mock_id}.json")
    try:
        with open(mock_file, 'w', encoding='utf-8') as f:
            json.dump(data, f)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to store mock: {e}'}), 500
        
    mock_url = f"{request.url_root.rstrip('/')}/mock-api/{mock_id}"
    return jsonify({'success': True, 'mock_url': mock_url, 'mock_id': mock_id})

@app.route('/mock-api/<mock_id>')
def serve_mock_api(mock_id):
    mocks_dir = os.path.join(os.path.dirname(__file__), 'mocks')
    mock_file = os.path.join(mocks_dir, f"{mock_id}.json")
    if not os.path.exists(mock_file):
        abort(404)
        
    try:
        with open(mock_file, 'r', encoding='utf-8') as f:
            mock_data = json.load(f)
    except Exception:
        abort(500)
        
    return jsonify(mock_data)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
