# Backend (Flask) Dockerfile
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app \
    FLASK_RUN_PORT=5001

WORKDIR /app

# Install uv (fast Python package manager)
RUN pip install --upgrade pip && pip install uv

# Copy dependency list and install
COPY requirements.txt ./
RUN uv pip install -r requirements.txt --system

# Copy application code
COPY . .

EXPOSE 5001

# Default command
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]
