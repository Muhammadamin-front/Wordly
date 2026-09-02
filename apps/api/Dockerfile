FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /srv/api

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Serve only. Migrations and content import run once from deploy.sh, before
# the new containers come up: doing them here made every start a schema
# change, serialized behind one container, and could not survive a second
# replica racing the same upgrade.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --no-proxy-headers --workers ${UVICORN_WORKERS:-2}"]
