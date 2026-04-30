(function () {
  "use strict";

  const ICONS = {
    overview: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    steps: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    timeline: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    requirements: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    status: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    next: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>'
  };

  const STORAGE_KEYS = {
    profile: "cg_profile",
    checklist: "cg_checklist",
    reminder: "cg_reminder",
    plan: "cg_election_plan",
    quiz: "cg_quiz",
    kit: "cg_voting_kit",
    user: "cg_user_profile",
    theme: "cg_theme"
  };

  const ui = {
    themeToggle: document.getElementById("theme-toggle"),
    themeToggleLabel: document.getElementById("theme-toggle-label"),
    userProfileForm: document.getElementById("user-profile-form"),
    userNameInput: document.getElementById("user-name-input"),
    voterRoleSelect: document.getElementById("voter-role-select"),
    languageSelect: document.getElementById("language-select"),
    userAvatar: document.getElementById("user-avatar"),
    userDisplayName: document.getElementById("user-display-name"),
    userProfileLine: document.getElementById("user-profile-line"),
    profileForm: document.getElementById("profile-form"),
    locationInput: document.getElementById("location-input"),
    ageSelect: document.getElementById("age-select"),
    registeredToggle: document.getElementById("registered-toggle"),
    signalStrip: document.getElementById("signal-strip"),
    chatStream: document.getElementById("chat-stream"),
    chatForm: document.getElementById("chat-form"),
    chatInput: document.getElementById("chat-input"),
    statusLine: document.getElementById("status-line"),
    badgeLocation: document.getElementById("badge-location"),
    badgeAge: document.getElementById("badge-age"),
    badgeRegistered: document.getElementById("badge-registered"),
    badgeUser: document.getElementById("badge-user"),
    heroStage: document.getElementById("hero-stage"),
    heroReadiness: document.getElementById("hero-readiness"),
    heroFocus: document.getElementById("hero-focus"),
    progressLabel: document.getElementById("progress-label"),
    checklistCount: document.getElementById("checklist-count"),
    progressFill: document.getElementById("progress-fill"),
    progressSteps: document.getElementById("progress-steps"),
    reminderNote: document.getElementById("reminder-note"),
    checklistList: document.getElementById("checklist-list"),
    quickActions: document.getElementById("quick-actions"),
    resourceLinks: document.getElementById("resource-links"),
    newsList: document.getElementById("news-list"),
    plannerForm: document.getElementById("planner-form"),
    electionDateInput: document.getElementById("election-date-input"),
    votingMethodSelect: document.getElementById("voting-method-select"),
    planCountdown: document.getElementById("plan-countdown"),
    planMethodLabel: document.getElementById("plan-method-label"),
    planSummary: document.getElementById("plan-summary"),
    planMilestones: document.getElementById("plan-milestones"),
    copyPlanButton: document.getElementById("copy-plan-button"),
    clearPlanButton: document.getElementById("clear-plan-button"),
    quizScore: document.getElementById("quiz-score"),
    quizProgressText: document.getElementById("quiz-progress-text"),
    quizQuestion: document.getElementById("quiz-question"),
    quizOptions: document.getElementById("quiz-options"),
    quizFeedback: document.getElementById("quiz-feedback"),
    quizNextButton: document.getElementById("quiz-next-button"),
    quizResetButton: document.getElementById("quiz-reset-button"),
    kitForm: document.getElementById("kit-form"),
    kitPlaceInput: document.getElementById("kit-place-input"),
    kitTravelInput: document.getElementById("kit-travel-input"),
    kitNoteInput: document.getElementById("kit-note-input"),
    kitReadyCount: document.getElementById("kit-ready-count"),
    kitItems: document.getElementById("kit-items"),
    copyKitButton: document.getElementById("copy-kit-button"),
    clearKitButton: document.getElementById("clear-kit-button")
  };

  const state = {
    theme: "light",
    userProfile: {
      name: "",
      role: "",
      language: ""
    },
    profile: {
      location: "",
      ageGroup: "",
      registered: ""
    },
    checklistState: {},
    reminderNote: "",
    electionPlan: {
      electionDate: "",
      votingMethod: ""
    },
    quiz: {
      index: 0,
      answers: []
    },
    votingKit: {
      place: "",
      travel: "",
      note: "",
      packed: {
        id: false,
        confirmation: false,
        phone: false,
        water: false
      }
    },
    currentChecklist: [],
    guideNextAction: "Add your location, age group, and registration status.",
    progress: {
      current: 1,
      total: 5,
      steps: [
        "Check eligibility",
        "Register or confirm status",
        "Gather documents",
        "Plan your vote",
        "Vote with confidence"
      ]
    },
    lastPrompt: "",
    repeatCount: 0
  };

  const QUIZ_QUESTIONS = [
    {
      question: "What is the safest first step before relying on any voting plan?",
      options: ["Check official registration status", "Ask a friend", "Wait for election day"],
      answer: 0,
      topic: "Check my registration status",
      detail: "Official status checks catch name, address, and eligibility problems early."
    },
    {
      question: "Which source should you trust most for deadlines and ID rules?",
      options: ["A social media post", "Your official election office", "An old news article"],
      answer: 1,
      topic: "Show official election resources",
      detail: "Election rules change by location, so official election offices are the reliable source."
    },
    {
      question: "When should you gather ID or address documents?",
      options: ["Only after reaching the polling place", "A few days before voting", "After results are announced"],
      answer: 1,
      topic: "What documents do I need?",
      detail: "Preparing documents before voting day lowers the chance of last-minute problems."
    },
    {
      question: "If you are not sure whether you are registered, what should happen next?",
      options: ["Skip the election", "Check status, then register if needed", "Create a new unofficial form"],
      answer: 1,
      topic: "Am I eligible to vote?",
      detail: "A status check tells you whether to continue with registration or move to voting-day prep."
    }
  ];

  const NEWS_UPDATES = [
    {
      tag: "Turnout",
      date: "29 Apr 2026",
      title: "West Bengal Phase-II records 91.66% poll participation",
      summary: "ECI-linked updates reported West Bengal's highest-ever poll participation since Independence for Phase-II.",
      sourceLabel: "ECI update listing",
      url: "https://voterlist.co.in/eci-latest-updates-press-releases-notifications/",
      prompt: "Explain West Bengal Phase-II 91.66% poll participation"
    },
    {
      tag: "Enforcement",
      date: "27 Apr 2026",
      title: "Election seizures in West Bengal surpass Rs 510 crore",
      summary: "The update highlights enforcement action during the 2026 general elections and bye-elections.",
      sourceLabel: "ECI update listing",
      url: "https://voterlist.co.in/eci-latest-updates-press-releases-notifications/",
      prompt: "Explain ECI election seizures in West Bengal"
    },
    {
      tag: "Integrity",
      date: "19 Apr 2026",
      title: "ECI action on unlawful social media content",
      summary: "PIB reported ECI directions on responsible use of digital platforms, AI-labelled content, MCC compliance, and C-Vigil complaints.",
      sourceLabel: "PIB release",
      url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2253528",
      prompt: "Explain ECI action on unlawful social media content"
    },
    {
      tag: "Voters",
      date: "15 Apr 2026",
      title: "Distribution of voter information slips begins",
      summary: "The ECI update listing included the start of voter information slip distribution for 2026 elections.",
      sourceLabel: "ECI update listing",
      url: "https://voterlist.co.in/eci-latest-updates-press-releases-notifications/",
      prompt: "Explain voter information slips for Indian elections"
    }
  ];

  function init() {
    loadLocalState();
    applyTheme();
    bindEvents();
    paintUserProfile();
    paintProfile();
    paintReminder();
    paintPlanner();
    paintQuiz();
    paintKit();
    paintNews();
    requestGuide("__init__", false);
  }

  function bindEvents() {
    ui.themeToggle.addEventListener("click", function () {
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveTheme();
      applyTheme();
    });

    ui.userProfileForm.addEventListener("submit", function (event) {
      event.preventDefault();
      state.userProfile.name = ui.userNameInput.value.trim();
      state.userProfile.role = ui.voterRoleSelect.value;
      state.userProfile.language = ui.languageSelect.value;
      saveUserProfile();
      paintUserProfile();
      paintProfile();
    });

    ui.registeredToggle.addEventListener("click", function (event) {
      const button = event.target.closest("[data-registered]");
      if (!button) {
        return;
      }
      state.profile.registered = button.getAttribute("data-registered");
      paintRegisteredButtons();
      saveProfile();
      paintProfile();
    });

    ui.signalStrip.addEventListener("click", function (event) {
      const button = event.target.closest("[data-prompt]");
      if (!button) {
        return;
      }
      requestGuide(button.getAttribute("data-prompt"), true);
    });

    ui.profileForm.addEventListener("submit", function (event) {
      event.preventDefault();
      state.profile.location = ui.locationInput.value.trim();
      state.profile.ageGroup = ui.ageSelect.value;
      saveProfile();
      paintProfile();
      requestGuide("Update my election status", false);
    });

    ui.chatForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const prompt = ui.chatInput.value.trim();
      if (!prompt) {
        return;
      }
      ui.chatInput.value = "";
      requestGuide(prompt, true);
    });

    ui.chatStream.addEventListener("click", function (event) {
      const button = event.target.closest("[data-suggestion]");
      if (!button) {
        return;
      }
      requestGuide(button.getAttribute("data-suggestion"), true);
    });

    ui.quickActions.addEventListener("click", function (event) {
      const button = event.target.closest("[data-prompt]");
      if (!button) {
        return;
      }
      requestGuide(button.getAttribute("data-prompt"), true);
    });

    ui.newsList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-news-prompt]");
      if (!button) {
        return;
      }
      requestGuide(button.getAttribute("data-news-prompt"), true);
    });

    ui.checklistList.addEventListener("change", function (event) {
      const input = event.target.closest("[data-checklist-id]");
      if (!input) {
        return;
      }
      state.checklistState[input.getAttribute("data-checklist-id")] = input.checked;
      saveChecklist();
      paintChecklist();
      paintProgress();
    });

    ui.plannerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      state.electionPlan.electionDate = ui.electionDateInput.value;
      state.electionPlan.votingMethod = ui.votingMethodSelect.value;
      savePlan();
      paintPlanner();
      requestGuide("Help me prepare my voting day plan", true);
    });

    ui.copyPlanButton.addEventListener("click", function () {
      copyVotingPlan();
    });

    ui.clearPlanButton.addEventListener("click", function () {
      state.electionPlan = {
        electionDate: "",
        votingMethod: ""
      };
      savePlan();
      paintPlanner();
    });

    ui.quizOptions.addEventListener("click", function (event) {
      const button = event.target.closest("[data-quiz-option]");
      if (!button) {
        return;
      }
      answerQuiz(Number(button.getAttribute("data-quiz-option")));
    });

    ui.quizNextButton.addEventListener("click", function () {
      if (state.quiz.index < QUIZ_QUESTIONS.length - 1) {
        state.quiz.index += 1;
      } else {
        state.quiz.index = 0;
      }
      saveQuiz();
      paintQuiz();
    });

    ui.quizResetButton.addEventListener("click", function () {
      state.quiz = {
        index: 0,
        answers: []
      };
      saveQuiz();
      paintQuiz();
    });

    ui.quizFeedback.addEventListener("click", function (event) {
      const button = event.target.closest("[data-quiz-prompt]");
      if (!button) {
        return;
      }
      requestGuide(button.getAttribute("data-quiz-prompt"), true);
    });

    ui.kitForm.addEventListener("submit", function (event) {
      event.preventDefault();
      state.votingKit.place = ui.kitPlaceInput.value.trim();
      state.votingKit.travel = ui.kitTravelInput.value.trim();
      state.votingKit.note = ui.kitNoteInput.value.trim();
      saveKit();
      paintKit();
    });

    ui.kitItems.addEventListener("change", function (event) {
      const input = event.target.closest("[data-kit-item]");
      if (!input) {
        return;
      }
      state.votingKit.packed[input.getAttribute("data-kit-item")] = input.checked;
      saveKit();
      paintKit();
    });

    ui.copyKitButton.addEventListener("click", function () {
      copyVotingKit();
    });

    ui.clearKitButton.addEventListener("click", function () {
      state.votingKit = buildEmptyKit();
      saveKit();
      paintKit();
    });
  }

  function loadLocalState() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
      state.theme = savedTheme === "dark" ? "dark" : "light";
    } catch (error) {
      state.theme = "light";
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "{}");
      state.userProfile.name = savedUser.name || "";
      state.userProfile.role = savedUser.role || "";
      state.userProfile.language = savedUser.language || "";
    } catch (error) {
      state.userProfile = {
        name: "",
        role: "",
        language: ""
      };
    }

    try {
      const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || "{}");
      state.profile.location = savedProfile.location || "";
      state.profile.ageGroup = savedProfile.ageGroup || "";
      state.profile.registered = savedProfile.registered || "";
    } catch (error) {}

    try {
      state.checklistState = JSON.parse(localStorage.getItem(STORAGE_KEYS.checklist) || "{}");
    } catch (error) {
      state.checklistState = {};
    }

    try {
      state.reminderNote = localStorage.getItem(STORAGE_KEYS.reminder) || "";
    } catch (error) {
      state.reminderNote = "";
    }

    try {
      const savedPlan = JSON.parse(localStorage.getItem(STORAGE_KEYS.plan) || "{}");
      state.electionPlan.electionDate = savedPlan.electionDate || "";
      state.electionPlan.votingMethod = savedPlan.votingMethod || "";
    } catch (error) {
      state.electionPlan = {
        electionDate: "",
        votingMethod: ""
      };
    }

    try {
      const savedQuiz = JSON.parse(localStorage.getItem(STORAGE_KEYS.quiz) || "{}");
      state.quiz.index = Math.min(Math.max(Number(savedQuiz.index) || 0, 0), QUIZ_QUESTIONS.length - 1);
      state.quiz.answers = Array.isArray(savedQuiz.answers) ? savedQuiz.answers : [];
    } catch (error) {
      state.quiz = {
        index: 0,
        answers: []
      };
    }

    try {
      const savedKit = JSON.parse(localStorage.getItem(STORAGE_KEYS.kit) || "{}");
      state.votingKit = {
        place: savedKit.place || "",
        travel: savedKit.travel || "",
        note: savedKit.note || "",
        packed: Object.assign(buildEmptyKit().packed, savedKit.packed || {})
      };
    } catch (error) {
      state.votingKit = buildEmptyKit();
    }

    ui.userNameInput.value = state.userProfile.name;
    ui.voterRoleSelect.value = state.userProfile.role;
    ui.languageSelect.value = state.userProfile.language;
    ui.locationInput.value = state.profile.location;
    ui.ageSelect.value = state.profile.ageGroup;
    ui.electionDateInput.value = state.electionPlan.electionDate;
    ui.votingMethodSelect.value = state.electionPlan.votingMethod;
    ui.kitPlaceInput.value = state.votingKit.place;
    ui.kitTravelInput.value = state.votingKit.travel;
    ui.kitNoteInput.value = state.votingKit.note;
    paintRegisteredButtons();
  }

  function saveProfile() {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.profile));
  }

  function saveUserProfile() {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.userProfile));
  }

  function saveTheme() {
    localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    ui.themeToggle.setAttribute("aria-pressed", state.theme === "dark" ? "true" : "false");
    ui.themeToggleLabel.textContent = state.theme === "dark" ? "Dark mode" : "Light mode";
  }

  function saveChecklist() {
    localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(state.checklistState));
  }

  function saveReminder() {
    localStorage.setItem(STORAGE_KEYS.reminder, state.reminderNote);
  }

  function savePlan() {
    localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(state.electionPlan));
  }

  function saveQuiz() {
    localStorage.setItem(STORAGE_KEYS.quiz, JSON.stringify(state.quiz));
  }

  function saveKit() {
    localStorage.setItem(STORAGE_KEYS.kit, JSON.stringify(state.votingKit));
  }

  function paintRegisteredButtons() {
    Array.from(ui.registeredToggle.querySelectorAll("[data-registered]")).forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-registered") === state.profile.registered);
    });
  }

  function paintProfile() {
    ui.badgeLocation.textContent = "Location: " + (state.profile.location || "Not set");
    ui.badgeAge.textContent = "Age: " + (formatAge(state.profile.ageGroup) || "Not set");
    ui.badgeRegistered.textContent = "Registered: " + (formatRegistered(state.profile.registered) || "Not set");
    ui.badgeUser.textContent = "Profile: " + (state.userProfile.name || "Guest");
    updateBadgeState(ui.badgeLocation, Boolean(state.profile.location));
    updateBadgeState(ui.badgeAge, Boolean(state.profile.ageGroup));
    updateBadgeState(ui.badgeRegistered, Boolean(state.profile.registered));
    updateBadgeState(ui.badgeUser, Boolean(state.userProfile.name));
    paintUserProfile();
    paintHero(); const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("active"); } }); }, { threshold: 0.1 }); document.querySelectorAll(".app-header, section").forEach(el => { el.classList.add("reveal"); observer.observe(el); });
  }

  function paintUserProfile() {
    const name = state.userProfile.name || "Your civic profile";
    const initials = getInitials(state.userProfile.name);
    const role = formatRole(state.userProfile.role);
    const language = formatLanguage(state.userProfile.language);

    ui.userAvatar.textContent = initials;
    ui.userDisplayName.textContent = state.userProfile.name ? "Welcome, " + state.userProfile.name : "Your civic profile";
    ui.userProfileLine.textContent = [
      role || "Choose your voter role",
      language || "Choose language",
      state.profile.location || "Add location"
    ].join(" · ");
    ui.statusLine.textContent = state.userProfile.name
      ? "Welcome " + state.userProfile.name + ". Tell CivicGuide AI where you are in the process."
      : "Tell CivicGuide AI where you are in the process.";
  }

  function getInitials(name) {
    const clean = String(name || "").trim();
    if (!clean) {
      return "CG";
    }
    return clean
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("");
  }

  function formatRole(value) {
    const labels = {
      "first-time": "First-time voter",
      regular: "Regular voter",
      "family-helper": "Helping family",
      student: "Student learner"
    };
    return labels[value] || "";
  }

  function formatLanguage(value) {
    const labels = {
      english: "English",
      hindi: "Hindi",
      tamil: "Tamil",
      telugu: "Telugu",
      bengali: "Bengali",
      marathi: "Marathi"
    };
    return labels[value] || "";
  }

  function formatAge(value) {
    const labels = {
      "under-18": "Under 18",
      "18-24": "18-24",
      "25-44": "25-44",
      "45-plus": "45+"
    };
    return labels[value] || "";
  }

  function formatRegistered(value) {
    const labels = {
      yes: "Yes",
      no: "No",
      unsure: "Not sure"
    };
    return labels[value] || "";
  }

  async function requestGuide(message, showUserMessage) {
    if (showUserMessage) {
      appendUserNote(message);
    }

    const loadingCard = appendLoadingCard();
    const payload = {
      message: message,
      context: {
        userProfile: state.userProfile,
        profile: state.profile,
        electionPlan: state.electionPlan,
        repeatCount: getRepeatCount(message)
      }
    };

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Guide request failed");
      }

      const guide = await response.json();
      finishGuide(guide, loadingCard);
    } catch (error) {
      finishGuide(buildLocalGuide(message, payload.context), loadingCard);
    }
  }

  function getRepeatCount(message) {
    if (!message || message === "__init__") {
      return state.repeatCount;
    }
    if (state.lastPrompt && state.lastPrompt.toLowerCase() === message.toLowerCase()) {
      state.repeatCount += 1;
    } else {
      state.repeatCount = 0;
    }
    state.lastPrompt = message;
    return state.repeatCount;
  }

  function finishGuide(guide, loadingCard) {
    loadingCard.remove();
    applyGuide(guide);
    appendResponseCard(guide);
    ui.chatStream.scrollTop = ui.chatStream.scrollHeight;
  }

  function applyGuide(guide) {
    if (guide.profile) {
      state.profile = guide.profile;
      ui.locationInput.value = state.profile.location || "";
      ui.ageSelect.value = state.profile.ageGroup || "";
      saveProfile();
      paintRegisteredButtons();
      paintProfile();
    }

    state.currentChecklist = guide.checklist || [];
    state.progress = guide.progress || state.progress;
    state.guideNextAction = guide.nextAction || state.guideNextAction;
    if (Object.prototype.hasOwnProperty.call(guide, "reminderNote")) {
      state.reminderNote = guide.reminderNote || "";
    }
    saveReminder();
    ui.statusLine.textContent = guide.statusLine || "Guidance updated.";
    paintProgress();
    paintChecklist();
    paintReminder();
    paintPlanner();
    paintQuiz();
    paintKit();
    paintResources(guide.resources || []);
  }

  function paintProgress() {
    const total = state.progress.total || 5;
    const done = state.currentChecklist.filter(function (item) {
      return state.checklistState[item.id];
    }).length;
    const percent = total ? Math.max((done / total) * 100, (state.progress.current / total) * 100) : 0;

    ui.progressLabel.textContent = "Step " + state.progress.current + " of " + total;
    ui.checklistCount.textContent = done + "/" + total + " complete";
    ui.progressFill.style.width = percent.toFixed(0) + "%";

    ui.progressSteps.innerHTML = (state.progress.steps || []).map(function (step, index) {
      const position = index + 1;
      const doneClass = position < state.progress.current ? " done" : "";
      const currentClass = position === state.progress.current ? " current" : "";
      return (
        '<div class="progress-step' +
        doneClass +
        currentClass +
        '">' +
        '<span class="step-index">' +
        position +
        "</span>" +
        '<span class="step-title">' +
        escapeHtml(step) +
        "</span>" +
        "</div>"
      );
    }).join("");
    paintHero(); const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("active"); } }); }, { threshold: 0.1 }); document.querySelectorAll(".app-header, section").forEach(el => { el.classList.add("reveal"); observer.observe(el); });
  }

  function paintChecklist() {
    ui.checklistList.innerHTML = state.currentChecklist.map(function (item) {
      const checked = Boolean(state.checklistState[item.id] || item.done);
      if (item.done && !state.checklistState[item.id]) {
        state.checklistState[item.id] = true;
      }
      return (
        '<label class="checklist-item' +
        (checked ? " done" : "") +
        '">' +
        '<input class="checklist-toggle" type="checkbox" data-checklist-id="' +
        escapeAttribute(item.id) +
        '"' +
        (checked ? " checked" : "") +
        " />" +
        '<div class="checklist-copy">' +
        "<strong>" +
        escapeHtml(item.title) +
        "</strong>" +
        "<span>" +
        escapeHtml(item.detail) +
        "</span>" +
        "</div>" +
        "</label>"
      );
    }).join("");
    saveChecklist();
  }

  function paintReminder() {
    if (!state.reminderNote) {
      ui.reminderNote.classList.add("hidden");
      ui.reminderNote.textContent = "";
      return;
    }
    ui.reminderNote.classList.remove("hidden");
    ui.reminderNote.textContent = state.reminderNote;
  }

  function paintPlanner() {
    ui.electionDateInput.value = state.electionPlan.electionDate;
    ui.votingMethodSelect.value = state.electionPlan.votingMethod;

    const dateInfo = getElectionDateInfo(state.electionPlan.electionDate);
    const methodLabel = formatVotingMethod(state.electionPlan.votingMethod);
    const milestones = buildPlanMilestones(dateInfo, state.electionPlan.votingMethod);

    if (ui.planCountdown) {
      ui.planCountdown.textContent = dateInfo.label;
    }
    if (ui.planMethodLabel) {
      ui.planMethodLabel.textContent = methodLabel || "Method not set";
    }
    ui.planSummary.textContent = buildPlanSummary(dateInfo, methodLabel);
    ui.copyPlanButton.disabled = !state.electionPlan.electionDate && !state.electionPlan.votingMethod;
    ui.clearPlanButton.disabled = !state.electionPlan.electionDate && !state.electionPlan.votingMethod;

    ui.planMilestones.innerHTML = milestones.map(function (item) {
      return (
        '<article class="plan-milestone' +
        (item.done ? " done" : "") +
        '">' +
        '<span class="milestone-date">' +
        escapeHtml(item.date) +
        "</span>" +
        '<strong>' +
        escapeHtml(item.title) +
        "</strong>" +
        '<p>' +
        escapeHtml(item.detail) +
        "</p>" +
        "</article>"
      );
    }).join("");
  }

  function getElectionDateInfo(value) {
    if (!value) {
      return {
        valid: false,
        days: null,
        label: "No date",
        displayDate: ""
      };
    }

    const today = startOfDay(new Date());
    const electionDate = startOfDay(new Date(value + "T00:00:00"));
    if (Number.isNaN(electionDate.getTime())) {
      return {
        valid: false,
        days: null,
        label: "Invalid date",
        displayDate: ""
      };
    }

    const days = Math.round((electionDate.getTime() - today.getTime()) / 86400000);
    return {
      valid: true,
      days: days,
      label: days < 0 ? Math.abs(days) + " days ago" : days === 0 ? "Today" : days + " days left",
      displayDate: electionDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatVotingMethod(value) {
    const labels = {
      "in-person": "In person",
      early: "Early voting",
      mail: "Mail or absentee",
      unsure: "Not sure yet"
    };
    return labels[value] || "";
  }

  function buildPlanSummary(dateInfo, methodLabel) {
    if (!dateInfo.valid && !methodLabel) {
      return "Save an election date and voting method to turn the checklist into a practical countdown.";
    }
    if (!dateInfo.valid) {
      return "Voting method saved: " + methodLabel + ". Add the election date to unlock countdown milestones.";
    }
    if (!methodLabel) {
      return "Election date saved for " + dateInfo.displayDate + ". Choose a voting method to make the plan more specific.";
    }
    return "You are planning to vote " + methodLabel.toLowerCase() + " on or before " + dateInfo.displayDate + ".";
  }

  function buildPlanMilestones(dateInfo, method) {
    if (!dateInfo.valid) {
      return [
        {
          date: "Now",
          title: "Add the election date",
          detail: "Use the official election office date, then save your plan.",
          done: false
        },
        {
          date: "Next",
          title: "Choose a voting method",
          detail: "Pick in-person, early, mail, or unsure so the plan matches your route.",
          done: Boolean(method)
        }
      ];
    }

    const days = dateInfo.days;
    const isPast = days < 0;
    const base = [
      {
        date: offsetDateLabel(dateInfo.displayDate, -30),
        title: "Confirm status",
        detail: "Check that your registration record is active and your details are correct.",
        done: days <= 30
      },
      {
        date: offsetDateLabel(dateInfo.displayDate, -14),
        title: method === "mail" ? "Request or track ballot" : "Review voting options",
        detail: method === "mail"
          ? "Check the official mail-ballot request, return, and tracking rules."
          : "Confirm early voting, polling place, ID rules, and transportation.",
        done: days <= 14
      },
      {
        date: offsetDateLabel(dateInfo.displayDate, -7),
        title: "Pack documents",
        detail: "Put ID, registration proof, and any local required papers in one place.",
        done: days <= 7
      },
      {
        date: dateInfo.displayDate,
        title: isPast ? "Review what happened" : "Vote",
        detail: isPast ? "Save lessons for the next cycle and update your checklist." : "Follow your chosen method and keep proof or confirmation where available.",
        done: isPast
      }
    ];

    if (method === "early") {
      base.splice(2, 0, {
        date: "Before early window",
        title: "Check early voting hours",
        detail: "Early voting dates and locations can differ from election day locations.",
        done: days <= 10
      });
    }

    if (method === "unsure" || !method) {
      base.splice(1, 0, {
        date: "This week",
        title: "Choose your method",
        detail: "Compare in-person, early, and mail options on your official election site.",
        done: Boolean(method && method !== "unsure")
      });
    }

    return base;
  }

  function offsetDateLabel(displayDate, offset) {
    const source = new Date(state.electionPlan.electionDate + "T00:00:00");
    source.setDate(source.getDate() + offset);
    return source.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function copyVotingPlan() {
    const dateInfo = getElectionDateInfo(state.electionPlan.electionDate);
    const methodLabel = formatVotingMethod(state.electionPlan.votingMethod) || "Method not set";
    const milestones = buildPlanMilestones(dateInfo, state.electionPlan.votingMethod);
    const lines = [
      "CivicGuide AI Voting Plan",
      "Election date: " + (dateInfo.displayDate || "Not set"),
      "Voting method: " + methodLabel,
      "Countdown: " + dateInfo.label,
      "",
      "Milestones:"
    ].concat(milestones.map(function (item) {
      return "- " + item.date + ": " + item.title + " - " + item.detail;
    }));

    const text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        ui.copyPlanButton.textContent = "Copied";
        window.setTimeout(function () {
          ui.copyPlanButton.textContent = "Copy Plan";
        }, 1400);
      });
    } else {
      window.prompt("Copy your voting plan", text);
    }
  }

  function paintQuiz() {
    const question = QUIZ_QUESTIONS[state.quiz.index];
    const selected = state.quiz.answers[state.quiz.index];
    const score = getQuizScore();
    const complete = state.quiz.answers.filter(function (value) {
      return typeof value === "number";
    }).length;

    ui.quizScore.textContent = score + "/" + QUIZ_QUESTIONS.length;
    ui.quizProgressText.textContent = complete === QUIZ_QUESTIONS.length
      ? "Complete"
      : "Question " + (state.quiz.index + 1);
    ui.quizQuestion.textContent = question.question;
    ui.quizNextButton.textContent = state.quiz.index === QUIZ_QUESTIONS.length - 1 ? "Review" : "Next";

    ui.quizOptions.innerHTML = question.options.map(function (option, index) {
      const isSelected = selected === index;
      const isCorrect = question.answer === index;
      const answeredClass = typeof selected === "number"
        ? isCorrect
          ? " correct"
          : isSelected
            ? " wrong"
            : ""
        : "";
      return (
        '<button type="button" class="quiz-option' +
        (isSelected ? " selected" : "") +
        answeredClass +
        '" data-quiz-option="' +
        index +
        '">' +
        escapeHtml(option) +
        "</button>"
      );
    }).join("");

    if (typeof selected !== "number") {
      ui.quizFeedback.className = "quiz-feedback";
      ui.quizFeedback.textContent = "Choose an answer to get quick feedback.";
      return;
    }

    const isCorrectAnswer = selected === question.answer;
    ui.quizFeedback.className = "quiz-feedback " + (isCorrectAnswer ? "good" : "needs-work");
    ui.quizFeedback.innerHTML =
      "<strong>" +
      (isCorrectAnswer ? "Correct." : "Review this.") +
      "</strong> " +
      escapeHtml(question.detail) +
      ' <button type="button" class="text-button" data-quiz-prompt="' +
      escapeAttribute(question.topic) +
      '">Ask guide</button>';
  }

  function answerQuiz(optionIndex) {
    state.quiz.answers[state.quiz.index] = optionIndex;
    saveQuiz();
    paintQuiz();
  }

  function getQuizScore() {
    return QUIZ_QUESTIONS.reduce(function (total, question, index) {
      return total + (state.quiz.answers[index] === question.answer ? 1 : 0);
    }, 0);
  }

  function buildEmptyKit() {
    return {
      place: "",
      travel: "",
      note: "",
      packed: {
        id: false,
        confirmation: false,
        phone: false,
        water: false
      }
    };
  }

  function paintKit() {
    ui.kitPlaceInput.value = state.votingKit.place;
    ui.kitTravelInput.value = state.votingKit.travel;
    ui.kitNoteInput.value = state.votingKit.note;

    const items = buildKitItems();
    const readyCount = items.filter(function (item) {
      return item.ready;
    }).length;

    ui.kitReadyCount.textContent = readyCount + "/" + items.length;
    ui.copyKitButton.disabled = readyCount === 0 && !hasKitText();
    ui.clearKitButton.disabled = readyCount === 0 && !hasKitText();
    ui.kitItems.innerHTML = items.map(function (item) {
      return (
        '<label class="kit-item' +
        (item.ready ? " ready" : "") +
        '">' +
        '<input type="checkbox" data-kit-item="' +
        escapeAttribute(item.id) +
        '"' +
        (item.ready ? " checked" : "") +
        " />" +
        '<span class="kit-item-icon">' +
        escapeHtml(item.icon) +
        "</span>" +
        '<span class="kit-item-copy"><strong>' +
        escapeHtml(item.title) +
        "</strong><small>" +
        escapeHtml(item.detail) +
        "</small></span></label>"
      );
    }).join("");
  }

  function buildKitItems() {
    return [
      {
        id: "id",
        icon: "ID",
        title: "Approved ID",
        detail: state.profile.location ? "Check exact ID rules for " + state.profile.location + "." : "Add your location to make this more specific.",
        ready: Boolean(state.votingKit.packed.id)
      },
      {
        id: "confirmation",
        icon: "OK",
        title: "Registration proof",
        detail: state.profile.registered === "yes" ? "Keep status confirmation or reference details handy." : "Confirm status before relying on your plan.",
        ready: Boolean(state.votingKit.packed.confirmation)
      },
      {
        id: "phone",
        icon: "TEL",
        title: "Phone and helpline",
        detail: state.votingKit.place ? "Save route and official contact before leaving." : "Add polling place or official link above.",
        ready: Boolean(state.votingKit.packed.phone)
      },
      {
        id: "water",
        icon: "BAG",
        title: "Small day bag",
        detail: state.votingKit.travel ? "Plan: " + state.votingKit.travel : "Add your travel plan for voting day.",
        ready: Boolean(state.votingKit.packed.water)
      }
    ];
  }

  function hasKitText() {
    return Boolean(state.votingKit.place || state.votingKit.travel || state.votingKit.note);
  }

  function copyVotingKit() {
    const items = buildKitItems();
    const lines = [
      "CivicGuide AI Voting Day Kit",
      "Location: " + (state.profile.location || "Not set"),
      "Polling place or link: " + (state.votingKit.place || "Not set"),
      "Travel plan: " + (state.votingKit.travel || "Not set"),
      "Important note: " + (state.votingKit.note || "None"),
      "",
      "Packed:"
    ].concat(items.map(function (item) {
      return "- " + (item.ready ? "[x] " : "[ ] ") + item.title + ": " + item.detail;
    }));

    const text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        ui.copyKitButton.textContent = "Copied";
        window.setTimeout(function () {
          ui.copyKitButton.textContent = "Copy Kit";
        }, 1400);
      });
    } else {
      window.prompt("Copy your voting day kit", text);
    }
  }

  function paintNews() {
    ui.newsList.innerHTML = NEWS_UPDATES.map(function (item) {
      return (
        '<article class="news-card">' +
        '<div class="news-top"><span class="news-tag">' +
        escapeHtml(item.tag) +
        "</span><time>" +
        escapeHtml(item.date) +
        "</time></div>" +
        "<h3>" +
        escapeHtml(item.title) +
        "</h3><p>" +
        escapeHtml(item.summary) +
        "</p>" +
        '<div class="news-actions">' +
        '<a href="' +
        escapeAttribute(item.url) +
        '" target="_blank" rel="noopener noreferrer">Open source</a>' +
        '<button type="button" data-news-prompt="' +
        escapeAttribute(item.prompt) +
        '">Ask guide</button>' +
        "</div></article>"
      );
    }).join("");
  }

  function updateBadgeState(node, ready) {
    node.classList.toggle("ready", ready);
    node.classList.toggle("missing", !ready);
  }

  function paintHero() {
    ui.heroStage.textContent = getCurrentStageLabel();
    ui.heroReadiness.textContent = getReadinessPercent() + "%";
    ui.heroFocus.textContent = getCurrentFocus();
  }

  function getCurrentStageLabel() {
    const index = Math.max(0, (state.progress.current || 1) - 1);
    const steps = state.progress.steps || [];
    return steps[index] || "Set profile";
  }

  function getReadinessPercent() {
    const totalChecklist = state.currentChecklist.length || state.progress.total || 5;
    const doneChecklist = state.currentChecklist.filter(function (item) {
      return state.checklistState[item.id];
    }).length;
    const profileFields = [
      Boolean(state.profile.location),
      Boolean(state.profile.ageGroup),
      Boolean(state.profile.registered)
    ].filter(Boolean).length;
    const profileRatio = profileFields / 3;
    const checklistRatio = totalChecklist ? doneChecklist / totalChecklist : 0;
    const progressRatio = state.progress.total ? state.progress.current / state.progress.total : 0;
    return Math.round(Math.max(checklistRatio, progressRatio) * 80 + profileRatio * 20);
  }

  function getCurrentFocus() {
    const prefix = state.userProfile.name ? state.userProfile.name + ", " : "";
    if (!state.profile.location) {
      return prefix + "add your location so deadlines and links can become specific.";
    }
    if (!state.profile.ageGroup) {
      return prefix + "pick your age group so eligibility guidance becomes more precise.";
    }
    if (!state.profile.registered) {
      return prefix + "tell CivicGuide AI whether you are registered so it can choose the right next branch.";
    }
    return state.guideNextAction;
  }

  function paintResources(resources) {
    if (!resources.length) {
      ui.resourceLinks.innerHTML = "";
      return;
    }

    ui.resourceLinks.innerHTML = resources.map(function (resource) {
      return (
        '<a class="resource-card" href="' +
        escapeAttribute(resource.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        "<strong>" +
        escapeHtml(resource.label) +
        "</strong>" +
        "<p>" +
        escapeHtml(resource.description) +
        "</p>" +
        "</a>"
      );
    }).join("");
  }

  function appendUserNote(message) {
    const node = document.createElement("div");
    node.className = "user-note";
    node.textContent = message;
    ui.chatStream.appendChild(node); node.scrollIntoView({ behavior: "smooth" }); const firstInteractive = node.querySelector("button, a, input"); if (firstInteractive) firstInteractive.focus();
  }

  function appendLoadingCard() {
    const node = document.createElement("div");
    node.className = "loading-card";
    node.textContent = "CivicGuide AI is preparing your next step...";
    ui.chatStream.appendChild(node); node.scrollIntoView({ behavior: "smooth" }); const firstInteractive = node.querySelector("button, a, input"); if (firstInteractive) firstInteractive.focus();
    return node;
  }

  function appendResponseCard(guide) {
    const node = document.createElement("article");
    node.className = "response-card";
    node.innerHTML =
      '<div class="response-top">' +
      '<p class="response-kicker">CivicGuide AI</p>' +
      '<div class="response-meta"><span>' +
      escapeHtml(guide.modeLabel || "Guided mode") +
      "</span><span>" +
      escapeHtml(guide.progress.current + "/" + guide.progress.total) +
      "</span></div></div>" +
      "<h3>" +
      escapeHtml(guide.title) +
      "</h3>" +
      '<div class="response-grid">' +
      buildSection(ICONS.overview + " Overview", guide.overview) +
      buildListSection(ICONS.steps + " Step-by-Step Process", guide.steps) +
      buildListSection(ICONS.timeline + " Timeline", guide.timeline) +
      buildListSection(ICONS.requirements + " Requirements", guide.requirements) +
      buildSection(ICONS.status + " Your Status", guide.userStatus) +
      buildSection(ICONS.next + " Next Action", guide.nextAction) +
      "</div>" +
      buildSuggestions(guide.suggestions);
    ui.chatStream.appendChild(node); node.scrollIntoView({ behavior: "smooth" }); const firstInteractive = node.querySelector("button, a, input"); if (firstInteractive) firstInteractive.focus();
  }

  function buildSection(title, text) {
    return (
      '<section class="response-section"><h4>' +
      title +
      "</h4><p>" +
      escapeHtml(text) +
      "</p></section>"
    );
  }

  function buildListSection(title, items) {
    const list = (items || [])
      .map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      })
      .join("");
    return (
      '<section class="response-section"><h4>' +
      title +
      '</h4><ul class="response-list">' +
      list +
      "</ul></section>"
    );
  }

  function buildSuggestions(suggestions) {
    if (!suggestions || !suggestions.length) {
      return "";
    }

    return (
      '<div class="response-actions">' +
      suggestions.map(function (suggestion) {
        return (
          '<button class="suggestion-chip" type="button" data-suggestion="' +
          escapeAttribute(suggestion) +
          '">' +
          escapeHtml(suggestion) +
          "</button>"
        );
      }).join("") +
      "</div>"
    );
  }

  function buildLocalGuide(message, context) {
    const profile = normalizeProfile(context.profile || state.profile);
    const lower = String(message || "").toLowerCase();
    const needsIntro = message === "__init__" || !profile.location || !profile.ageGroup || !profile.registered;

    if (needsIntro) {
      return buildIntroGuide(profile);
    }

    const simpleMode = /15|simple|confused|easier/.test(lower);
    const faqMode = /faq|question/.test(lower);
    const passedDeadline = /missed|passed|too late|deadline passed/.test(lower);
    const resources = getResources(profile.location);
    const steps = buildSteps(profile, faqMode, passedDeadline);
    const timeline = buildTimeline(profile, passedDeadline);
    const requirements = buildRequirements(profile);
    const checklist = buildChecklist(profile, faqMode);
    const progress = buildProgress(profile, faqMode, passedDeadline);

    return {
      title: buildTitle(profile, lower, faqMode),
      overview: buildOverview(profile, simpleMode, passedDeadline),
      steps: steps,
      timeline: timeline,
      requirements: requirements,
      userStatus: buildUserStatus(profile, passedDeadline),
      nextAction: buildNextAction(profile, passedDeadline),
      suggestions: buildSuggestionsList(profile, faqMode),
      checklist: checklist,
      progress: progress,
      resources: resources,
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
        "Status checks are safest at least one to two weeks before voting."
      ],
      requirements: [
        "Eligibility usually starts at age 18.",
        "Most places require citizenship or residency rules to be met.",
        "Official ID or address proof is often needed."
      ],
      userStatus: "Your profile is still incomplete, so I am keeping the guidance general for now.",
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
        { id: "profile-next", title: "Get your next action", detail: "I will personalize the next step after your profile is ready.", done: false }
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
        "Step 2: Save the next election cycle and your 18th birthday milestone.",
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
        "Step 2: Submit the form with your basic identity and address details.",
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

  function buildSuggestionsList(profile, faqMode) {
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  init();
})();

(function() {
  // PWA Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js")
        .then(reg => console.log("SW registered:", reg.scope))
        .catch(err => console.log("SW registration failed:", err));
    });
  }

  // PWA Install Prompt
  let deferredPrompt;
  const installAppBtn = document.getElementById("install-app");
  
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installAppBtn.style.display = "inline-flex";
  });

  installAppBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        installAppBtn.style.display = "none";
      }
      deferredPrompt = null;
    }
  });

  // Print PDF Export
  const printBtn = document.getElementById("print-plan-button");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Text-To-Speech (TTS)
  function speak(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to find a local voice
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.lang.includes("en")) || voices[0];
      window.speechSynthesis.speak(utterance);
    }
  }

  // Hook into response cards to add TTS buttons
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList.contains("response-card")) {
          const top = node.querySelector(".response-top");
          if (top && !node.querySelector(".tts-button")) {
            const btn = document.createElement("button");
            btn.className = "tts-button";
            btn.innerHTML = "??";
            btn.title = "Read aloud";
            btn.onclick = () => {
              const text = node.innerText.replace("??", "");
              speak(text);
            };
            top.appendChild(btn);
          }
        }
      });
    });
  });
  
  const chatStream = document.getElementById("chat-stream");
  if (chatStream) {
    observer.observe(chatStream, { childList: true });
  }

  // i18n Logic
  const i18nSelect = document.getElementById("i18n-select");
  let locales = {};

  async function loadLocales() {
    try {
      const res = await fetch("/data/locales.json");
      locales = await res.json();
      
      // Load saved preference
      const savedLang = localStorage.getItem("cg_lang");
      if (savedLang && locales[savedLang]) {
        i18nSelect.value = savedLang;
        applyLanguage(savedLang);
      }
    } catch (e) {
      console.error("Failed to load locales", e);
    }
  }

  function applyLanguage(lang) {
    const t = locales[lang];
    if (!t) return;
    
    // Quick DOM replacements
    const safeText = (id, text) => {
      const el = document.getElementById(id);
      if (el && text) el.textContent = text;
    };
    
    safeText("theme-toggle-label", document.documentElement.getAttribute("data-theme") === "dark" ? t.themeDark : t.themeLight);
    safeText("hero-stage", t.stage);
    
    // Just a sample of applying i18n to UI elements. 
    // In a full framework this is easier, but here we target specific IDs.
    const h1 = document.querySelector("h1");
    if(h1) h1.textContent = t.title;
    
    const subtitle = document.querySelector(".header-sub");
    if(subtitle) subtitle.textContent = t.subtitle;
    
    localStorage.setItem("cg_lang", lang);
  }

  if (i18nSelect) {
    i18nSelect.addEventListener("change", (e) => {
      applyLanguage(e.target.value);
    });
  }

  // Load offline datasets & locales on startup
  loadLocales();

})();

