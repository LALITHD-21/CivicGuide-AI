# CivicGuide AI

**CivicGuide AI** is a lightweight, India-focused election guidance web app that helps voters understand registration, eligibility, documents, deadlines, voting day preparation, and Election Commission of India updates.

The project is intentionally small, fast, and deployment-friendly. It uses plain HTML, CSS, JavaScript, and a minimal Node.js server. There is no database, no build step, and no external API dependency.

## Highlights

- India-focused voter guidance experience
- User profile with name, voter role, and language preference
- Light and dark theme toggle with saved preference
- Local AI-style election assistant
- Personalized checklist and progress tracker
- Voting day planner with milestones
- Voting day kit with copyable checklist
- Civic readiness quiz
- Election Commission of India news desk
- Animated Indian flag-inspired background
- CSS-only logo and visual identity
- Docker-ready
- Google Cloud Run-ready
- Very small project size, far below 10 MB

## Live App Experience

The app is designed as a single-page civic dashboard. Users can:

1. Create a local profile.
2. Add their location, age group, and registration status.
3. Ask election-related questions.
4. Track readiness through checklist and progress tools.
5. Plan voting day and prepare a kit.
6. Read recent ECI-related updates.
7. Switch between light and dark themes.

All user preferences and checklist data are stored in the browser with `localStorage`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Server | Node.js HTTP server |
| Storage | Browser localStorage |
| Container | Docker |
| Deployment Target | Google Cloud Run |

## Project Structure

```text
vote-wise-ai/
|-- public/
|   |-- index.html        # Main app markup
|   |-- style.css         # UI, themes, responsive layout
|   `-- app.js            # Client-side behavior and guide logic
|-- server/
|   `-- server.js         # Static server and /api/guide endpoint
|-- Dockerfile            # Production container image
|-- .dockerignore         # Files excluded from Docker image
|-- package.json          # Node scripts and metadata
`-- README.md             # Project documentation
```

## Core Features

### User Profile

Users can save:

- Name
- Voter role
- Preferred language

This personalizes the dashboard and makes the experience feel more direct.

### Election Guide Assistant

The assistant provides structured guidance with:

- Overview
- Step-by-step process
- Timeline
- Requirements
- User status
- Next action

The guide works locally and does not require an external AI API.

### Light and Dark Theme

The app includes a theme toggle. The selected theme is saved locally, so the next visit keeps the user’s preference.

### Voting Day Planner

Users can save:

- Election date
- Voting method

The app generates practical preparation milestones.

### Voting Day Kit

Users can prepare and copy a personal voting day kit with:

- Polling place or official link
- Travel plan
- Important note
- ID readiness
- Registration proof readiness
- Phone and helpline readiness
- Day bag readiness

### Checklist and Progress

The checklist adapts based on the user’s profile and registration status. Progress is displayed visually with step cards and completion count.

### Civic Knowledge Quiz

A short quiz helps users test readiness and quickly ask the guide for help on missed topics.

### ECI News Desk

The news section shows Election Commission of India-related updates with source links and quick explanation actions.

## Local Development

### Requirements

- Node.js 18 or newer recommended
- npm

### Install

This project has no third-party runtime dependencies. You can run it directly.

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

This runs the same lightweight server.

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` locally, `8080` in Docker | Port used by the Node server |

The Dockerfile sets:

```text
PORT=8080
```

This is compatible with Google Cloud Run.

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

## Deploy To Google Cloud Run

### 1. Set Your Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required Google Cloud Services

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 3. Deploy Directly From Source

```bash
gcloud run deploy civicguide-ai \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

Cloud Run will build and deploy the container automatically.

### 4. Open The Service

After deployment, Google Cloud prints a service URL. Open that URL in your browser.

## Alternative GCP Deployment With Container Image

### Build And Push With Cloud Build

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/civicguide-ai
```

### Deploy Image To Cloud Run

```bash
gcloud run deploy civicguide-ai \
  --image gcr.io/YOUR_PROJECT_ID/civicguide-ai \
  --region asia-south1 \
  --allow-unauthenticated
```

## Suggested GitHub Workflow

### 1. Initialize Git

```bash
git init
git add .
git commit -m "Initial CivicGuide AI app"
```

### 2. Create A GitHub Repository

Create an empty repository on GitHub, then connect it:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

### 3. Deploy From GitHub To Cloud Run

You can connect the GitHub repository in Google Cloud Run and configure automatic builds from the `main` branch.

## Security And Privacy

- No database is used.
- No personal data is sent to an external API.
- User data is stored in the browser using `localStorage`.
- `.env` is excluded from Docker builds through `.dockerignore`.
- Do not commit secrets or private credentials to GitHub.

## Performance Notes

The project is designed to stay small:

- No frontend framework
- No bundled assets
- No image files required for the logo or background
- CSS-only animated visuals
- Minimal Node.js server

The source project should remain far below the requested 10 MB limit.

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

Request body:

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

## Browser Support

The app uses modern browser features such as:

- CSS gradients
- CSS animations
- localStorage
- Fetch API
- Clipboard API with fallback

Use a current version of Chrome, Edge, Firefox, or Safari for the best experience.

## Customization

Common customization points:

- `public/style.css` for theme, layout, animation, and colors
- `public/app.js` for guide logic, quiz questions, news cards, and checklist behavior
- `server/server.js` for static serving and API response logic

## Production Checklist

Before deployment:

- Confirm `.env` is not committed.
- Run the app locally.
- Test light and dark themes.
- Check the `/api/health` endpoint.
- Build the Docker image if deploying manually.
- Deploy to Cloud Run using `PORT=8080`.

## License

This project is released under the MIT License.

## Disclaimer

CivicGuide AI is an educational civic guidance tool. Election rules, deadlines, documents, and procedures can change by location. Users should always confirm final details through official Election Commission or local election office sources.
