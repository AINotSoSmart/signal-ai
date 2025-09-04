# Observer API Keys - Quick Start Guide

🚀 **Programmatically manage your website monitoring with the Firecrawl Observer API**

## What You Can Do

The Observer API Keys feature enables you to:

✅ **Automate Website Addition** - Add websites to monitoring via scripts or applications  
✅ **Bulk Operations** - Add multiple websites at once through API calls  
✅ **System Integration** - Connect with CI/CD pipelines, monitoring dashboards, and external tools  
✅ **Remote Management** - Manage monitoring setup from anywhere programmatically  

## Quick Setup (5 minutes)

### 1. Create an API Key

1. Go to **Settings → Observer API Keys** in your dashboard
2. Click **"Create New Key"**
3. Enter a descriptive name (e.g., "CI/CD Pipeline", "Bulk Import Script")
4. **Copy the key immediately** - you won't see it again!

### 2. Test Your First Request

```bash
# Replace YOUR_API_KEY and YOUR_DOMAIN
curl -X POST https://YOUR_DOMAIN.com/api/websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "type": "scrape",
    "checkInterval": 60,
    "name": "My First API Website"
  }'
```

### 3. Verify in Dashboard

Check your dashboard - the website should appear in your monitoring list!

## Common Use Cases

### 🔄 CI/CD Integration

Automatically monitor new deployments:

```bash
# In your deployment script
curl -X POST $MONITOR_API_URL/websites \
  -H "Authorization: Bearer $MONITOR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$DEPLOYMENT_URL\",
    \"type\": \"scrape\",
    \"checkInterval\": 5,
    \"webhook\": \"$SLACK_WEBHOOK\",
    \"name\": \"$PROJECT_NAME Production\"
  }"
```

### 📊 Bulk Import

Add multiple websites from a list:

```bash
curl -X POST https://your-domain.com/api/websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "url": "https://site1.com",
      "type": "scrape",
      "checkInterval": 30,
      "name": "Site 1"
    },
    {
      "url": "https://site2.com/blog",
      "type": "crawl",
      "checkInterval": 360,
      "crawlLimit": 10,
      "name": "Site 2 Blog"
    }
  ]'
```

### 🔗 Webhook Integration

Get notified when changes are detected:

```bash
curl -X POST https://your-domain.com/api/websites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://important-site.com",
    "type": "scrape",
    "checkInterval": 15,
    "webhook": "https://hooks.slack.com/your-webhook",
    "name": "Critical Site Monitor"
  }'
```

## API Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|----------|
| `POST` | `/api/websites` | Add website(s) to monitoring |
| `POST` | `/api/pause-websites` | Pause/resume monitoring |
| `DELETE` | `/api/delete-websites` | Remove website from monitoring |
| `GET` | `/api/websites` | Get API information |

## Key Parameters

### Monitor Types
- **`"scrape"`** - Monitor single page only
- **`"crawl"`** - Monitor entire website (multiple pages)

### Check Intervals (minutes)
- **`0.25`** - Every 15 seconds (high frequency)
- **`1`** - Every minute
- **`5`** - Every 5 minutes
- **`30`** - Every 30 minutes
- **`60`** - Every hour (default)
- **`360`** - Every 6 hours
- **`1440`** - Daily

### Crawl Settings (for `type: "crawl"` only)
- **`crawlLimit`** - Max pages to crawl (default: 5)
- **`crawlDepth`** - Max depth to crawl (default: 3)

## Response Examples

### ✅ Success Response
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
    "webhook": null
  }
}
```

### ❌ Error Response
```json
{
  "error": "Missing required field: url"
}
```

## Security Best Practices

🔐 **API Key Security:**
- Store keys in environment variables, not code
- Use descriptive names to identify key purposes
- Rotate keys regularly
- Delete unused keys immediately
- Monitor key usage in the dashboard

🛡️ **Request Security:**
- Always use HTTPS
- Validate URLs before adding
- Implement proper error handling
- Use webhook authentication when possible

## Troubleshooting

### Common Issues

**❌ "Invalid API key"**
- Check the Authorization header format: `Bearer YOUR_API_KEY`
- Verify the key hasn't been deleted
- Ensure you're using the correct key

**❌ "Missing required field: url"**
- Ensure the `url` field is included in your request
- Check JSON formatting

**❌ "Invalid URL format"**
- URLs must be valid and accessible
- Protocol (http/https) is automatically added if missing

### Testing Your Setup

1. **Test API connectivity:**
   ```bash
   curl -X GET https://your-domain.com/api/websites
   ```

2. **Test authentication:**
   ```bash
   curl -X POST https://your-domain.com/api/websites \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://httpbin.org/get"}'
   ```

3. **Test webhook delivery:**
   Use the test endpoint: `https://your-domain.com/api/test-webhook`

## Language Examples

### JavaScript/Node.js
```javascript
const response = await fetch('https://your-domain.com/api/websites', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    type: 'scrape',
    checkInterval: 60
  })
});

const result = await response.json();
console.log(result);
```

### Python
```python
import requests

response = requests.post(
    'https://your-domain.com/api/websites',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'url': 'https://example.com',
        'type': 'scrape',
        'checkInterval': 60
    }
)

print(response.json())
```

### PHP
```php
$data = [
    'url' => 'https://example.com',
    'type' => 'scrape',
    'checkInterval' => 60
];

$options = [
    'http' => [
        'header' => [
            'Authorization: Bearer YOUR_API_KEY',
            'Content-Type: application/json'
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents('https://your-domain.com/api/websites', false, $context);
echo $result;
```

## Next Steps

1. **📖 Read the full documentation:** [`docs/API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)
2. **🌐 Try the interactive docs:** Visit `/api-docs` in your dashboard
3. **🔗 Set up webhooks:** Configure notifications for your monitoring
4. **⚡ Automate your workflow:** Integrate with your existing tools

## Limits & Quotas

- **API Keys:** Maximum 5 per account
- **Batch Requests:** No explicit limit
- **Rate Limiting:** None currently implemented
- **Website Monitoring:** Based on your account plan

---

**Need Help?** Check the interactive API documentation at `/api-docs` in your dashboard for live examples and testing tools.

**Ready to scale?** The API enables the same functionality as the web interface, so anything you can do manually, you can now automate! 🚀