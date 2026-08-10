# Vocora backup and disaster recovery

This runbook protects the only durable production state: PostgreSQL. Redis and
the TTS cache are disposable. A Docker volume on the same VM is **not** a
backup.

## Required off-site setup

Use a private Restic repository in a separate provider/account where practical
(S3-compatible object storage, Backblaze B2, or an encrypted Restic server).
Restic encrypts and authenticates every backup before upload. Create the
root-owned `/etc/vocora/backup.env` with mode `0600`:

```bash
RESTIC_REPOSITORY=s3:https://s3.example.com/vocora-production
RESTIC_PASSWORD_FILE=/etc/vocora/restic-password
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
VOCORA_BACKUP_KEEP_DAILY=14
VOCORA_BACKUP_KEEP_WEEKLY=8
VOCORA_BACKUP_KEEP_MONTHLY=12
```

Create `/etc/vocora/restic-password` with a unique high-entropy value and mode
`0600`. Initialise the repository once with `restic init`. Store a separate,
access-controlled copy of the repository URL, credentials, and password in the
organisation password manager; losing both the Restic password and that copy
makes recovery impossible.

Install the timer after each server checkout:

```bash
sudo install -m 0644 ops/systemd/vocora-backup.service /etc/systemd/system/
sudo install -m 0644 ops/systemd/vocora-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now vocora-backup.timer
sudo systemctl list-timers vocora-backup.timer
```

The timer runs nightly, retains 14 daily, 8 weekly, and 12 monthly restore
points, and removes the local temporary dump only after the encrypted upload
and retention command finish successfully.

## Verification

Run a read-only integrity check weekly and after changing storage credentials:

```bash
sudo -E /home/kitsune/Wordly/ops/backup/verify-postgres-backup.sh
```

It samples repository data, restores the latest backup only to a temporary
directory, and validates the PostgreSQL archive with `pg_restore --list`. It
does not connect to, stop, or mutate production Postgres.

Perform a full restore drill at least quarterly. The repository includes a
disposable Docker-network drill which restores to an empty PostgreSQL container,
runs `alembic upgrade head`, starts a development-configured copy of the API,
then checks `/health/detail` and an isolated register/login flow. It never
connects to or changes the production database:

```bash
sudo /home/kitsune/Wordly/ops/backup/restore-drill.sh
```

The script reads the root-only backup configuration from
`/etc/vocora/backup.env`, writes a timestamped result to
`/var/log/vocora/operations.log`, verifies the archive checksum, and destroys
its temporary containers/network after completion. Review the operations-log
entry and record the operator and any follow-up work in the team runbook.

## Catastrophic recovery

1. Put the public app in maintenance mode at the proxy; do not point users at a
   half-restored database.
2. Provision a clean VM and install Docker, Compose, Restic, and PostgreSQL
   client tools. Clone a known-good Vocora commit.
3. Recover `/etc/vocora/backup.env` and the Restic password from the approved
   password manager. Do not paste them into shell history or tickets.
4. Start only a fresh Postgres container. Restore the selected snapshot into a
   temporary directory: `restic restore <snapshot-id> --target /secure/restore`.
5. Load the custom dump into the empty database using `pg_restore --clean
   --if-exists --no-owner -U words -d words /secure/restore/...dump`. This
   command is destructive **only on the new empty recovery database**.
6. Start the full compose stack, run `alembic upgrade head`, and check
   `/health/detail`, admin access, an ordinary login, and subscription records.
7. Rotate application secrets and payment webhook credentials if the original
   server compromise is suspected, then switch DNS/proxy traffic only after the
   recovery checks pass.

Never run `pg_restore --clean` against a live production database. Preserve the
old server/volume for investigation until recovery is signed off.
