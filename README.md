# Google Sponsored Results Blocker

A Chrome extension that removes the "Sponsored products" and "Sponsored results" blocks from Google search results. It can also optionally hide Google search feature sections like AI overview, discussions, images, videos, short videos, People also ask, related searches, People also search for, top stories, shopping/product sections, and place sections.

## Description

Google Sponsored Results Blocker is a lightweight browser extension for people who want a cleaner Google Search results page. By default, it removes Google ad sections labelled as sponsored products or sponsored results. The popup also lets you optionally hide additional Google Search feature sections, such as AI Overview, images, videos, short videos, discussions and forums, People also ask, related searches, People also search for, top stories, shopping/product sections, and place sections.

The extension works locally in your browser. It does not collect, transmit, sell, or share browsing data, search queries, page content, personal information, or analytics.

## Single Purpose

The single purpose of this extension is to clean up Google Search result pages by hiding selected sponsored and optional Google Search feature sections. All functionality in the extension directly supports this purpose: detecting supported Google Search sections, removing them locally from the visible page, saving the user's on/off preferences, and reloading the current page after settings change.

The extension does not provide unrelated features and does not modify websites outside of this page-cleanup purpose.

## Features

- Blocks sponsored products by default.
- Blocks sponsored results by default.
- Optional toggles for common Google Search feature sections.
- Reload button in the popup to refresh the current Google results page after changing settings.
- No tracking, no analytics, and no external network requests by the extension.

## Privacy

This extension does not collect or store personal data.

It does not collect:

- Search queries
- Browsing history
- Page content
- Clicks
- Account information
- IP addresses
- Location data
- Analytics or usage metrics

All filtering happens locally on the Google Search results page in the browser. No data is sent to the developer or to any third-party service.

## Permissions

### Why `storage` Is Needed

The `storage` permission is used only to save the user's toggle settings, for example whether sponsored products, sponsored results, videos, images, or other search feature sections should be hidden.

These settings are stored by Chrome so the extension can remember them between browser sessions. No personal data, search terms, or page content is stored.

### Why Host Access Is Needed

The extension needs access to Google Search result pages so its content script can inspect the page structure and remove the selected sponsored or optional search feature sections from the visible page.

The extension does not read or modify pages for tracking purposes. It only removes matching DOM elements locally according to the enabled settings.

### Network Access

The extension does not make external network requests. It does not send data to any server.

## Install locally

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked` and select this project folder.

Ad blockers are enabled by default. Optional search feature filters are disabled by default and can be turned on separately in the extension popup.
