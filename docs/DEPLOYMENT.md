# Deployment Guide

**AI-Powered Early Detection of Student Academic Disengagement**

This guide provides step-by-step instructions for deploying the application to GitHub, Docker containers, and cloud hosting providers.

---

## 1. Pushing to GitHub

Repository target:
`https://github.com/Rethish-creator/AI-Powered-Early-Detection-of-Student-Academic-Disengagement.git`

### Push via Terminal

```bash
# 1. Check current remote configuration
git remote -v

# 2. If needed, set the remote origin:
git remote set-url origin https://github.com/Rethish-creator/AI-Powered-Early-Detection-of-Student-Academic-Disengagement.git

# 3. Push to GitHub:
git branch -M main
git push -u origin main
```

> **Note on Authentication**: When prompted, enter your GitHub Username and use a **Personal Access Token (Classic or Fine-Grained)** as your password (with `repo` permissions enabled from [github.com/settings/tokens](https://github.com/settings/tokens)).

---

## 2. Docker Container Deployment

### Local Docker Build & Run

```bash
# Build the Docker image
docker build -t edusignal-ai:latest .

# Run the container on port 3000
docker run -d -p 3000:3000 -e PORT=3000 --name edusignal edusignal-ai:latest
```

### Docker Compose

```bash
docker-compose up -d --build
```

Access the app at `http://localhost:3000`.

---

## 3. GitHub Actions Continuous Integration & Deployment

The repository includes pre-configured GitHub Actions workflows:

1. **`.github/workflows/ci.yml`**:
   - Executes on every push or pull request to `main`.
   - Runs TypeScript linting (`npm run lint`), build verification (`npm run build`), and Docker image test build.

2. **`.github/workflows/deploy.yml`**:
   - Packages and pushes the production Docker image to the **GitHub Container Registry (GHCR)**:
     `ghcr.io/rethish-creator/ai-powered-early-detection-of-student-academic-disengagement:latest`

---

## 4. Deploying to Cloud Platforms

### A. Render (render.com)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository: `Rethish-creator/AI-Powered-Early-Detection-of-Student-Academic-Disengagement`.
3. Set the configuration:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free / Starter
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `GEMINI_API_KEY`: *(Optional, for Gemini 3.1 & 3.8 features)*
5. Click **Create Web Service**.

### B. Railway (railway.app)
1. In Railway, click **New Project** -> **Deploy from GitHub repo**.
2. Select `Rethish-creator/AI-Powered-Early-Detection-of-Student-Academic-Disengagement`.
3. Railway automatically detects the `Dockerfile` or `package.json` and deploys on port 3000.

### C. Google Cloud Run
```bash
# Build & submit container to Google Artifact Registry
gcloud builds submit --tag gcr.io/<PROJECT_ID>/edusignal-ai

# Deploy to Cloud Run
gcloud run deploy edusignal-ai \
  --image gcr.io/<PROJECT_ID>/edusignal-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

---

## 5. Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port on which the Express server listens |
| `NODE_ENV` | No | `development` | Set to `production` in live environments |
| `JWT_SECRET` | No | Built-in fallback | Secret key for signing and verifying JWT tokens |
| `GEMINI_API_KEY` | No | None | API key for Gemini 3.1 Image Studio and Gemini 3.8 Voice Assistant |
