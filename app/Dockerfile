# OCPA-R1: Fixed base image version, multi-stage build
# Build context is project root (.), not app/

# --- Base stage ---
FROM python:3.12.8-slim-bookworm AS base
WORKDIR /app
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000

# --- Dev target (hot-reload via mounted volumes) ---
FROM base AS dev
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# --- Prod target (static files baked in) ---
FROM base AS prod
COPY app/src/ .
RUN useradd -r appuser && chown -R appuser /app
USER appuser
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
