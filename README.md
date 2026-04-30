# CivicGuide AI

<p align="center">
  <img alt="CivicGuide AI" src="https://img.shields.io/badge/CivicGuide-AI-FF9933?style=for-the-badge&labelColor=138808">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white">
  <img alt="Vanilla JS" src="https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111">
  <img alt="Docker Ready" src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white">
  <img alt="Cloud Run" src="https://img.shields.io/badge/Google_Cloud_Run-Ready-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white">
</p>

<p align="center">
  <strong>A fast, beautiful, India-focused election guidance web app for voter readiness, registration help, civic learning, and voting-day planning.</strong>
</p>

<p align="center">
  Built with plain HTML, CSS, JavaScript, and a lightweight Node.js server. No database. No build step. Cloud Run ready.
</p>

---

## Overview

**CivicGuide AI** helps users understand voter registration, eligibility, documents, deadlines, polling preparation, and Election Commission of India resources through a single-page civic dashboard.

The app is intentionally small and deployment-friendly, while still feeling polished: animated visuals, light and dark themes, profile-based guidance, multilingual data hooks, checklist progress, civic quiz flows, and optional Gemini-powered responses when a `GEMINI_API_KEY` is configured.

---

## Highlights

| Experience | Details |
| --- | --- |
| India-first voter guide | Guidance around Indian voter registration, eligibility, documents, and ECI resources |
| Local assistant | Structured civic guidance works without any external AI dependency |
| Optional AI enhancement | Gemini support can be enabled with an environment variable |
| Personal profile | Name, voter role, location, age group, registration status, and language preference |
| Smart checklist | Personalized readiness steps with visual completion tracking |
| Voting-day planner | Save election date, voting method, route notes, and preparation milestones |
| Voting-day kit | Copyable checklist for IDs, helplines, travel, and final reminders |
| Civic quiz | Short readiness quiz with quick help for missed topics |
| News desk | Election Commission of India update cards with official links |
| PWA-ready | Manifest and service worker support for a more app-like experience |
| Production-friendly | Security headers, CORS handling, gzip/deflate compression, rate limiting, and health check |
| Cloud deployable | Docker and Google Cloud Run ready |

---

## Live App Flow

Users can:

1. Create a local civic profile.
2. Choose location, age group, registration status, role, and preferred language.
3. Ask election-related questions.
4. Receive structured guidance with steps, requirements, timeline, and next action.
5. Track readiness through personalized checklist cards.
6. Plan voting day with milestones and practical notes.
7. Prepare a copyable voting-day kit.
8. Test civic knowledge through the quiz.
9. Read ECI-related update cards.
10. Switch between light and dark themes.

All user preferences and progress are stored in the browser using `localStorage`.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Server | Node.js HTTP server |
| Data | Static JSON files and browser `localStorage` |
| Optional AI | Google Gemini API through `GEMINI_API_KEY` |
| Testing | Node built-in test runner |
| Container | Docker |
| Deployment | Google Cloud Run |

---

## Project Structure

```text
vote-wise-ai/
|-- public/
|   |-- data/
|   |   |-- election_db.json      # Election guidance data
|   |   `-- locales.json          # Locale and language data
|   |-- app.js                    # Client-side app logic
|   |-- index.html                # Main app markup
|   |-- manifest.json             # PWA manifest
|   |-- style.css                 # Theme, layout, animation, responsive UI
|   `-- sw.js                     # Service worker
|-- server/
|   `-- server.js                 # Static server and API endpoints
|-- test/
|   `-- server.test.js            # Server/API tests
|-- .dockerignore                 # Files excluded from Docker image
|-- .env.example                  # Example environment variables
|-- Dockerfile                    # Production container image
|-- package.json                  # Scripts and project metadata
`-- README.md                     # Project documentation
```

---

## Core Features

### Civic Profile

Users can save local profile details that personalize the experience:

- Name
- Voter role
- Location
- Age group
- Registration status
- Preferred language

### Election Guide Assistant

The assistant returns structured guidance with:

- Overview
- Step-by-step process
- Timeline
- Requirements
- User status
- Next action
- Official resources

By default, the guide works locally. If `GEMINI_API_KEY` is available, the server can enrich responses with Gemini while keeping a local fallback.

### Light And Dark Theme

The app includes a theme toggle with saved preference, so returning users keep the same visual mode.

### Voting-Day Planner

Users can save:

- Election date
- Voting method
- Polling place or official link
- Travel plan
- Important notes

The app turns those details into practical preparation milestones.

### Checklist And Progress

Readiness cards adapt to the user's profile and registration status. Progress is shown with completion counts and visual status updates.

### Civic Knowledge Quiz

A short quiz helps users check their readiness and quickly ask the guide for help on topics they missed.

### ECI News Desk

The news section presents Election Commission of India-related update cards with source links and quick explanation actions.

---

## Local Development

### Requirements

- Node.js 18 or newer
- npm

### Run Locally

This project has no third-party runtime dependencies.

```bash
npm start
```

Open:

```text
http://127.0.0.1:3000
```

### Development Command

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

---

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` locally, `8080` in Docker | Port used by the Node server |
| `GEMINI_API_KEY` | Empty | Optional Gemini API key for enhanced assistant responses |

Create a local `.env` from `.env.example` if needed. Do not commit real secrets.

---

## API Endpoints

### Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

### Guide Endpoint

```http
POST /api/guide
```

Request:

```json
{
  "message": "How do I register to vote?",
  "context": {
    "profile": {
      "location": "India",
      "ageGroup": "18-24",
      "registered": "unsure"
    }
  }
}
```

The endpoint returns structured guidance used by the frontend.

---

## Docker Usage

### Build Image

```bash
docker build -t civicguide-ai .
```

### Run Container

```bash
docker run --rm -p 8080:8080 civicguide-ai
```

Open:

```text
http://127.0.0.1:8080
```

---

## Deploy To Google Cloud Run

### 1. Set Your Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required Services

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 3. Deploy From Source

```bash
gcloud run deploy civic-guide-ai \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

Cloud Run builds the container and deploys the app automatically.

### 4. Open The Service

After deployment, Google Cloud prints a public service URL. Open that URL in your browser.

---

## Alternative GCP Deployment

### Build And Push With Cloud Build

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/civic-guide-ai
```

### Deploy The Image

```bash
gcloud run deploy civic-guide-ai \
  --image gcr.io/YOUR_PROJECT_ID/civic-guide-ai \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## GitHub Workflow

```bash
git add .
git commit -m "Update CivicGuide AI"
git push origin main
```

If this is a new repo:

```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git add .
git commit -m "Initial CivicGuide AI app"
git push -u origin main
```

---

## Security And Privacy

- No database is used.
- User profile and checklist data stay in the browser through `localStorage`.
- `.env` is ignored and excluded from Docker builds.
- `.env.example` is safe to commit because it contains placeholders only.
- Do not commit API keys, service account files, private tokens, or credentials.
- Server responses include security headers.
- API requests are rate-limited.
- Oversized request bodies are rejected.

---

## Performance Notes

CivicGuide AI is designed to stay small and fast:

- No frontend framework
- No build tool required
- Minimal Node.js server
- Static assets served directly
- Compression support for text assets
- Browser-side persistence
- Cloud Run compatible `PORT=8080`

---

## Browser Support

Use a current version of:

- Chrome
- Edge
- Firefox
- Safari

The app uses modern browser features including CSS animations, `localStorage`, Fetch API, service workers, and Clipboard API with fallback behavior.

---

## Customization

| File | Use |
| --- | --- |
| `public/style.css` | Colors, themes, layout, animation, responsive design |
| `public/app.js` | App behavior, guide interactions, quiz, checklist, local state |
| `public/data/election_db.json` | Election guidance data |
| `public/data/locales.json` | Locale and language data |
| `public/index.html` | Main page structure |
| `server/server.js` | API behavior, static serving, security headers, Gemini integration |

---

## Production Checklist

Before deployment:

- Confirm `.env` is not committed.
- Run `npm test`.
- Run the app locally.
- Test light and dark themes.
- Check `GET /api/health`.
- Confirm the Docker image runs on port `8080`.
- Add `GEMINI_API_KEY` in Cloud Run only if AI-enhanced responses are needed.
- Deploy to Cloud Run.

---

## License

This project is released under the MIT License.

---

## Disclaimer

CivicGuide AI is an educational civic guidance tool. Election rules, deadlines, documents, and procedures can change by location. Users should always confirm final details through official Election Commission or local election office sources.
