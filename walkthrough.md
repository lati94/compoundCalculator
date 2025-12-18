# Walkthrough - Compound Interest Calculator

I have built the full-stack application with a FastAPI backend and React frontend.

## 🚀 How to Run

Because Docker was not accessible during the build process, I have manually scaffolded the application structure. You can run the entire stack using Docker Compose.

**Prerequisites:**
- Ensure **Docker Desktop** is running.

**Steps:**
1. Open your terminal in the project directory:
   `c:\Users\klat\OneDrive - C&F S.A\Karol\learning\google_test`
2. Run the following command:
   ```bash
   docker compose up --build
   ```
3. Open your browser to:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

## Key Features
- **Premium UI**: Dark mode, gradients, and responsive layout.
- **Dynamic Charts**: Toggle between Line and Stacked Bar charts using Recharts.
- **Real-time Calculation**: Updates as you interact with the form (debounced).
- **Dockerized**: Full environment defined in `docker-compose.yml`.

## Troubleshooting
- If you see `npm` errors during build, ensure the volume mounting in `docker-compose.yml` is allowed in Docker Desktop settings.
- If the frontend cannot reach the backend, check that the `VITE_API_URL` environment variable is correctly passed in `docker-compose.yml`.
