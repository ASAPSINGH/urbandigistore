import unittest
import json
import xml.etree.ElementTree as ET
from app import app

class TestWebUtilities(unittest.TestCase):
    
    def setUp(self):
        app.testing = True
        self.app = app.test_client()
        
    def test_home_route(self):
        """Verify the homepage loads and returns the categories section."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Digital Operations Matrix', response.data)
        
    def test_valid_programmatic_routes(self):
        """Verify that legacy programmatic SEO parameters return 301 redirects."""
        routes = [
            ('/convert-png-to-webp', '/image-converter?input_format=png&output_format=webp'),
            ('/crop-image-for-instagram-post', '/image-cropper?platform_size=instagram-post'),
            ('/utm-builder-for-facebook-ads', '/utm-builder?platform=facebook-ads'),
            ('/whatsapp-link-generator-for-india', '/whatsapp-link-generator?country=india'),
            ('/format-json-for-config', '/json-formatter?use_case=config'),
            ('/position-size-calculator-forex', '/position-size-calculator?asset_class=forex'),
            ('/fibonacci-retracement-calculator-crypto-trading', '/fibonacci-calculator?use_case=crypto-trading'),
            ('/character-counter-for-twitter-post', '/character-counter?platform=twitter-post'),
            ('/cpm-calculator-for-facebook-ads', '/cpm-calculator?channel=facebook-ads'),
            ('/decode-base64-to-png', '/base64-file-converter?file_type=png'),
            ('/merge-pdf-for-documents', '/merge-pdf?use_case=documents'),
            ('/split-pdf-by-pages', '/split-pdf?use_case=pages'),
            ('/unmerge-pdf', '/split-pdf?use_case=pages'),
            ('/generate-qr-code-for-url', '/qr-code-generator?type=url'),
            ('/generate-strong-password', '/password-generator?security_level=strong')
        ]
        for route, expected_redirect in routes:
            response = self.app.get(route)
            self.assertEqual(response.status_code, 301, f"Route {route} did not return 301.")
            self.assertTrue(response.location.endswith(expected_redirect), f"Route {route} redirected to {response.location} instead of {expected_redirect}.")
            
    def test_consolidated_routes(self):
        """Verify the consolidated main route hubs load successfully."""
        routes = [
            '/image-converter',
            '/image-cropper',
            '/utm-builder',
            '/whatsapp-link-generator',
            '/json-formatter',
            '/position-size-calculator',
            '/fibonacci-calculator',
            '/character-counter',
            '/cpm-calculator',
            '/base64-file-converter',
            '/merge-pdf',
            '/split-pdf',
            '/qr-code-generator',
            '/password-generator'
        ]
        for route in routes:
            response = self.app.get(route)
            self.assertEqual(response.status_code, 200, f"Consolidated hub {route} failed to load.")
            self.assertIn(b'How to Use', response.data, f"Consolidated hub {route} missing instructions.")
            
    def test_invalid_parameters_404(self):
        """Verify that invalid parameters return 404 to avoid duplicate/spam indexes."""
        invalid_routes = [
            '/convert-invalid-to-webp',
            '/crop-image-for-invalid-size',
            '/utm-builder-for-invalid-ads',
            '/whatsapp-link-generator-for-invalid-country',
            '/format-json-for-invalid-case',
            '/position-size-calculator-invalid-asset',
            '/fibonacci-retracement-calculator-invalid-case',
            '/character-counter-for-invalid-platform',
            '/cpm-calculator-for-invalid-channel',
            '/decode-base64-to-invalid-filetype',
            '/merge-pdf-for-invalidcase',
            '/split-pdf-by-invalidcase',
            '/generate-qr-code-for-invalidtype',
            '/generate-invalidlevel-password'
        ]
        for route in invalid_routes:
            response = self.app.get(route)
            self.assertEqual(response.status_code, 404, f"Invalid route {route} did not return 404.")
            
    def test_sitemap_xml(self):
        """Verify sitemap generation produces valid XML and includes key links."""
        response = self.app.get('/sitemap.xml')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, 'application/xml')
        
        # Parse XML
        root = ET.fromstring(response.data)
        self.assertIn('urlset', root.tag)
        
        # Extract URLs
        urls = [child[0].text for child in root if len(child) > 0]
        self.assertTrue(len(urls) > 5, "Sitemap contains too few URLs.")
        self.assertTrue(any('/image-converter' in url for url in urls), "Sitemap missing image converter URLs.")
        self.assertTrue(any('/blog/free-online-image-converters' in url for url in urls), "Sitemap missing blog post URLs.")
        self.assertTrue(any('/privacy' in url for url in urls), "Sitemap missing privacy page URL.")
        self.assertTrue(any('/terms' in url for url in urls), "Sitemap missing terms page URL.")
        
    def test_blog_routes(self):
        """Verify that the blog index and posts render successfully."""
        resp = self.app.get('/blog')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Knowledge Base Matrix', resp.data)
        self.assertIn(b'Free Online Image Converters', resp.data)
        
        resp = self.app.get('/blog/free-online-image-converters')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'The Guide to Free Online Image Converters', resp.data)
        self.assertIn(b'BlogPosting', resp.data)  # JSON-LD Schema check
        
    def test_google_verification(self):
        """Verify Google Search Console verification HTML file and meta tag routes work."""
        resp = self.app.get('/googlenH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY.html')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, b'google-site-verification: googlenH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY.html')

        resp = self.app.get('/google419e02c86ce25995.html')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, b'google-site-verification: google419e02c86ce25995.html')

        resp = self.app.get('/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'<meta name="google-site-verification" content="nH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY" />', resp.data)

    def test_robots_txt(self):
        """Verify the robots.txt route returns plain text pointing to the sitemap."""
        resp = self.app.get('/robots.txt')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.mimetype, 'text/plain')
        self.assertIn(b'User-agent: *', resp.data)
        self.assertIn(b'Sitemap:', resp.data)
        self.assertIn(b'/sitemap.xml', resp.data)

    def test_subscribe(self):
        """Verify that the newsletter subscription endpoint handles inputs and registers users correctly."""
        import os
        sub_file = '/Users/asapsingh/Documents/utility tools webiste/subscribers.csv'
        sub_backup = '/Users/asapsingh/Documents/utility tools webiste/subscribers_backup_test.csv'
        
        # Backup if exists
        if os.path.exists(sub_file):
            import shutil
            shutil.copyfile(sub_file, sub_backup)
            os.remove(sub_file)

        try:
            # 1. Test empty email
            resp = self.app.post('/subscribe', json={})
            self.assertEqual(resp.status_code, 400)
            self.assertIn(b'Email is required', resp.data)

            # 2. Test invalid email format
            resp = self.app.post('/subscribe', json={'email': 'invalid-email-format'})
            self.assertEqual(resp.status_code, 400)
            self.assertIn(b'valid email address', resp.data)

            # 3. Test successful subscription
            resp = self.app.post('/subscribe', json={'email': 'test_user@example.com'})
            self.assertEqual(resp.status_code, 200)
            self.assertIn(b'Successfully subscribed', resp.data)

            # 4. Test duplicate subscription prevention
            resp = self.app.post('/subscribe', json={'email': 'test_user@example.com'})
            self.assertEqual(resp.status_code, 200)
            self.assertIn(b'already subscribed', resp.data)
            
            # Verify file was written
            self.assertTrue(os.path.exists(sub_file))
        finally:
            # Restore backup
            if os.path.exists(sub_file):
                os.remove(sub_file)
            if os.path.exists(sub_backup):
                import shutil
                shutil.copyfile(sub_backup, sub_file)
                os.remove(sub_backup)

    def test_google_analytics_rendering(self):
        """Verify Google Analytics scripts render conditionally based on configuration."""
        import os
        from unittest import mock

        # 1. When GA_MEASUREMENT_ID is NOT set, tag should not render
        with mock.patch.dict(os.environ, {}, clear=True):
            resp = self.app.get('/')
            self.assertEqual(resp.status_code, 200)
            self.assertNotIn(b'www.googletagmanager.com/gtag/js', resp.data)

        # 2. When GA_MEASUREMENT_ID is set, tag should render
        with mock.patch.dict(os.environ, {'GA_MEASUREMENT_ID': 'G-TEST123456'}):
            resp = self.app.get('/')
            self.assertEqual(resp.status_code, 200)
            self.assertIn(b'www.googletagmanager.com/gtag/js?id=G-TEST123456', resp.data)
            self.assertIn(b"gtag('config', 'G-TEST123456')", resp.data)

    def test_about_page_rendering(self):
        """Verify the About page loads and renders key brand content correctly."""
        resp = self.app.get('/about')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Privacy-First', resp.data)
        self.assertIn(b'Our Mission', resp.data)
        
    def test_privacy_page_rendering(self):
        """Verify the Privacy Policy page loads correctly."""
        resp = self.app.get('/privacy')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Privacy Policy', resp.data)
        self.assertIn(b'Zero Server Logs', resp.data)

    def test_terms_page_rendering(self):
        """Verify the Terms of Service page loads correctly."""
        resp = self.app.get('/terms')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Terms of Service', resp.data)
        self.assertIn(b'Limitation of Liability', resp.data)
        
    def test_mock_api(self):
        """Verify that Mock API creation and retrieval work as expected."""
        mock_payload = {"status": "ok", "items": [1, 2, 3]}
        response = self.app.post('/api/mock', json=mock_payload)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        self.assertIn('mock_url', data)
        self.assertIn('mock_id', data)
        
        # Test retrieval of the mocked payload
        mock_id = data['mock_id']
        get_response = self.app.get(f'/mock-api/{mock_id}')
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.mimetype, 'application/json')
        
        get_data = json.loads(get_response.data.decode('utf-8'))
        self.assertEqual(get_data, mock_payload)

if __name__ == '__main__':
    unittest.main()
