const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const MAX_PORT = PORT + 10;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

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

const server = http.createServer(function (request, response) {
  const requestUrl = new URL(request.url, "http://127.0.0.1");

  if (request.method === "POST" && requestUrl.pathname === "/api/guide") {
    collectBody(request)
      .then(function (body) {
        sendJson(response, 200, buildGuide(body.message, body.context || {}));
      })
      .catch(function () {
        sendJson(response, 400, { error: "Invalid JSON body." });
      });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  serveStaticAsset(requestUrl.pathname, response, request.method === "HEAD");
});

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
    });
}

function collectBody(request) {
  return new Promise(function (resolve, reject) {
    let data = "";

    request.on("data", function (chunk) {
      data += chunk;
      if (data.length > 100000) {
        request.destroy();
        reject(new Error("Body too large"));
      }
    });

    request.on("end", function () {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function serveStaticAsset(urlPath, response, headOnly) {
  const safePath = normalizeFilePath(urlPath);
  const filePath = safePath || path.join(PUBLIC_DIR, "index.html");

  fs.readFile(filePath, function (error, buffer) {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });

    if (headOnly) {
      response.end();
      return;
    }

    response.end(buffer);
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

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
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
