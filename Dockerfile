# Build the React app, then serve it and the API from one FastAPI service.
FROM node:22-alpine AS web
WORKDIR /web
COPY Frontend/package*.json ./
RUN npm ci || npm install
COPY Frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY Backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY Backend/app ./app
COPY Backend/rsvmodel ./rsvmodel
COPY --from=web /web/dist ./static
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
