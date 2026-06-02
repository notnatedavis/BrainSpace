### docs/Memory.md

# Persistent Knowledge Base

## Agent Rules

- **This file is append‑only.** Never delete or alter past entries. If information becomes outdated, add a new entry that references the old one and explains the update.
- Every entry must start with a `###` heading that includes a number and title.
- When you learn something reusable (a tricky bug, a configuration quirk, a design decision rationale), record it here immediately.
- When answering a question, scan this file for relevant past learnings and cite the entry title/date.

---

### Ex. 1 – Redis connection timeout in Docker

The Redis container sometimes fails to start because `redis.conf` disables protected mode but the container binds to `0.0.0.0`. Fixed by explicitly setting `bind 127.0.0.1` in `redis.conf`.

### 1 - Update

update