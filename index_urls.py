#!/usr/bin/env python3
"""
Google Indexing API URL Submission Script
------------------------------------------
This script parses the sitemap.xml for urbandigistore.com and uses the
Google Indexing API to programmatically request indexing for all pages and blogs.

Prerequisites:
1. Install requirements:
   pip install requests google-auth
2. Set up a Google Cloud Service Account, enable the Indexing API, and download
   the private key JSON file. Save it as `service_account.json` in this directory.
3. Add the Service Account email address as an Owner of the property in Google Search Console.
"""

import os
import sys
import xml.etree.ElementTree as ET
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SITEMAP_URL = "https://urbandigistore.com/sitemap.xml"
CREDENTIALS_FILE = "service_account.json"
API_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

INSTRUCTIONS = f"""
========================================================================
🚨 CRITICAL: Service Account Key File '{CREDENTIALS_FILE}' Not Found!
========================================================================
To use the Google Indexing API, follow these steps to set up credentials:

1. Enable the Google Indexing API:
   - Go to Google Cloud Console (https://console.cloud.google.com/).
   - Create a project or select an existing one.
   - Navigate to "APIs & Services" > "Library".
   - Search for "Web Search Indexing API" and click "Enable".

2. Create a Service Account:
   - Navigate to "APIs & Services" > "Credentials".
   - Click "+ CREATE CREDENTIALS" > "Service account".
   - Fill in details, e.g. name: "indexing-bot".
   - Under "Grant this service account access to project", select Role: "Owner" (or leave blank).
   - Complete creation.

3. Generate and Download JSON Key:
   - Click on the newly created Service Account.
   - Go to the "Keys" tab.
   - Click "ADD KEY" > "Create new key".
   - Select "JSON" and click "Create".
   - Save the downloaded file as '{CREDENTIALS_FILE}' in the project root folder.

4. Associate Service Account with Google Search Console:
   - Open the JSON file and copy the "client_email" address.
   - Go to Google Search Console (https://search.google.com/search-console).
   - Select your property: https://urbandigistore.com/
   - Go to Settings > Users and permissions.
   - Click "Add user".
   - Enter the copied email and set the permission level to "Owner".
     (Owner permission is required for the Indexing API to submit URLs).

Once these steps are done, run this script again:
   python index_urls.py
========================================================================
"""

def get_local_sitemap_urls(base_url="https://urbandigistore.com"):
    import glob
    import json
    urls = []
    
    # 1. Home
    urls.append(f"{base_url}/")
    
    # 2. Main Tool Hubs
    consolidated_paths = [
        '/image-converter', '/image-cropper', '/utm-builder', '/whatsapp-link-generator',
        '/json-formatter', '/position-size-calculator', '/fibonacci-calculator', '/character-counter',
        '/cpm-calculator', '/base64-file-converter', '/merge-pdf', '/split-pdf', '/qr-code-generator',
        '/password-generator', '/heic-to-jpg', '/image-compressor', '/diff-checker', '/epoch-converter',
        '/mp4-to-mp3', '/audio-converter', '/pdf-to-image', '/image-to-pdf'
    ]
    for pth in consolidated_paths:
        urls.append(f"{base_url}{pth}")
        
    # 3. Calculators Pages
    urls.append(f"{base_url}/calculators")
    calc_data_path = os.path.join(os.path.dirname(__file__), 'seo_calculators_data.json')
    if os.path.exists(calc_data_path):
        with open(calc_data_path, 'r') as f:
            calcs = json.load(f)
            for calc_key in calcs.keys():
                urls.append(f"{base_url}/calculators/{calc_key}")
                
    # 4. Blog Pages
    urls.append(f"{base_url}/blog")
    blog_dir = os.path.join(os.path.dirname(__file__), 'content', 'blog')
    if os.path.exists(blog_dir):
        for filepath in glob.glob(os.path.join(blog_dir, '*.md')):
            slug = os.path.basename(filepath).replace('.md', '')
            urls.append(f"{base_url}/blog/{slug}")
            
    # 5. Static Pages
    urls.append(f"{base_url}/about")
    urls.append(f"{base_url}/privacy")
    urls.append(f"{base_url}/terms")
    
    return urls

def main():
    # 1. Check for credentials file
    if not os.path.exists(CREDENTIALS_FILE):
        print(INSTRUCTIONS)
        sys.exit(1)
        
    # 2. Generate sitemap URLs from local codebase
    print("Generating sitemap URLs from local codebase...")
    urls = get_local_sitemap_urls()
    print(f"Found {len(urls)} URLs in the local codebase configuration.")
    
    # 3. Load credentials and create authorized session
    print("Authenticating with Google Cloud...")
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE,
            scopes=["https://www.googleapis.com/auth/indexing"]
        )
        session = AuthorizedSession(credentials)
    except Exception as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)
        
    # 4. Submit URLs to Google Indexing API
    print("Starting URL indexing requests...")
    success_count = 0
    failure_count = 0
    
    for i, url in enumerate(urls, 1):
        payload = {
            "url": url,
            "type": "URL_UPDATED"
        }
        try:
            response = session.post(API_ENDPOINT, json=payload, timeout=10)
            if response.status_code == 200:
                print(f"[{i}/{len(urls)}] Submitted successfully: {url}")
                success_count += 1
            else:
                print(f"[{i}/{len(urls)}] Failed to submit {url}: HTTP {response.status_code} - {response.text}")
                failure_count += 1
        except Exception as e:
            print(f"[{i}/{len(urls)}] Exception during request for {url}: {e}")
            failure_count += 1
            
    print("\nIndexing submission complete!")
    print(f"Successfully submitted: {success_count}")
    print(f"Failed submissions: {failure_count}")

if __name__ == "__main__":
    main()
