FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /srv/api

# The lock, not the range list: two builds of the same commit must install
# the same bytes. requirements.txt remains the declared direct dependencies.
COPY requirements.lock.txt .
RUN pip install --no-cache-dir -r requirements.lock.txt

COPY . .

# Run as an ordinary user: nothing here needs root, and a bug in a dependency
# should not come with write access to the whole filesystem. The fixed UID
# matters because tts_cache is a named volume — deploy.sh chowns it to this
# id once, so an existing deployment keeps its cached audio.
RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid 10001 --system --no-create-home app \
    && mkdir -p /srv/api/tts_cache \
    && chown -R app:app /srv/api
USER app

EXPOSE 8000

# Serve only. Migrations and content import run once from deploy.sh, before
# the new containers come up: doing them here made every start a schema
# change, serialized behind one container, and could not survive a second
# replica racing the same upgrade.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8000 --no-proxy-headers --workers ${UVICORN_WORKERS:-2}"]
