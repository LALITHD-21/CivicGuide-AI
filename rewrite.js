const fs = require('fs');

const content = fs.readFileSync('server/server.js', 'utf8');
const lines = content.split('\n');

const newTop = `/**
 * @fileoverview CivicGuide AI Server
 * Handles static asset delivery, rate limiting, and the /api/guide endpoint.
 * Includes security headers, CORS, gzip compression, and Gemini API integration.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const PORT = Number(process.env.PORT || 3000);
const MAX_PORT = PORT + 10;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 100;
const rateLimitMap = new Map();

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async function (request, response) {
  const requestUrl = new URL(request.url, 'http://127.0.0.1');
  const clientIp = request.socket.remoteAddress || 'unknown';

  const now = Date.now();
  const rateRecord = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  if (now > rateRecord.resetTime) {
    rateRecord.count = 0;
    rateRecord.resetTime = now + RATE_LIMIT_WINDOW;
  }
  rateRecord.count++;
  rateLimitMap.set(clientIp, rateRecord);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.setHeader(key, value);
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (rateRecord.count > MAX_REQUESTS) {
    sendJson(response, 429, { error: 'Too many requests. Please try again later.' });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/guide') {
    try {
      const body = await collectBody(request);
      const safeMessage = typeof body.message === 'string' ? body.message.substring(0, 500) : '';
      
      let guideResponse;
      if (GEMINI_API_KEY && safeMessage && safeMessage !== '__init__') {
        guideResponse = await fetchGeminiInsight(safeMessage, body.context, buildGuide(safeMessage, body.context || {}));
      } else {
        guideResponse = buildGuide(safeMessage, body.context || {});
      }
      
      sendJson(response, 200, guideResponse);
    } catch (err) {
      const code = err.message === 'Payload too large' ? 413 : 400;
      sendJson(response, code, { error: err.message || 'Invalid JSON body.' });
    }
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { error: 'Method not allowed.' });
    return;
  }

  serveStaticAsset(request, response, requestUrl.pathname, request.method === 'HEAD');
});

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW);

startServer(PORT);

function startServer(port) {
  server
    .once('error', function (error) {
      if (error.code === 'EADDRINUSE' && port < MAX_PORT) {
        startServer(port + 1);
        return;
      }
      throw error;
    })
    .listen(port, function () {
      console.log('CivicGuide AI is running on http://127.0.0.1:' + port);
    });
}

function collectBody(request) {
  return new Promise(function (resolve, reject) {
    let data = '';
    request.on('data', function (chunk) {
      data += chunk;
      if (Buffer.byteLength(data, 'utf8') > 100000) {
        request.destroy();
        reject(new Error('Payload too large'));
      }
    });
    request.on('end', function () {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body.'));
      }
    });
    request.on('error', reject);
  });
}

function serveStaticAsset(request, response, urlPath, headOnly) {
  const safePath = normalizeFilePath(urlPath);
  const filePath = safePath || path.join(PUBLIC_DIR, 'index.html');

  fs.stat(filePath, function (err, stats) {
    if (err || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    
    if (ext === '.html') {
      response.setHeader('Cache-Control', 'no-cache');
    } else {
      response.setHeader('Cache-Control', 'public, max-age=86400');
    }

    if (headOnly) {
      response.end();
      return;
    }

    const acceptEncoding = request.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip') && ['.html', '.css', '.js', '.json', '.svg'].includes(ext)) {
      response.setHeader('Content-Encoding', 'gzip');
      fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(response);
    } else {
      fs.createReadStream(filePath).pipe(response);
    }
  });
}

function normalizeFilePath(urlPath) {
  const route = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, route));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return null;
  }
  return filePath;
}

function sendJson(response, statusCode, payload) {
  const data = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(data)
  });
  response.end(data);
}

async function fetchGeminiInsight(message, context, localGuide) {
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;
    const profile = context?.profile || {};
    
    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { 
        parts: [{ text: 'You are CivicGuide AI. Provide a concise, neutral 1-2 paragraph overview for an election assistant. User profile: ' + JSON.stringify(profile) }] 
      },
      generationConfig: { maxOutputTokens: 150, temperature: 0.1 }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return localGuide;
    
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      localGuide.overview = text;
      localGuide.modeLabel = 'AI Enhanced Mode';
    }
    return localGuide;
  } catch (err) {
    return localGuide;
  }
}`;

const newLines = newTop.split('\n');
const remainingLines = lines.slice(128);
const finalContent = newLines.concat(remainingLines).join('\n');
fs.writeFileSync('server/server.js', finalContent);
console.log('Server file updated.');
