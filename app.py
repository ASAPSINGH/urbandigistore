import json
import os
from flask import Flask, render_template, abort, Response, request

app = Flask(__name__)

# Load structured SEO data
seo_data_path = os.path.join(os.path.dirname(__file__), 'seo_data.json')
with open(seo_data_path, 'r') as f:
    seo_data = json.load(f)

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
            
    return {
        'tool_key': tool_key,
        'meta_title': meta_title,
        'meta_description': meta_description,
        'h1': h1,
        'h2': h2,
        'description': description,
        'steps': steps,
        'faqs': faqs,
        'params': kwargs
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
        
    # Render XML Structure
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url in urls:
        xml_content += f'  <url>\n    <loc>{url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    xml_content += '</urlset>'
    
    return Response(xml_content, mimetype='application/xml')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
