# Outreach dashboard deployment

This directory contains the reviewed templates for the login-protected,
dashboard-only service. The service stays private on `127.0.0.1:3100` until
all checks pass. Tailscale Funnel `:10000` is the final step.

## Required host facts

- Host: Finland VPS, canonical Tailscale name
  `finland-freedom1-89-167-19-64.tail0dc61e.ts.net`.
- Preserve the existing public mapping `:443 -> http://127.0.0.1:20128`.
- Do not change `:8443`; xray owns it.
- Dashboard Funnel listener: `:10000` only.
- Durable data: `/var/lib/aitransforms-outreach/pglite`.
- Releases: `/opt/aitransforms-outreach/releases/<git-sha>` with atomic
  `/opt/aitransforms-outreach/current` symlink.

## Fail-closed preflight

Run these checks before installing anything. Capture their output in a
root-owned `0700` deploy-report directory under `/var/backups`.

1. Record `systemd --version`, `systemd-creds --version`, `tailscale version`,
   `tailscale status --json`, `tailscale serve status --json`,
   `tailscale funnel status --json`, `ss -ltnp`, and the existing service state.
2. Confirm systemd host-bound credential encrypt/decrypt works with a temporary
   value that is not a production credential.
3. Install the Infisical CLI from its official package instructions. This host
   did not have `infisical` during the 2026-07-30 repo preflight. Verify its
   `login --help` exposes Universal Auth and that `run --help` exposes
   `--projectId`, `--env`, and `--path`.
4. Confirm the Infisical machine identity is scoped only to the dashboard secret
   folder. That folder must contain canonical base64url values for
   `OUTREACH_OPERATOR_PASSWORD` (at least 16 random bytes) and
   `OUTREACH_SESSION_SIGNING_KEY` (exactly 32 random bytes).
5. Reconfirm TCP port `3100` is free locally, Funnel port `10000` is allowed and
   free, `:443` still targets `127.0.0.1:20128`, and xray still owns `:8443`.

Any failed item stops deployment. Do not fall back to a plaintext environment
file, command-line secret, or secret embedded in a unit or release.

## Validate the committed artifacts

From `outreach-engine/`:

```sh
sh -n ops/aitransforms-outreach-start ops/offline-backup ops/smoke
systemd-analyze verify ops/aitransforms-outreach.service
rg -n 'set -x|OUTREACH_OPERATOR_PASSWORD=|OUTREACH_SESSION_SIGNING_KEY=|client-secret=[^<]' ops --glob '!README.md'
```

The last command must find no shell tracing or secret assignment.

## Private-first release

1. Merge by PR and choose the merged Git SHA. Create a root-owned release at
   `/opt/aitransforms-outreach/releases/<sha>`, install production dependencies,
   run tests/typecheck, and make the release non-writable by the service user.
2. Create the system user `aitransforms-outreach` with no login shell. Create
   `/var/lib/aitransforms-outreach/pglite` as that user with mode `0700`.
3. Copy `aitransforms-outreach-start` to
   `/usr/local/libexec/aitransforms-outreach-start`, owned by root and mode
   `0755`.
4. Copy the unit to a staging path. Replace only
   `@INFISICAL_PROJECT_ID@`, `@INFISICAL_ENVIRONMENT@`, and
   `@INFISICAL_SECRET_PATH@` with the reviewed non-secret values. Verify the
   staged unit, then back up any installed unit with a UTC timestamp before
   installing it.
5. Create `/etc/credstore.encrypted` as root `0700`. Use
   `systemd-ask-password` piped directly to `systemd-creds encrypt --name=... -`
   to create the host-bound client-ID and client-secret blobs. Never put the
   plaintext in a file, argument, shell history, or journal. The encrypted blobs
   are host-specific and never enter Git.
6. Atomically point `/opt/aitransforms-outreach/current` at the new release,
   reload systemd, start the service, and run `ops/smoke` against
   `http://127.0.0.1:3100`.
7. From an authenticated private test client, verify login, exact/mismatched
   Origin behavior, all five review routes, a persisted mock-only decision,
   logout, service restart, and retained data. Confirm a second writer fails.
8. Run `ops/offline-backup`. Record its printed backup identifier. Follow the
   restore rehearsal below before enabling public ingress.

## Restore rehearsal and recovery

For every candidate backup, extract it into a new temporary directory under
`/var/lib`, never over the live database. Preserve numeric ownership and modes,
then open and close that separate PGlite directory with the pinned release's DB
module. Record the backup identifier and successful open. Delete the rehearsal
directory only after recording the result.

An actual data restore is exceptional: first prove corruption, disable only the
new Funnel listener, stop the unit, preserve the failed live data under a UTC
timestamped name, extract the named verified archive into a fresh `pglite`
directory, restore service ownership/mode, start privately, and run the full
login/data checks. Never restore data as part of routine code rollback.

## Funnel enablement and rollback drill

Back up `tailscale serve status --json` and `tailscale funnel status --json`
immediately before change. Normalize listener, path, proxy target, and exposure
mode for comparison.

After all private gates pass, add only:

```sh
tailscale funnel --bg --https=10000 http://127.0.0.1:3100
```

Verify the reported URL exactly equals
`https://finland-freedom1-89-167-19-64.tail0dc61e.ts.net:10000`, and prove the
normalized `:443` definition is unchanged. Before relying on a remove command,
confirm the installed Tailscale version supports removing only `:10000`; never
use `tailscale funnel reset`, because that can remove unrelated listeners.
Exercise remove/re-add once, then run fresh-browser login, queue, decision,
logout, restart, and blocked-access checks.

## Code rollback

1. Remove only the new `:10000` Funnel listener and verify all prior listeners.
2. Stop `aitransforms-outreach.service`.
3. Atomically repoint `current` to the previous schema-compatible release.
4. Start privately and run health, login, and retained-data checks.
5. Restore only the `:10000` listener and repeat the public canary.

Do not restore PGlite unless a demonstrated data problem requires the separate
recovery procedure above.
