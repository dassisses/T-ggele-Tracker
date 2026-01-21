# Build frontend
FROM node:18 as build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Setup backend
FROM python:3.9-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend ./backend

# Copy built frontend assets
COPY --from=build /app/frontend/dist ./frontend/dist

# Expose port
ENV PORT=8000
EXPOSE $PORT

# Run
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
