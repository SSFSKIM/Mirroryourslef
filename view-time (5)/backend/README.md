# Backend (FastAPI)

## Documentation

- [ViewTime PRD & TRD](../docs/PRD_TRD.md)

## Notes

This backend runs in Databutton with modular APIs under `app/apis/<api_name>/__init__.py`. See the PRD/TRD for system architecture, endpoints, and conventions.

## Deploying to Google Cloud Run (Backend only)

We provide a minimal Dockerfile tailored for Cloud Run under `backend/Dockerfile`. It exposes FastAPI on `$PORT` (defaults to 8080) and expects the working directory to contain `main.py` and `routers.json`.

Quickstart (from repo root):

1. Build & push

   - Using gcloud with local Docker: adjust project/image names as needed.

   ```bash
   cd "view-time (5)/backend"
   gcloud builds submit --tag gcr.io/<PROJECT_ID>/viewtime-backend
   ```

2. Deploy to Cloud Run

   ```bash
   gcloud run deploy viewtime-backend \
     --image gcr.io/<PROJECT_ID>/viewtime-backend \
     --region <REGION> \
     --allow-unauthenticated \
     --port 8080 \
     --set-env-vars "DATABUTTON_EXTENSIONS=[{\"name\":\"firebase-auth\",\"config\":{\"firebaseConfig\":{\"projectId\":\"<FIREBASE_PROJECT_ID>\",\"apiKey\":\"<API_KEY>\",\"appId\":\"<APP_ID>\",\"authDomain\":\"<AUTH_DOMAIN>\",\"storageBucket\":\"<STORAGE_BUCKET>\",\"messagingSenderId\":\"<SENDER_ID>\"}}}]"
   ```

   Notes:
   - The `DATABUTTON_EXTENSIONS` env initializes the Firebase JWT validation used by `databutton_app/mw/auth_mw.py`.
   - Add any other secrets as environment variables or Secret Manager refs.

3. Health check

   - Verify: `curl https://<SERVICE_URL>/health`

Frontend pairing

- Host the Vite-built frontend on Firebase Hosting and add a rewrite for `/routes/**` to the Cloud Run URL. The generated brain client targets `/routes` paths already.
