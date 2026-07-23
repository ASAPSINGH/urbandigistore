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
    'base64-converter': '/base64-file-converter',
    'merge-pdf': '/merge-pdf',
    'split-pdf': '/split-pdf',
    'qr-generator': '/qr-code-generator',
    'password-generator': '/password-generator',
    'heic-converter': '/heic-to-jpg',
    'image-compressor': '/image-compressor',
    'diff-checker': '/diff-checker',
    'timestamp-converter': '/epoch-converter',
    'mp4-to-mp3': '/mp4-to-mp3',
    'audio-converter': '/audio-converter',
    'pdf-to-image': '/pdf-to-image',
    'image-to-pdf': '/image-to-pdf'
}

# Hub-to-Spoke clusters mapping for organic internal linking authority
TOOL_BLOG_MAPPING = {
    'image-converter': ['free-online-image-converters', 'understanding-heic-image-compression-compatibility', 'why-image-compression-matters-lossy-lossless'],
    'image-cropper': ['social-media-image-sizes', 'why-image-compression-matters-lossy-lossless'],
    'heic-converter': ['understanding-heic-image-compression-compatibility', 'free-online-image-converters'],
    'image-compressor': ['why-image-compression-matters-lossy-lossless', 'understanding-heic-image-compression-compatibility'],
    'utm-builder': ['utm-parameter-naming-conventions', 'facebook-ads-utm-tracking-self-referral', 'demystifying-utm-parameters-traffic-tracking', 'how-to-generate-custom-qr-codes'],
    'whatsapp-generator': ['utm-parameter-naming-conventions'],
    'qr-generator': ['how-to-generate-custom-qr-codes', 'demystifying-qr-code-masking-scanning-speed', 'demystifying-qr-code-versions-grid-dimensions', 'demystifying-qr-code-color-contrast-scannability', 'demystifying-qr-code-quiet-zones-scan-reliability', 'demystifying-qr-code-error-correction-levels', 'demystifying-qr-code-mask-penalty-calculation', 'demystifying-qr-code-version-scaling-grid-dimensions', 'demystifying-qr-code-color-contrast-scannability-rules', 'demystifying-qr-code-quiet-zones-scan-boundaries', 'demystifying-qr-code-quiet-zones-scanning-speed', 'demystifying-qr-code-quiet-zones-contrast-scanning'],
    'password-generator': ['cryptographically-secure-passwords-entropy-math', 'password-length-entropy-exponent-comparison', 'why-password-managers-are-critical-security', 'why-password-hashing-requires-salt-rainbow-tables', 'why-master-password-kdf-iterations-matter', 'why-browser-passwords-are-vulnerable-standalone-vaults', 'why-password-salts-must-be-cryptographically-random', 'why-password-hashing-requires-salt-dict-attacks', 'why-password-hashing-requires-salt-rainbow-lookups', 'why-browser-passwords-are-vulnerable-security-vaults', 'why-password-managers-are-critical-zero-knowledge', 'why-password-hashing-requires-salt-dictionary-defenses'],
    'merge-pdf': ['how-to-merge-pdf-documents-locally', 'understanding-pdf-document-margins', 'understanding-pdf-font-embedding-subsetting', 'understanding-pdf-metadata-xmp-catalog', 'understanding-pdf-linearization-fast-web-view', 'understanding-pdf-structural-security-passwords', 'understanding-pdf-font-embedding-subsetting-standards', 'understanding-pdf-structural-security-passwords-access', 'understanding-pdf-document-margins-layout-guidelines', 'understanding-pdf-metadata-xmp-catalog-standards'],
    'split-pdf': ['how-to-split-pdf-pages-locally', 'pdf-page-splitting-range-syntax-extraction', 'understanding-pdf-document-margins', 'understanding-pdf-font-embedding-subsetting', 'understanding-pdf-metadata-xmp-catalog', 'understanding-pdf-linearization-fast-web-view', 'understanding-pdf-structural-security-passwords', 'understanding-pdf-font-embedding-subsetting-standards', 'understanding-pdf-structural-security-passwords-access', 'understanding-pdf-document-margins-layout-guidelines', 'understanding-pdf-metadata-xmp-catalog-standards'],
    'position-calculator': ['stop-loss-sizing-portfolio-risk-two-percent', 'stop-loss-sizing-average-true-range-atr', 'stop-loss-options-premium-volatility', 'stop-loss-position-sizing-atr-multipliers', 'stop-loss-sizing-volatility-adjusted-atr', 'stop-loss-position-sizing-maximum-drawdown', 'stop-loss-position-sizing-kelly-criterion', 'stop-loss-position-sizing-vix-volatility', 'stop-loss-position-sizing-sharpe-ratio', 'stop-loss-position-sizing-sharpe-sortino', 'stop-loss-position-sizing-ulcer-index', 'stop-loss-position-sizing-sortino-deviation', 'stop-loss-position-sizing-ulcer-index-drawdown', 'stop-loss-position-sizing-volatility-atr-calculations', 'stop-loss-position-sizing-maximum-drawdown-thresholds', 'stop-loss-position-sizing-sharpe-sortino-allocations'],
    'fibonacci-calculator': ['fibonacci-retracement-trading-guide', 'fibonacci-extensions-profit-targets', 'fibonacci-fan-trend-speed', 'fibonacci-arcs-curved-support-zones', 'fibonacci-time-zones-trend-reversal', 'fibonacci-retracement-bear-market', 'fibonacci-spirals-golden-ratio-turn-points', 'how-to-draw-fibonacci-extensions', 'how-to-draw-fibonacci-extensions-downtrend', 'how-to-draw-fibonacci-fans-trend-speed', 'how-to-draw-fibonacci-arcs-curved-support', 'how-to-draw-fibonacci-time-zones', 'how-to-draw-fibonacci-retracements-bear-market', 'how-to-draw-fibonacci-fans-downtrend', 'how-to-draw-fibonacci-fans-bull-market', 'how-to-draw-fibonacci-fans-downtrend-resistance', 'how-to-draw-fibonacci-retracements-bear-market-downtrend', 'how-to-draw-fibonacci-retracements-bull-market-uptrend'],
    'character-counter': ['seo-character-counter-guide', 'social-media-character-limits-truncation'],
    'cpm-calculator': ['digital-ad-budget-cpm', 'how-to-calculate-cpm-ad-costs'],
    'base64-converter': ['data-formats-json-base64', 'base64-file-conversion-guide', 'client-side-base64-image-decoding', 'developer-guide-cors-cross-origin', 'understanding-jwt-structure-claims', 'web-cryptography-api-secure-hashes', 'web-workers-heavy-computations', 'understanding-csp-content-security-policy', 'indexeddb-api-large-datasets-browser', 'understanding-websockets-real-time-communication', 'localstorage-sessionstorage-cookies-comparison', 'web-storage-vs-indexeddb', 'how-to-compare-text-online-diff-algorithms', 'demystifying-unix-epoch-time-32bit-overflow'],
    'json-formatter': ['data-formats-json-base64', 'base64-file-conversion-guide', 'developer-guide-cors-cross-origin', 'understanding-jwt-structure-claims', 'web-cryptography-api-secure-hashes', 'web-workers-heavy-computations', 'understanding-csp-content-security-policy', 'indexeddb-api-large-datasets-browser', 'understanding-websockets-real-time-communication', 'localstorage-sessionstorage-cookies-comparison', 'web-storage-vs-indexeddb', 'how-to-compare-text-online-diff-algorithms', 'demystifying-unix-epoch-time-32bit-overflow'],
    'diff-checker': ['how-to-compare-text-online-diff-algorithms', 'data-formats-json-base64'],
    'timestamp-converter': ['demystifying-unix-epoch-time-32bit-overflow', 'data-formats-json-base64'],
    'mp4-to-mp3': ['free-online-image-converters', 'mp4-to-mp3-audio-extraction-demuxing-bitrates'],
    'audio-converter': ['free-online-image-converters', 'universal-audio-codec-compatibility-wav-aac-mp3'],
    'pdf-to-image': ['how-to-merge-pdf-documents-locally', 'how-to-split-pdf-pages-locally', 'pdf-page-rendering-rasterizing-canvas-images'],
    'image-to-pdf': ['how-to-merge-pdf-documents-locally', 'how-to-split-pdf-pages-locally', 'image-compilation-to-pdf-aspect-ratios-alignment']
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
    elif tool_key == 'merge-pdf':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Merge for {uc.replace('-', ' ').title()}",
                    'url': f"/merge-pdf?use_case={uc}"
                })
    elif tool_key == 'split-pdf':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Split for {uc.replace('-', ' ').title()}",
                    'url': f"/split-pdf?use_case={uc}"
                })
    elif tool_key == 'qr-generator':
        current_t = kwargs.get('type', '')
        for t in tool_conf['params']['type']:
            if t != current_t:
                related_links.append({
                    'title': f"QR for {t.upper()}",
                    'url': f"/qr-code-generator?type={t}"
                })
    elif tool_key == 'password-generator':
        current_sl = kwargs.get('security_level', '')
        for sl in tool_conf['params']['security_level']:
            if sl != current_sl:
                related_links.append({
                    'title': f"{sl.replace('-', ' ').title()} Passwords",
                    'url': f"/password-generator?security_level={sl}"
                })
    elif tool_key == 'heic-converter':
        current_of = kwargs.get('output_format', '')
        for of in tool_conf['params']['output_format']:
            if of != current_of:
                related_links.append({
                    'title': f"Convert to {of.upper()}",
                    'url': f"/heic-to-jpg?output_format={of}"
                })
    elif tool_key == 'image-compressor':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Compress {uc.upper()}",
                    'url': f"/image-compressor?use_case={uc}"
                })
    elif tool_key == 'diff-checker':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Compare {uc.replace('-', ' ').title()}",
                    'url': f"/diff-checker?use_case={uc}"
                })
    elif tool_key == 'timestamp-converter':
        current_uc = kwargs.get('use_case', '')
        for uc in tool_conf['params']['use_case']:
            if uc != current_uc:
                related_links.append({
                    'title': f"Convert {uc.replace('-', ' ').title()}",
                    'url': f"/epoch-converter?use_case={uc}"
                })
    elif tool_key == 'mp4-to-mp3':
        current_of = kwargs.get('output_format', '')
        for of in tool_conf['params']['output_format']:
            if of != current_of:
                related_links.append({
                    'title': f"Extract to {of.upper()}",
                    'url': f"/mp4-to-mp3?output_format={of}"
                })
    elif tool_key == 'audio-converter':
        current_if = kwargs.get('input_format', '')
        for inf in tool_conf['params']['input_format']:
            if inf != current_if:
                related_links.append({
                    'title': f"Convert {inf.upper()} to MP3",
                    'url': f"/audio-converter?input_format={inf}"
                })
    elif tool_key == 'pdf-to-image':
        current_of = kwargs.get('output_format', '')
        for of in tool_conf['params']['output_format']:
            if of != current_of:
                related_links.append({
                    'title': f"Convert PDF to {of.upper()}",
                    'url': f"/pdf-to-image?output_format={of}"
                })
    elif tool_key == 'image-to-pdf':
        current_if = kwargs.get('input_format', '')
        for inf in tool_conf['params']['input_format']:
            if inf != current_if:
                related_links.append({
                    'title': f"Convert {inf.upper()} to PDF",
                    'url': f"/image-to-pdf?input_format={inf}"
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
            
    # Fetch related blog posts for this tool to establish hub-to-spoke authority
    related_blog_posts = []
    all_posts = get_blog_posts()
    for post_slug in TOOL_BLOG_MAPPING.get(tool_key, []):
        post = next((p for p in all_posts if p['slug'] == post_slug), None)
        if post:
            related_blog_posts.append({
                'title': post['title'],
                'slug': post['slug'],
                'description': post['description'],
                'category': post['category']
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
        'sibling_tools': sibling_tools,
        'related_blog_posts': related_blog_posts
    }

@app.context_processor
def inject_ga_id():
    ga_id = os.environ.get('GA_MEASUREMENT_ID')
    if not ga_id and not app.testing:
        ga_id = 'G-7F1SCZWSCX'
    return {
        'ga_measurement_id': ga_id
    }

@app.context_processor
def inject_adsense_id():
    adsense_id = os.environ.get('ADSENSE_CLIENT_ID')
    if not adsense_id and not app.testing:
        adsense_id = 'ca-pub-1234567890123456'
    return {
        'adsense_client_id': adsense_id
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
    if input_format == 'heic':
        heic_tool = seo_data['tools']['heic-converter']
        if output_format not in heic_tool['params']['output_format']:
            abort(404)
        return redirect(url_for('consolidated_heic_converter', output_format=output_format), code=301)

    if input_format == 'mp4':
        mp4_tool = seo_data['tools']['mp4-to-mp3']
        if output_format not in mp4_tool['params']['output_format']:
            abort(404)
        return redirect(url_for('consolidated_mp4_to_mp3', output_format=output_format), code=301)

    if input_format == 'pdf':
        pdf_tool = seo_data['tools']['pdf-to-image']
        if output_format not in pdf_tool['params']['output_format']:
            abort(404)
        return redirect(url_for('consolidated_pdf_to_image', output_format=output_format), code=301)

    if output_format == 'pdf':
        i2p_tool = seo_data['tools']['image-to-pdf']
        if input_format not in i2p_tool['params']['input_format']:
            abort(404)
        return redirect(url_for('consolidated_image_to_pdf', input_format=input_format), code=301)

    audio_tool = seo_data['tools']['audio-converter']
    if input_format in audio_tool['params']['input_format'] and output_format == 'mp3':
        return redirect(url_for('consolidated_audio_converter', input_format=input_format), code=301)

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


@app.route('/merge-pdf')
def consolidated_merge_pdf():
    use_case = request.args.get('use_case', 'documents')
    tool = seo_data['tools']['merge-pdf']
    if use_case not in tool['params']['use_case']:
        use_case = 'documents'
    slug = f"merge-pdf-for-{use_case}"
    ctx = get_seo_context('merge-pdf', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/merge-pdf-for-<use_case>')
def merge_pdf_redirect(use_case):
    tool = seo_data['tools']['merge-pdf']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_merge_pdf', use_case=use_case), code=301)


@app.route('/split-pdf')
def consolidated_split_pdf():
    use_case = request.args.get('use_case', 'pages')
    tool = seo_data['tools']['split-pdf']
    if use_case not in tool['params']['use_case']:
        use_case = 'pages'
    slug = f"split-pdf-by-{use_case}"
    ctx = get_seo_context('split-pdf', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/split-pdf-by-<use_case>')
def split_pdf_redirect(use_case):
    tool = seo_data['tools']['split-pdf']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_split_pdf', use_case=use_case), code=301)

@app.route('/unmerge-pdf')
def unmerge_pdf_alias():
    return redirect(url_for('consolidated_split_pdf', use_case='pages'), code=301)


@app.route('/qr-code-generator')
def consolidated_qr_generator():
    type_param = request.args.get('type', 'url')
    tool = seo_data['tools']['qr-generator']
    if type_param not in tool['params']['type']:
        type_param = 'url'
    slug = f"generate-qr-code-for-{type_param}"
    ctx = get_seo_context('qr-generator', slug=slug, type=type_param)
    return render_template('tool_template.html', **ctx)

@app.route('/generate-qr-code-for-<type>')
def qr_generator_redirect(type):
    tool = seo_data['tools']['qr-generator']
    if type not in tool['params']['type']:
        abort(404)
    return redirect(url_for('consolidated_qr_generator', type=type), code=301)


@app.route('/password-generator')
def consolidated_password_generator():
    security_level = request.args.get('security_level', 'strong')
    tool = seo_data['tools']['password-generator']
    if security_level not in tool['params']['security_level']:
        security_level = 'strong'
    slug = f"generate-{security_level}-password"
    ctx = get_seo_context('password-generator', slug=slug, security_level=security_level)
    return render_template('tool_template.html', **ctx)

@app.route('/generate-<security_level>-password')
def password_generator_redirect(security_level):
    tool = seo_data['tools']['password-generator']
    if security_level not in tool['params']['security_level']:
        abort(404)
    return redirect(url_for('consolidated_password_generator', security_level=security_level), code=301)


@app.route('/heic-to-jpg')
def consolidated_heic_converter():
    output_format = request.args.get('output_format', 'jpg')
    tool = seo_data['tools']['heic-converter']
    if output_format not in tool['params']['output_format']:
        output_format = 'jpg'
    slug = f"convert-heic-to-{output_format}"
    ctx = get_seo_context('heic-converter', slug=slug, output_format=output_format)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-heic-to-<output_format>')
def heic_converter_redirect(output_format):
    tool = seo_data['tools']['heic-converter']
    if output_format not in tool['params']['output_format']:
        abort(404)
    return redirect(url_for('consolidated_heic_converter', output_format=output_format), code=301)


@app.route('/image-compressor')
def consolidated_image_compressor():
    use_case = request.args.get('use_case', 'jpeg')
    tool = seo_data['tools']['image-compressor']
    if use_case not in tool['params']['use_case']:
        use_case = 'jpeg'
    slug = f"compress-image-for-{use_case}"
    ctx = get_seo_context('image-compressor', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/compress-image-for-<use_case>')
def image_compressor_redirect(use_case):
    tool = seo_data['tools']['image-compressor']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_image_compressor', use_case=use_case), code=301)


@app.route('/diff-checker')
def consolidated_diff_checker():
    use_case = request.args.get('use_case', 'text')
    tool = seo_data['tools']['diff-checker']
    if use_case not in tool['params']['use_case']:
        use_case = 'text'
    slug = f"compare-{use_case}-online"
    ctx = get_seo_context('diff-checker', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/compare-<use_case>-online')
def diff_checker_redirect(use_case):
    tool = seo_data['tools']['diff-checker']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_diff_checker', use_case=use_case), code=301)


@app.route('/epoch-converter')
def consolidated_timestamp_converter():
    use_case = request.args.get('use_case', 'unix')
    tool = seo_data['tools']['timestamp-converter']
    if use_case not in tool['params']['use_case']:
        use_case = 'unix'
    slug = f"convert-{use_case}-timestamp"
    ctx = get_seo_context('timestamp-converter', slug=slug, use_case=use_case)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-<use_case>-timestamp')
def timestamp_converter_redirect(use_case):
    tool = seo_data['tools']['timestamp-converter']
    if use_case not in tool['params']['use_case']:
        abort(404)
    return redirect(url_for('consolidated_timestamp_converter', use_case=use_case), code=301)


@app.route('/mp4-to-mp3')
def consolidated_mp4_to_mp3():
    output_format = request.args.get('output_format', 'mp3')
    tool = seo_data['tools']['mp4-to-mp3']
    if output_format not in tool['params']['output_format']:
        output_format = 'mp3'
    slug = f"convert-mp4-to-{output_format}"
    ctx = get_seo_context('mp4-to-mp3', slug=slug, output_format=output_format)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-mp4-to-<output_format>')
def mp4_to_mp3_redirect(output_format):
    tool = seo_data['tools']['mp4-to-mp3']
    if output_format not in tool['params']['output_format']:
        abort(404)
    return redirect(url_for('consolidated_mp4_to_mp3', output_format=output_format), code=301)


@app.route('/audio-converter')
def consolidated_audio_converter():
    input_format = request.args.get('input_format', 'wav')
    tool = seo_data['tools']['audio-converter']
    if input_format not in tool['params']['input_format']:
        input_format = 'wav'
    slug = f"convert-{input_format}-to-mp3"
    ctx = get_seo_context('audio-converter', slug=slug, input_format=input_format)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-<input_format>-to-mp3')
def audio_converter_redirect(input_format):
    if input_format == 'mp4':
        return redirect(url_for('consolidated_mp4_to_mp3', output_format='mp3'), code=301)

    tool = seo_data['tools']['audio-converter']
    if input_format not in tool['params']['input_format']:
        abort(404)
    return redirect(url_for('consolidated_audio_converter', input_format=input_format), code=301)


@app.route('/pdf-to-image')
def consolidated_pdf_to_image():
    output_format = request.args.get('output_format', 'jpg')
    tool = seo_data['tools']['pdf-to-image']
    if output_format not in tool['params']['output_format']:
        output_format = 'jpg'
    slug = f"convert-pdf-to-{output_format}"
    ctx = get_seo_context('pdf-to-image', slug=slug, output_format=output_format)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-pdf-to-<output_format>')
def pdf_to_image_redirect(output_format):
    tool = seo_data['tools']['pdf-to-image']
    if output_format not in tool['params']['output_format']:
        abort(404)
    return redirect(url_for('consolidated_pdf_to_image', output_format=output_format), code=301)


@app.route('/image-to-pdf')
def consolidated_image_to_pdf():
    input_format = request.args.get('input_format', 'jpg')
    tool = seo_data['tools']['image-to-pdf']
    if input_format not in tool['params']['input_format']:
        input_format = 'jpg'
    slug = f"convert-{input_format}-to-pdf"
    ctx = get_seo_context('image-to-pdf', slug=slug, input_format=input_format)
    return render_template('tool_template.html', **ctx)

@app.route('/convert-<input_format>-to-pdf')
def image_to_pdf_redirect(input_format):
    tool = seo_data['tools']['image-to-pdf']
    if input_format not in tool['params']['input_format']:
        abort(404)
    return redirect(url_for('consolidated_image_to_pdf', input_format=input_format), code=301)


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
        
    # Map back from spoke to parent hubs to pass link authority to tools
    related_tools = []
    for tool_key, slugs in TOOL_BLOG_MAPPING.items():
        if slug in slugs:
            tool_conf = seo_data['tools'][tool_key]
            related_tools.append({
                'name': tool_conf['name'],
                'url': CONSOLIDATED_PATHS.get(tool_key, '#')
            })
            
    return render_template('blog/post.html', post=post, related_tools=related_tools)

@app.route('/robots.txt')
def robots():
    base_url = request.url_root.rstrip('/')
    content = f"User-agent: *\nAllow: /\nSitemap: {base_url}/sitemap.xml\n"
    return Response(content, mimetype='text/plain')

@app.route('/ads.txt')
def ads_txt():
    pub_id = os.environ.get('ADSENSE_PUBLISHER_ID', 'pub-1234567890123456')
    content = f"google.com, {pub_id}, DIRECT, f08c47fec0942fa0\n"
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
