# Firecrawl Observer API Documentation

The Firecrawl Observer API allows you to programmatically manage website monitoring through REST endpoints. This enables automation, bulk operations, and integration with external systems.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Rate Limits](#rate-limits)
7. [Webhook Integration](#webhook-integration)
8. [Code Examples](#code-examples)
9. [Best Practices](#best-practices)

## Authentication

### API Key Management

All API requests require authentication using Bearer tokens (API keys).

**Creating API Keys:**
1. Log into your Firecrawl Observer dashboard
2. Navigate to Settings → Observer API Keys
3. Click "Create New Key"
4. Provide a descriptive name for the key
5. Copy the generated key immediately (it won't be shown again)

**Key Limitations:**
- Maximum 5 API keys per account
- Keys are user-scoped (only access your own websites)
- Keys track last usage timestamp

**Authentication Header:**
```
Authorization: Bearer YOUR_API_KEY
```

## Base URL

```
https://your-domain.com/api
```

## API Endpoints

### 1. Add Website(s) for Monitoring

**Endpoint:** `POST /api/websites`

**Description:** Add one or multiple websites to your monitoring list.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**Single Website Request Body:**
```json
{
  "url": "https://example.com",
  "name": "Example Website",
  "type": "scrape",
  "checkInterval": 60,
  "webhook": "https://your-webhook.com/endpoint",
  "crawlLimit": 10,
  "crawlDepth": 2
}
```

**Batch Request Body:**
```json
[
  {
    "url": "https://example1.com",
    "name": "Example 1",
    "type": "scrape",
    "checkInterval": 30
  },
  {
    "url": "https://example2.com/blog",
    "name": "Example 2 Blog",
    "type": "crawl",
    "checkInterval": 360,
    "crawlLimit": 5,
    "crawlDepth": 1
  }
]
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Website URL to monitor |
| `name` | string | No | Display name (auto-generated from URL if not provided) |
| `type` | string | No | Monitor type: `"scrape"` (single page) or `"crawl"` (full site). Default: `"scrape"` |
| `checkInterval` | number | No | Check frequency in minutes. Default: 60 |
| `webhook` | string | No | Webhook URL for notifications |
| `crawlLimit` | number | No | Max pages to crawl (only for `type: "crawl"`). Default: 5 |
| `crawlDepth` | number | No | Max crawl depth (only for `type: "crawl"`). Default: 3 |

**Response (Single Website):**
```json
{
  "success": true,
  "message": "Website added successfully",
  "websiteId": "k57m3n8p9q2r4s6t",
  "data": {
    "url": "https://example.com",
    "name": "Example Website",
    "type": "single_page",
    "checkInterval": 60,
    "webhook": "https://your-webhook.com/endpoint",
    "crawlLimit": null,
    "crawlDepth": null
  }
}
```

**Response (Batch):**
```json
{
  "success": true,
  "message": "Batch request processed. 2 websites added successfully.",
  "results": [
    {
      "index": 0,
      "websiteId": "k57m3n8p9q2r4s6t",
      "url": "https://example1.com",
      "name": "Example 1",
      "type": "single_page",
      "checkInterval": 30,
      "webhook": null
    },
    {
      "index": 1,
      "websiteId": "a1b2c3d4e5f6g7h8",
      "url": "https://example2.com/blog",
      "name": "Example 2 Blog",
      "type": "full_site",
      "checkInterval": 360,
      "webhook": null
    }
  ],
  "total": 2,
  "successful": 2,
  "failed": 0
}
```

### 2. Pause/Resume Website Monitoring

**Endpoint:** `POST /api/pause-websites`

**Description:** Pause or resume monitoring for a specific website.

**Request Body:**
```json
{
  "websiteId": "k57m3n8p9q2r4s6t",
  "paused": true
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `websiteId` | string | Yes | ID of the website to pause/resume |
| `paused` | boolean | Yes | `true` to pause, `false` to resume |

**Response:**
```json
{
  "success": true,
  "message": "Website paused successfully",
  "websiteId": "k57m3n8p9q2r4s6t",
  "isPaused": true
}
```

### 3. Delete Website

**Endpoint:** `DELETE /api/delete-websites`

**Description:** Remove a website from monitoring and delete all associated data.

**Request Body:**
```json
{
  "websiteId": "k57m3n8p9q2r4s6t"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `websiteId` | string | Yes | ID of the website to delete |

**Response:**
```json
{
  "success": true,
  "message": "Website deleted successfully",
  "websiteId": "k57m3n8p9q2r4s6t"
}
```

### 4. API Information

**Endpoint:** `GET /api/websites`

**Description:** Get API information and available endpoints.

**Response:**
```json
{
  "message": "Firecrawl Observer API",
  "endpoints": {
    "POST /api/websites": "Add a new website to monitor",
    "POST /api/websites/pause": "Pause or resume website monitoring",
    "DELETE /api/websites/delete": "Delete a website from monitoring"
  },
  "docs": "/api-docs"
}
```

## Request/Response Formats

### Content Type
All requests must use `Content-Type: application/json`

### URL Processing
- URLs are automatically prefixed with `https://` if no protocol is specified
- `www.` is removed from hostnames for consistency
- URLs are validated before processing

### Monitor Types
- **`scrape` (Single Page):** Monitors only the specified URL
- **`crawl` (Full Site):** Crawls and monitors multiple pages starting from the specified URL

### Check Intervals
- Minimum: 0.25 minutes (15 seconds)
- Specified in minutes as decimal numbers
- Common values: 0.25, 1, 5, 15, 30, 60, 360, 1440

## Error Handling

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (invalid/missing API key) |
| 404 | Not Found (website not found or access denied) |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common Errors

**Authentication Errors:**
```json
{
  "error": "Missing or invalid authorization header"
}
```

```json
{
  "error": "Invalid API key"
}
```

**Validation Errors:**
```json
{
  "error": "Missing required field: url"
}
```

```json
{
  "error": "Invalid URL format: example"
}
```

**Access Errors:**
```json
{
  "error": "Website not found or access denied"
}
```

### Batch Error Handling
For batch requests, individual failures are reported in the `errors` array:

```json
{
  "success": true,
  "message": "Batch request processed. 1 websites added successfully.",
  "results": [...],
  "errors": [
    {
      "index": 1,
      "url": "invalid-url",
      "error": "Invalid URL format: invalid-url"
    }
  ],
  "total": 2,
  "successful": 1,
  "failed": 1
}
```

## Rate Limits

- **API Key Limit:** 5 keys per account
- **Request Rate:** No explicit rate limiting currently implemented
- **Batch Size:** No explicit limit on batch requests

## Webhook Integration

### Webhook Payload

When changes are detected, a POST request is sent to your webhook URL:

```json
{
  "event": "website_changed",
  "timestamp": "2024-01-20T10:30:00Z",
  "website": {
    "id": "k57m3n8p9q2r4s6t",
    "name": "Example Website",
    "url": "https://example.com/page"
  },
  "change": {
    "detectedAt": "2024-01-20T10:30:00Z",
    "changeType": "content_changed",
    "summary": "Page content has changed",
    "aiAnalysis": "The main heading was updated from 'Welcome' to 'Hello World'"
  }
}
```

### Webhook Headers
```
Content-Type: application/json
User-Agent: Firecrawl-Observer/1.0
```

### Webhook Proxy
For localhost/private network webhooks, the system automatically uses a proxy to ensure delivery.

### Testing Webhooks
Use the test endpoint: `https://your-domain.com/api/test-webhook`

## Code Examples

### cURL Examples

**Add Single Website:**
```bash
curl -X POST https://your-domain.com/api/websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://firecrawl.dev",
    "type": "scrape",
    "checkInterval": 0.25,
    "webhook": "https://your-webhook.com/endpoint",
    "name": "Firecrawl Homepage"
  }'
```

**Add Multiple Websites:**
```bash
curl -X POST https://your-domain.com/api/websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "url": "https://figma.com",
      "type": "scrape",
      "checkInterval": 30,
      "name": "Figma"
    },
    {
      "url": "https://github.com/blog",
      "type": "crawl",
      "checkInterval": 360,
      "crawlLimit": 10,
      "crawlDepth": 2
    }
  ]'
```

**Pause Website:**
```bash
curl -X POST https://your-domain.com/api/pause-websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteId": "k57m3n8p9q2r4s6t",
    "paused": true
  }'
```

**Delete Website:**
```bash
curl -X DELETE https://your-domain.com/api/delete-websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteId": "k57m3n8p9q2r4s6t"
  }'
```

### JavaScript Examples

**Node.js with fetch:**
```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://your-domain.com/api';

// Add website
async function addWebsite(websiteData) {
  const response = await fetch(`${BASE_URL}/websites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(websiteData)
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }
  
  return result;
}

// Usage
addWebsite({
  url: 'https://example.com',
  type: 'scrape',
  checkInterval: 60,
  webhook: 'https://your-webhook.com/endpoint'
})
.then(result => console.log('Website added:', result))
.catch(error => console.error('Error:', error));
```

**Batch Add Websites:**
```javascript
async function addMultipleWebsites(websites) {
  const response = await fetch(`${BASE_URL}/websites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(websites)
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Batch request failed');
  }
  
  return result;
}

// Usage
const websites = [
  {
    url: 'https://site1.com',
    type: 'scrape',
    checkInterval: 30
  },
  {
    url: 'https://site2.com/blog',
    type: 'crawl',
    checkInterval: 360,
    crawlLimit: 5
  }
];

addMultipleWebsites(websites)
.then(result => {
  console.log(`Added ${result.successful} websites successfully`);
  if (result.errors) {
    console.log('Errors:', result.errors);
  }
})
.catch(error => console.error('Error:', error));
```

### Python Examples

**Using requests library:**
```python
import requests
import json

API_KEY = 'your-api-key'
BASE_URL = 'https://your-domain.com/api'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Add single website
def add_website(website_data):
    response = requests.post(
        f'{BASE_URL}/websites',
        headers=headers,
        json=website_data
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error {response.status_code}: {response.json().get('error')}")

# Usage
website = {
    'url': 'https://example.com',
    'type': 'scrape',
    'checkInterval': 60,
    'webhook': 'https://your-webhook.com/endpoint'
}

try:
    result = add_website(website)
    print(f"Website added: {result['websiteId']}")
except Exception as e:
    print(f"Error: {e}")
```

## Best Practices

### Security
1. **Store API keys securely** - Use environment variables or secure key management
2. **Rotate keys regularly** - Delete old keys and create new ones periodically
3. **Use descriptive key names** - Help identify keys by purpose or application
4. **Monitor key usage** - Check last used timestamps in the dashboard

### Performance
1. **Use batch requests** - Add multiple websites in a single request when possible
2. **Set appropriate check intervals** - Balance monitoring frequency with resource usage
3. **Use webhooks efficiently** - Ensure webhook endpoints respond quickly

### Monitoring
1. **Handle errors gracefully** - Implement proper error handling and retries
2. **Log API responses** - Keep track of successful and failed requests
3. **Monitor webhook delivery** - Ensure your webhook endpoints are accessible

### URL Management
1. **Validate URLs** - Ensure URLs are accessible before adding
2. **Use consistent naming** - Provide meaningful names for websites
3. **Choose appropriate monitor types** - Use 'scrape' for single pages, 'crawl' for full sites

### Integration Patterns

**CI/CD Integration:**
```bash
# Add monitoring for newly deployed sites
curl -X POST $MONITOR_API_URL/websites \
  -H "Authorization: Bearer $MONITOR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$DEPLOYMENT_URL\",
    \"type\": \"scrape\",
    \"checkInterval\": 5,
    \"webhook\": \"$SLACK_WEBHOOK_URL\",
    \"name\": \"$PROJECT_NAME Production\"
  }"
```

**Bulk Import Script:**
```python
# Import websites from CSV
import csv

def import_websites_from_csv(filename):
    websites = []
    
    with open(filename, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            websites.append({
                'url': row['url'],
                'name': row['name'],
                'type': row.get('type', 'scrape'),
                'checkInterval': int(row.get('interval', 60)),
                'webhook': row.get('webhook')
            })
    
    # Process in batches of 10
    for i in range(0, len(websites), 10):
        batch = websites[i:i+10]
        result = add_multiple_websites(batch)
        print(f"Batch {i//10 + 1}: {result['successful']} successful, {result['failed']} failed")
```

## Support

For additional support:
1. Check the web interface at `/api-docs` for interactive examples
2. Review error messages for specific guidance
3. Monitor the webhook test endpoint for connectivity issues
4. Verify API key permissions and usage limits

---

*This documentation covers the core API functionality. For the latest updates and additional features, refer to the web interface and interactive API documentation.*