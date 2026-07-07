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

if __name__ == '__main__':
    unittest.main()
