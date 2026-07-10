# Scheduled Work

Cron jobs use `@nestjs/schedule` and are coordinated through the scheduler-locks module so only one instance fires in multi-replica deployments.

## Rules

- Recurring jobs must use the shared scheduler lock service and honor the runtime scheduler-enabled flag **before** doing work. A job that skips either will double-fire across replicas or run in environments where it shouldn't.
- Once-only reminders or sweeps must persist a dedicated timestamp field on the affected record so retries and multiple replicas do not re-send the same side effect indefinitely. "Sent" state lives in data, not in memory.
- Stamp reminder timestamps only **after** the notification or side-effect path has been attempted successfully enough for the user-visible record to exist. Stamping first and sending second silently drops the side effect on failure.
- Log per-record failures and continue the sweep — one bad record must not abort the batch.
- Sweeps over tenant-owned data stay tenant-scoped per record; never let a scheduled job become an accidental cross-tenant read/write path.

## Related References

- `service-implementation.md` — side-effect-first ordering, the same rule the timestamp stamping follows
- `multi-tenancy.md` — tenant scoping inside sweeps
- `module-structure.md` — where schedulers live in a domain module
