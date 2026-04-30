/**
 * @fileoverview CivicGuide AI Server
 * Handles static asset delivery, rate limiting, and the /api/guide endpoint.
 * Includes security headers, CORS, gzip compression, and optional AI integration.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = Number(process.env.PORT || 3000);
const MAX_PORT = PORT + 10;
const PUBLIC_DIR = path.join(__dirname, "..", "public");
loadEnvFile(path.join(__dirname, "..", ".env"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 60;
const rateLimitMap = new Map();

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://www.google-analytics.com;",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = http.createServer(async function (request, response) {
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  const clientIp = request.socket.remoteAddress || "unknown";

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

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (rateRecord.count > MAX_REQUESTS) {
    sendJson(request, response, 429, { error: "Too many requests. Please try again later." });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/guide") {
    try {
      const body = await collectBody(request);
      const safeMessage = typeof body.message === "string" ? body.message.substring(0, 500) : "";
      
      const localGuide = buildGuide(safeMessage, body.context || {});
      let guideData;
      if (OPENAI_API_KEY && safeMessage && safeMessage !== "__init__") {
        guideData = await generateWithOpenAI(safeMessage, body.context || {}, localGuide);
      } else if (GEMINI_API_KEY && safeMessage && safeMessage !== "__init__") {
        guideData = await generateWithGemini(safeMessage, body.context || {}, localGuide);
      } else {
        guideData = localGuide;
      }
      sendJson(request, response, 200, guideData);
    } catch (err) {
      const code = err.message === "Payload too large" ? 413 : 400;
      sendJson(request, response, code, { error: err.message || "Invalid JSON body." });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(request, response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(request, response, 405, { error: "Method not allowed." });
    return;
  }

  serveStaticAsset(request, response, requestUrl.pathname, request.method === "HEAD");
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
    .once("error", function (error) {
      if (error.code === "EADDRINUSE" && port < MAX_PORT) {
        startServer(port + 1);
        return;
      }
      throw error;
    })
    .listen(port, function () {
      console.log("CivicGuide AI is running on http://127.0.0.1:" + port);
      if (OPENAI_API_KEY) console.log("OpenAI integration: ACTIVE (" + OPENAI_MODEL + ")");
      if (GEMINI_API_KEY) console.log("Gemini API integration: ACTIVE");
    });
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    const envText = fs.readFileSync(filePath, "utf8");
    envText.split(/\r?\n/).forEach(function (line) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || Object.prototype.hasOwnProperty.call(process.env, match[1])) {
        return;
      }

      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    });
  } catch (error) {
    console.warn("Unable to load .env file:", error.message);
  }
}

function collectBody(request) {
  return new Promise(function (resolve, reject) {
    let data = "";
    let bodySize = 0;
    let tooLarge = false;

    request.on("data", function (chunk) {
      bodySize += chunk.length;
      if (bodySize > 100000) {
        tooLarge = true;
        data = "";
        return;
      }

      if (tooLarge) {
        return;
      }

      data += chunk;
    });

    request.on("end", function () {
      if (tooLarge) {
        reject(new Error("Payload too large"));
        return;
      }

      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });

    request.on("error", reject);
  });
}

function serveStaticAsset(request, response, urlPath, headOnly) {
  const safePath = normalizeFilePath(urlPath);
  const filePath = safePath || path.join(PUBLIC_DIR, "index.html");

  fs.stat(filePath, function (err, stats) {
    if (err || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
    
    if (ext === ".html") {
      response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    } else if ([".css", ".js", ".png", ".jpg", ".svg"].includes(ext)) {
      response.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
    }

    if (headOnly) {
      response.end();
      return;
    }

    const acceptEncoding = request.headers["accept-encoding"] || "";
    if (acceptEncoding.includes("gzip") && [".html", ".css", ".js", ".json", ".svg"].includes(ext)) {
      response.setHeader("Content-Encoding", "gzip");
      fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(response);
    } else if (acceptEncoding.includes("deflate") && [".html", ".css", ".js", ".json", ".svg"].includes(ext)) {
      response.setHeader("Content-Encoding", "deflate");
      fs.createReadStream(filePath).pipe(zlib.createDeflate()).pipe(response);
    } else {
      fs.createReadStream(filePath).pipe(response);
    }
  });
}

function normalizeFilePath(urlPath) {
  const route = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, route));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return null;
  }
  return filePath;
}

function sendJson(request, response, statusCode, payload) {
  const jsonStr = JSON.stringify(payload);
  const acceptEncoding = request.headers["accept-encoding"] || "";
  
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  if (acceptEncoding.includes("gzip")) {
    zlib.gzip(jsonStr, (err, buffer) => {
      if (err) {
        response.writeHead(500, headers);
        response.end(JSON.stringify({ error: "Compression failed" }));
        return;
      }
      headers["Content-Encoding"] = "gzip";
      headers["Content-Length"] = buffer.length;
      response.writeHead(statusCode, headers);
      response.end(buffer);
    });
  } else {
    headers["Content-Length"] = Buffer.byteLength(jsonStr);
    response.writeHead(statusCode, headers);
    response.end(jsonStr);
  }
}

async function generateWithOpenAI(message, context, localFallback) {
  if (!OPENAI_API_KEY || message === "__init__" || message.length < 5) return localFallback;

  const profile = normalizeProfile((context && context.profile) || {});
  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, 10000);

  try {
    const prompt = [
      "User question: " + message,
      "Location: " + (profile.location || "Unknown"),
      "Age group: " + (profile.ageGroup || "Unknown"),
      "Registration status: " + (profile.registered || "Unknown"),
      "Local fallback title: " + localFallback.title,
      "Local fallback next action: " + localFallback.nextAction
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: [
          "You are CivicGuide AI, a neutral election guidance assistant.",
          "Write a concise, practical 1-2 paragraph overview for the user.",
          "Do not invent election deadlines. Tell users to confirm final details with official election sources.",
          "For India, prefer Election Commission of India and Voters' Service Portal references.",
          "Keep the tone calm, clear, and non-partisan."
        ].join(" "),
        input: prompt,
        max_output_tokens: 320
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.warn("OpenAI request failed with status", response.status);
      return localFallback;
    }

    const data = await response.json();
    const aiText = extractOpenAIText(data);
    if (!aiText) {
      return localFallback;
    }

    return Object.assign({}, localFallback, {
      overview: aiText,
      modeLabel: "OpenAI Enhanced Mode"
    });
  } catch (err) {
    console.warn("OpenAI integration failed:", err.message);
    return localFallback;
  } finally {
    clearTimeout(timeout);
  }
}

function extractOpenAIText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return "";
}

async function generateWithGemini(message, context, localFallback) {
  if (!GEMINI_API_KEY || message === "__init__" || message.length < 5) return localFallback;
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;
    const profile = context.profile || {};
    const systemInstruction = "You are CivicGuide AI. Provide a concise, neutral 1-2 paragraph overview for an election assistant. User profile: Location: " + (profile.location || "Unknown") + ", Age: " + (profile.ageGroup || "Unknown") + ", Registered: " + (profile.registered || "Unknown") + ".";
    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.1, maxOutputTokens: 250 }
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return localFallback;
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiText) {
      const enhancedGuide = Object.assign({}, localFallback);
      enhancedGuide.overview = aiText;
      enhancedGuide.modeLabel = "AI Enhanced Mode";
      return enhancedGuide;
    }
    return localFallback;
  } catch (err) {
    return localFallback;
  }
}

function buildGuide(message, context) {
  const profile = normalizeProfile((context && context.profile) || {});
  const lower = String(message || "").toLowerCase();
  const needsIntro = message === "__init__" || !profile.location || !profile.ageGroup || !profile.registered;

  if (needsIntro) {
    return buildIntroGuide(profile);
  }

  const faqMode = /faq|question/.test(lower);
  const simpleMode = /15|simple|confused|easier/.test(lower);
  const passedDeadline = /missed|passed|too late|deadline passed/.test(lower);

  return {
    title: buildTitle(profile, lower, faqMode),
    overview: buildOverview(profile, simpleMode, passedDeadline),
    steps: buildSteps(profile, faqMode, passedDeadline),
    timeline: buildTimeline(profile, passedDeadline),
    requirements: buildRequirements(profile),
    userStatus: buildUserStatus(profile, passedDeadline),
    nextAction: buildNextAction(profile, passedDeadline),
    suggestions: buildSuggestions(profile, faqMode),
    checklist: buildChecklist(profile, faqMode),
    progress: buildProgress(profile, faqMode, passedDeadline),
    resources: getResources(profile.location),
    reminderNote: buildReminder(profile, passedDeadline),
    statusLine: buildStatusLine(profile),
    modeLabel: simpleMode ? "Explain like I'm 15" : faqMode ? "FAQ mode" : "Guided mode",
    profile: profile
  };
}

function normalizeProfile(profile) {
  return {
    location: profile.location || "",
    ageGroup: profile.ageGroup || "",
    registered: profile.registered || ""
  };
}

function buildIntroGuide(profile) {
  return {
    title: "Let us set your starting point",
    overview: "I can guide you best after three details: your location, your age group, and whether you are registered. Think of it like setting your route before a trip.",
    steps: [
      "Step 1: Enter your country or region.",
      "Step 2: Pick your age group.",
      "Step 3: Tell me whether you are registered."
    ],
    timeline: [
      "Key deadlines depend on your location.",
      "Registration usually comes before voting day.",
      "Status checks are safest one to two weeks before voting."
    ],
    requirements: [
      "Eligibility usually starts at age 18.",
      "Most places also use citizenship or residency rules.",
      "Official ID or address proof is often needed."
    ],
    userStatus: "Your profile is still incomplete, so the guidance is general for now.",
    nextAction: "Fill in location, age group, and registration status, then press Update guidance.",
    suggestions: [
      "How do I register to vote?",
      "What documents do I need?",
      "Explain like I'm 15"
    ],
    checklist: [
      { id: "profile-location", title: "Add your location", detail: "Country, state, or region.", done: Boolean(profile.location) },
      { id: "profile-age", title: "Pick your age group", detail: "This changes eligibility guidance.", done: Boolean(profile.ageGroup) },
      { id: "profile-registered", title: "Set registration status", detail: "Yes, no, or not sure.", done: Boolean(profile.registered) },
      { id: "profile-questions", title: "Ask your first question", detail: "Try deadlines, ID, or voting day.", done: false },
      { id: "profile-next", title: "Get your next action", detail: "I will personalize it once the profile is ready.", done: false }
    ],
    progress: {
      current: 1,
      total: 5,
      steps: [
        "Set profile",
        "Check eligibility",
        "Register or confirm",
        "Prepare documents",
        "Plan voting day"
      ]
    },
    resources: getResources(profile.location),
    reminderNote: "",
    statusLine: "Start with your location, age group, and registration status.",
    modeLabel: "Guided mode",
    profile: profile
  };
}

function buildTitle(profile, lower, faqMode) {
  if (faqMode) {
    return "Quick election answers";
  }
  if (/document|id/.test(lower)) {
    return "What you will likely need";
  }
  if (/deadline|date|timeline/.test(lower)) {
    return "Your election timeline";
  }
  if (profile.registered === "no") {
    return "How to get vote-ready";
  }
  if (profile.registered === "yes") {
    return "You are close to voting day";
  }
  if (profile.registered === "unsure") {
    return "First confirm your registration";
  }
  return "Your next election step";
}

function buildOverview(profile, simpleMode, passedDeadline) {
  if (profile.ageGroup === "under-18") {
    return "You may not be old enough to vote yet, but you can still prepare early. Think of this as setting the board before the game starts.";
  }
  if (passedDeadline) {
    return "If the current deadline has passed, do not panic. The smart move is to prepare for the next election cycle now so the next step feels easy later.";
  }
  if (profile.registered === "no") {
    return simpleMode
      ? "You need to get onto the voter list before you can vote. First register, then gather documents, then check your final details."
      : "You are in the registration stage, which comes before every other voting step. Once you are on the voter list, the rest becomes simpler and more predictable.";
  }
  if (profile.registered === "yes") {
    return simpleMode
      ? "Good news: you are already registered. Now focus on checking your status, getting your documents ready, and planning how you will vote."
      : "Registration is already behind you, so your main job is confirmation and preparation. That means checking your record, watching deadlines, and planning voting day.";
  }
  return "You are close, but the first move is to confirm whether you are already registered. Once that is clear, the rest of the path becomes much easier to personalize.";
}

function buildSteps(profile, faqMode, passedDeadline) {
  if (faqMode) {
    return [
      "Step 1: Check if you are eligible by age, citizenship, and residency rules.",
      "Step 2: Find your official registration or status-check website.",
      "Step 3: Prepare ID, address proof, and your voting-day plan."
    ];
  }
  if (profile.ageGroup === "under-18") {
    return [
      "Step 1: Check whether your area allows pre-registration.",
      "Step 2: Save the next election cycle and your eligibility milestone.",
      "Step 3: Learn which documents you will need once you are eligible."
    ];
  }
  if (passedDeadline) {
    return [
      "Step 1: Confirm whether the current registration or ballot request deadline is already over.",
      "Step 2: If it is over, plan for the next election cycle right away.",
      "Step 3: Set a reminder so you start earlier next time."
    ];
  }
  if (profile.registered === "no") {
    return [
      "Step 1: Use the official registration portal for your location.",
      "Step 2: Submit the form with your identity and address details.",
      "Step 3: Check back for confirmation and save proof of your status."
    ];
  }
  if (profile.registered === "yes") {
    return [
      "Step 1: Confirm your registration record is active and correct.",
      "Step 2: Review deadlines for early, mail, or in-person voting.",
      "Step 3: Gather your documents and plan what to expect on voting day."
    ];
  }
  return [
    "Step 1: Check your registration status using the official election site.",
    "Step 2: If not registered, complete registration right away.",
    "Step 3: If registered, move to documents, deadlines, and voting-day planning."
  ];
}

function buildTimeline(profile, passedDeadline) {
  if (profile.ageGroup === "under-18") {
    return [
      "Check pre-registration rules now.",
      "Watch for your 18th birthday or local eligibility date.",
      "Review the next election cycle early so you are ready in time."
    ];
  }
  if (passedDeadline) {
    return [
      "Key deadline: confirm whether the current cutoff is already over.",
      "Important date: note the next election cycle as soon as it is published.",
      "Set reminders at least 30 days and 7 days before the next big deadline."
    ];
  }
  if (profile.registered === "no") {
    return [
      "Register before the local cutoff, often two to four weeks before voting day.",
      "Check status after submitting so errors do not surprise you later.",
      "Keep voting day and any early-voting window on your calendar."
    ];
  }
  return [
    "Check your registration details one to two weeks before voting.",
    "Watch any deadline for mail ballots or early voting.",
    "Confirm voting-day hours and location before you leave home."
  ];
}

function buildRequirements(profile) {
  const items = [];

  if (profile.ageGroup === "under-18") {
    items.push("Eligibility: many places require you to be 18 by election day.");
  } else {
    items.push("Eligibility: age, citizenship, and residency rules usually apply.");
  }

  if (profile.registered === "no") {
    items.push("Documents: registration often needs ID plus proof of address.");
  } else {
    items.push("Documents: bring approved ID and any registration confirmation if your area requires it.");
  }

  items.push("Check your official election office because exact rules change by location.");
  return items;
}

function buildUserStatus(profile, passedDeadline) {
  if (profile.ageGroup === "under-18") {
    return "Based on your age group, you may still be in the preparation stage rather than the voting stage.";
  }
  if (passedDeadline) {
    return "You may need to aim for the next election cycle if the current cutoff has already passed.";
  }
  if (profile.registered === "no") {
    return "You told me you are not registered, so registration is the main blocker right now.";
  }
  if (profile.registered === "yes") {
    return "You told me you are registered, so your focus is now status checks, deadlines, and voting-day prep.";
  }
  return "You are not sure whether you are registered, so the best next step is a status check.";
}

function buildNextAction(profile, passedDeadline) {
  if (profile.ageGroup === "under-18") {
    return "Check whether pre-registration exists in your area, then save the next key date in your calendar.";
  }
  if (passedDeadline) {
    return "Use Check Status or Deadlines next, then set a reminder for the next cycle.";
  }
  if (profile.registered === "no") {
    return "Tap Register Now and complete the official registration form for your location.";
  }
  if (profile.registered === "yes") {
    return "Tap Check Status, then review your voting method and documents.";
  }
  return "Tap Check Status first so we know whether to route you into registration or voting-day planning.";
}

function buildChecklist(profile, faqMode) {
  if (faqMode) {
    return [
      { id: "faq-eligibility", title: "Check eligibility", detail: "Age, citizenship, and residency.", done: false },
      { id: "faq-status", title: "Find your official portal", detail: "Use location-specific links below.", done: false },
      { id: "faq-docs", title: "Gather likely documents", detail: "ID and address proof are common.", done: false },
      { id: "faq-dates", title: "Write down deadlines", detail: "Registration and voting day.", done: false },
      { id: "faq-vote", title: "Plan voting day", detail: "Hours, place, and method.", done: false }
    ];
  }
  if (profile.ageGroup === "under-18") {
    return [
      { id: "u18-pre", title: "Check pre-registration", detail: "Some places allow it before 18.", done: false },
      { id: "u18-date", title: "Save eligibility date", detail: "Know when you can register or vote.", done: false },
      { id: "u18-docs", title: "Learn the document list", detail: "ID and address proof are common.", done: false },
      { id: "u18-portal", title: "Find the official portal", detail: "Save the correct election office link.", done: false },
      { id: "u18-next", title: "Set a reminder", detail: "Return before the next election cycle.", done: false }
    ];
  }
  if (profile.registered === "no") {
    return [
      { id: "reg-eligibility", title: "Confirm eligibility", detail: "Age, citizenship, and residency rules.", done: false },
      { id: "reg-register", title: "Submit registration", detail: "Use the official portal for your area.", done: false },
      { id: "reg-status", title: "Check confirmation", detail: "Make sure your record appears correctly.", done: false },
      { id: "reg-docs", title: "Prepare documents", detail: "Photo ID and address proof are common.", done: false },
      { id: "reg-plan", title: "Plan voting day", detail: "Know where and how you will vote.", done: false }
    ];
  }
  if (profile.registered === "yes") {
    return [
      { id: "yes-status", title: "Check active status", detail: "Confirm your details are correct.", done: false },
      { id: "yes-docs", title: "Gather required ID", detail: "Bring approved documents.", done: false },
      { id: "yes-method", title: "Choose voting method", detail: "In-person, early, or mail if available.", done: false },
      { id: "yes-deadlines", title: "Note deadlines", detail: "Watch mail and early-voting cutoffs.", done: false },
      { id: "yes-day", title: "Prepare for voting day", detail: "Confirm hours and location.", done: false }
    ];
  }
  return [
    { id: "unsure-check", title: "Check registration status", detail: "Use the official status tool.", done: false },
    { id: "unsure-branch", title: "Choose your next branch", detail: "Register if needed, prepare if already active.", done: false },
    { id: "unsure-docs", title: "Review documents", detail: "Keep likely ID ready.", done: false },
    { id: "unsure-deadlines", title: "Write down deadlines", detail: "Status, registration, and voting day.", done: false },
    { id: "unsure-vote", title: "Plan voting day", detail: "Know the method, place, and hours.", done: false }
  ];
}

function buildProgress(profile, faqMode, passedDeadline) {
  if (faqMode) {
    return {
      current: 2,
      total: 5,
      steps: [
        "Profile ready",
        "Know the rules",
        "Check status",
        "Prepare documents",
        "Plan voting day"
      ]
    };
  }
  if (profile.ageGroup === "under-18") {
    return {
      current: 1,
      total: 5,
      steps: [
        "Check pre-registration",
        "Save future dates",
        "Learn the documents",
        "Find the official portal",
        "Return when eligible"
      ]
    };
  }
  if (passedDeadline) {
    return {
      current: 3,
      total: 5,
      steps: [
        "Check status",
        "Confirm deadlines",
        "Switch to next cycle",
        "Set reminders",
        "Start early next time"
      ]
    };
  }
  if (profile.registered === "no") {
    return {
      current: 2,
      total: 5,
      steps: [
        "Profile ready",
        "Register to vote",
        "Confirm status",
        "Gather documents",
        "Plan voting day"
      ]
    };
  }
  if (profile.registered === "yes") {
    return {
      current: 3,
      total: 5,
      steps: [
        "Profile ready",
        "Registration complete",
        "Check status",
        "Gather documents",
        "Plan voting day"
      ]
    };
  }
  return {
    current: 2,
    total: 5,
    steps: [
      "Profile ready",
      "Check registration",
      "Choose next branch",
      "Prepare documents",
      "Plan voting day"
    ]
  };
}

function buildSuggestions(profile, faqMode) {
  if (faqMode) {
    return [
      "What ID do I need?",
      "What happens on voting day?",
      "Explain like I'm 15"
    ];
  }
  if (profile.ageGroup === "under-18") {
    return [
      "Can I pre-register?",
      "What documents will I need later?",
      "Explain like I'm 15"
    ];
  }
  if (profile.registered === "no") {
    return [
      "Register now",
      "What documents do I need?",
      "Show key deadlines"
    ];
  }
  if (profile.registered === "yes") {
    return [
      "Check my registration status",
      "What should I expect on voting day?",
      "Show key deadlines"
    ];
  }
  return [
    "Check my registration status",
    "How do I register to vote?",
    "Explain like I'm 15"
  ];
}

function buildReminder(profile, passedDeadline) {
  if (passedDeadline) {
    return "Reminder idea: set one alert 30 days before the next registration cutoff and another 7 days before it.";
  }
  if (profile.registered === "no") {
    return "Reminder idea: check your registration confirmation a few days after you submit the form.";
  }
  if (profile.registered === "yes") {
    return "Reminder idea: confirm your polling place and required ID about one week before voting day.";
  }
  return "Reminder idea: check your official status tool before you do anything else.";
}

function buildStatusLine(profile) {
  if (profile.ageGroup === "under-18") {
    return "You are in prep mode for a future election cycle.";
  }
  if (profile.registered === "no") {
    return "Registration is your main next step.";
  }
  if (profile.registered === "yes") {
    return "You are in confirmation and voting-day prep mode.";
  }
  return "Status check comes first.";
}

function getResources(location) {
  const lower = String(location || "").toLowerCase();

  if (/(india|delhi|mumbai|bengaluru|karnataka|maharashtra)/.test(lower)) {
    return [
      {
        label: "Voters' Service Portal",
        description: "Official portal for registration and updates in India.",
        url: "https://voters.eci.gov.in/"
      },
      {
        label: "Electoral Search",
        description: "Check whether your name is on the voter roll.",
        url: "https://electoralsearch.eci.gov.in/"
      },
      {
        label: "ECI Results",
        description: "Official Election Commission results portal.",
        url: "https://results.eci.gov.in/"
      }
    ];
  }

  if (/(united states|usa|us|california|texas|florida|new york)/.test(lower)) {
    return [
      {
        label: "Vote.gov",
        description: "Official US voter registration starting point.",
        url: "https://vote.gov/"
      },
      {
        label: "Vote.org Status Check",
        description: "Find your voter registration details.",
        url: "https://www.vote.org/am-i-registered-to-vote/"
      },
      {
        label: "US EAC",
        description: "Federal election information and voter resources.",
        url: "https://www.eac.gov/voters"
      }
    ];
  }

  if (/(united kingdom|uk|england|scotland|wales|northern ireland|london)/.test(lower)) {
    return [
      {
        label: "Register to Vote",
        description: "Official UK registration page.",
        url: "https://www.gov.uk/register-to-vote"
      },
      {
        label: "Electoral Commission",
        description: "Election information and official guidance.",
        url: "https://www.electoralcommission.org.uk/"
      },
      {
        label: "Polling Information",
        description: "Find UK election and voting details.",
        url: "https://www.gov.uk/elections-in-the-uk"
      }
    ];
  }

  if (/(canada|ontario|alberta|british columbia|quebec)/.test(lower)) {
    return [
      {
        label: "Elections Canada",
        description: "Official federal election information.",
        url: "https://www.elections.ca/"
      },
      {
        label: "Voter Registration Service",
        description: "Check or update registration details.",
        url: "https://ereg.elections.ca/"
      },
      {
        label: "Ways to Vote",
        description: "Official guide to voting options in Canada.",
        url: "https://www.elections.ca/content.aspx?section=vot&dir=vote&document=index&lang=e"
      }
    ];
  }

  if (/(australia|sydney|melbourne|queensland|victoria|new south wales)/.test(lower)) {
    return [
      {
        label: "Australian Electoral Commission",
        description: "Official enrolment and election guidance.",
        url: "https://www.aec.gov.au/"
      },
      {
        label: "Enrol to Vote",
        description: "Official voter enrolment page.",
        url: "https://www.aec.gov.au/enrol/"
      },
      {
        label: "Check Enrolment",
        description: "Find your electoral details.",
        url: "https://check.aec.gov.au/"
      }
    ];
  }

  return [
    {
      label: "Official Election Office",
      description: "Search for your national or regional election office.",
      url: "https://www.google.com/search?q=official+election+office"
    },
    {
      label: "Registration Search",
      description: "Look for your local voter registration page.",
      url: "https://www.google.com/search?q=voter+registration+official"
    },
    {
      label: "Voting Day Information",
      description: "Find your local official voting guidance.",
      url: "https://www.google.com/search?q=official+voting+information"
    }
  ];
}
