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

def fetch_sitemap_urls(url):
    print(f"Fetching sitemap from: {url}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        sys.exit(1)
        
    try:
        root = ET.fromstring(response.content)
        # Handle namespaces in XML sitemaps
        namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        urls = []
        for url_node in root.findall(f".//{namespace}loc"):
            urls.append(url_node.text.strip())
        return urls
    except Exception as e:
        print(f"Error parsing sitemap XML: {e}")
        sys.exit(1)

def main():
    # 1. Check for credentials file
    if not os.path.exists(CREDENTIALS_FILE):
        print(INSTRUCTIONS)
        sys.exit(1)
        
    # 2. Fetch URLs from sitemap
    urls = fetch_sitemap_urls(SITEMAP_URL)
    print(f"Found {len(urls)} URLs in the sitemap.")
    
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
