import unittest
import json
import xml.etree.ElementTree as ET
from app import app

class TestWebUtilities(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
    def test_home_route(self):
        """Verify the homepage loads and returns the categories section."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Digital Operations Matrix', response.data)
        
    def test_valid_programmatic_routes(self):
        """Verify that valid programmatic SEO parameters resolve successfully."""
        routes = [
            '/convert-png-to-webp',
            '/crop-image-for-instagram-post',
            '/utm-builder-for-facebook-ads',
            '/whatsapp-link-generator-for-india',
            '/format-json-for-config',
            '/position-size-calculator-forex',
            '/fibonacci-retracement-calculator-crypto-trading',
            '/character-counter-for-twitter-post',
            '/cpm-calculator-for-facebook-ads',
            '/decode-base64-to-png'
        ]
        for route in routes:
            response = self.app.get(route)
            self.assertEqual(response.status_code, 200, f"Route {route} failed to load.")
            self.assertIn(b'How to Use', response.data, f"Route {route} does not render layout.")
            
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
            '/decode-base64-to-invalid-filetype'
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
        # Check namespaces
        self.assertIn('urlset', root.tag)
        
        # Extract URLs
        urls = [child[0].text for child in root if len(child) > 0]
        self.assertTrue(len(urls) > 10, "Sitemap contains too few URLs.")
        self.assertTrue(any('/convert-png-to-webp' in url for url in urls), "Sitemap missing image converter URLs.")
        self.assertTrue(any('/blog/importance-of-image-compression' in url for url in urls), "Sitemap missing blog post URLs.")
        
    def test_blog_routes(self):
        """Verify that the blog index and posts render successfully."""
        # 1. Blog Index
        resp = self.app.get('/blog')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Knowledge Base Matrix', resp.data)
        self.assertIn(b'Why Image Compression Matters', resp.data)
        
        # 2. Blog Post Page
        resp = self.app.get('/blog/importance-of-image-compression')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'Why Image Compression Matters for Web Performance', resp.data)
        self.assertIn(b'BlogPosting', resp.data)  # JSON-LD Schema check
        
    def test_google_verification(self):
        """Verify Google Search Console verification HTML file and meta tag routes work."""
        # 1. Test HTML file route
        resp = self.app.get('/googlenH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY.html')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, b'google-site-verification: googlenH_m5gZ-2Oi7zqLQ18lLOFedJm-mZUVdS_p8hd7proY.html')

        # 1.1 Test New HTML file route
        resp = self.app.get('/google419e02c86ce25995.html')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, b'google-site-verification: google419e02c86ce25995.html')

        # 2. Test Meta Tag in base template (loaded on homepage)
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

if __name__ == '__main__':
    unittest.main()
