title: Google Analytics 4 Custom Dimensions: A Guide for Digital Marketers
description: Learn how to set up, configure, and use event-scoped and user-scoped custom dimensions in GA4 to capture rich marketing metadata.
date: 2026-07-16
category: Marketing
author: Urbandigistore Analytics
---

# Google Analytics 4 Custom Dimensions: A Guide for Digital Marketers

Google Analytics 4 (GA4) has shifted the digital analytics paradigm from pageviews to an event-based tracking model. While GA4 captures a set of default parameters (like `page_title` and `session_id`), standard reports frequently fail to display the custom metadata that marketers need to make decisions.

To capture and report on custom parameters—such as target marketing profiles, author names, or ad variations—you must configure **Custom Dimensions**. In this guide, we'll explain how they work and show you how to set them up.

---

## 🔍 Event-Scoped vs. User-Scoped Custom Dimensions

Before creating custom dimensions, you must understand their scope:

*   **Event-Scoped Custom Dimensions**: Measure attributes of a specific action. For example, if a user clicks a button to convert an image, you can send an event parameter like `file_format` or `dimension_ratio`. The dimension is bound only to that specific event.
*   **User-Scoped Custom Dimensions**: Measure attributes of the user visiting the site, persisting across multiple sessions. Examples include `membership_tier` (e.g. "premium" or "free") or `acquisition_cohort` (e.g., "july_2026"). Once set, it applies to all subsequent actions by that user.

---

## 🛠️ How to Configure Custom Dimensions in GA4

Creating a custom dimension is a two-step process: you must send the parameter from your website code, and then register it inside the GA4 admin dashboard.

### Step 1: Send the Custom Parameter via gtag.js
In your website code, when triggering a custom event, include the parameter in the event payload:

```javascript
// Trigger a custom event with metadata parameters
gtag('event', 'convert_image', {
  'input_format': 'png',
  'output_format': 'webp',
  'file_size_kb': 1024
});
```

### Step 2: Register the Dimension in GA4 Admin
If you do not register the parameter, GA4 will receive the data, but it will not display in your reports.
1.  Open **Google Analytics** and navigate to **Admin > Custom definitions**.
2.  Click **Create custom dimensions**.
3.  Fill in the configuration details:
    *   **Dimension name**: Enter a user-friendly name (e.g., `Input File Format`).
    *   **Scope**: Select `Event` (or `User`).
    *   **Description**: Write a brief note about what it tracks.
    *   **Event parameter**: Type the exact parameter key sent in your code (e.g., `input_format`).
4.  Click **Save**.

GA4 will begin populating the custom dimension in your standard reports within 24 to 48 hours.

---

## 📊 Standardizing Your Custom Marketing Schema

To keep your analytics clean and avoid reaching GA4's limits (limit of 50 event-scoped and 25 user-scoped custom dimensions per property), standardise your naming conventions:

| Custom Dimension | Scope | Recommended Event Parameter | Use Case Example |
| :--- | :--- | :--- | :--- |
| **Author Name** | Event | `author` | Track which blog writers generate the most newsletter sign-ups. |
| **Asset Type** | Event | `asset_class` | Identify which calculator setup (Forex, Crypto, Stocks) is most popular. |
| **Target Platform** | Event | `target_platform` | Track which social dimensions (Instagram, YouTube) are cropped most often. |
| **User Status** | User | `user_membership` | Compare conversion rates of premium users vs. anonymous visitors. |
