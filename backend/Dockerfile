FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN python -m venv .venv \
  && .venv/bin/python -m pip install --upgrade pip \
  && .venv/bin/python -m pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD [".venv/bin/python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
