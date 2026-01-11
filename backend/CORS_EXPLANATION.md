# Understanding CORS Error

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a security mechanism implemented by web browsers that blocks requests from one origin (domain, port, or protocol) to another origin unless the server explicitly allows it.

## Why Did This Error Occur?

1. **Frontend Origin:** `http://localhost:3500`
2. **Backend Origin:** `http://localhost:5500`
3. **Problem:** These are different origins (different ports), so the browser blocked the request
4. **Error Message:** "No 'Access-Control-Allow-Origin' header is present on the requested resource"

## The Solution

I've added CORS middleware to your Express backend (`backend/src/app.js`) that:
- Allows requests from `http://localhost:3500` (your frontend)
- Allows necessary HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Allows required headers (Content-Type, Authorization, etc.)
- Handles preflight OPTIONS requests

## How It Works

When a browser makes a cross-origin request, it first sends a **preflight request** (OPTIONS) to check if the server allows the actual request. Our CORS middleware:

1. Adds the `Access-Control-Allow-Origin` header to all responses
2. Handles the OPTIONS preflight request
3. Allows the actual request to proceed

## Testing

After restarting your backend server, the frontend should be able to make API calls without CORS errors.

## Production Considerations

For production, you should:
1. Use environment variables for allowed origins
2. Restrict origins to your actual frontend domain(s)
3. Consider using the `cors` npm package for more advanced configuration

Example production CORS setup:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3500'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  // ... rest of CORS headers
});
```
