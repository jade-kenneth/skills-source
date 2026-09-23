# Service Implementation

Services own all business logic: validation of business rules, orchestration of repositories and side effects, and mapping between persistence records and API types.

## Validation

- Inline small validation and normalization logic; do not create tiny helpers like `normalizeRequiredString`.
- When multiple entry points share request/body or write-model rules, centralize those rules in a feature validation module or common pipe (see `src/common/validation/`) and pass the parsed result into persistence. Do not leave unused validation helpers beside write paths, and do not rely on ad-hoc controller defaults for required body fields.
- GraphQL resolver `input` arguments must use the service-validated args decorator (`src/common/decorators/`) when SDL handles shape/nullability and the service owns business-rule validation. This keeps resolvers thin while making validation ownership visible to readers and static audits.

### Drafts versus final submission

When a write serves both "save a draft" and "submit" (a resumable form, a multi-step wizard), validate the two differently.

- **Submit is all or nothing.** Required fields present and every format rule passing, or a validation error naming each field and no write.
- **A draft save never refuses the whole write over one field.** Run the same per-field format rules, persist the valid fields, omit each malformed one so the previously stored value stays, and return the omitted field names in a stable place on the success result (the response body, or a field on the mutation's payload type) so the client can mark them.
- **Never persist a malformed value to let a draft through.** A draft relaxes what blocks the rest of the save, not what reaches storage.
- **Server-set fields are never relaxed for a draft.** Status, owner and tenant still come from verified context, never from the input.
- **Test both.** A draft with one malformed field succeeds, its write omits that field and keeps the rest, and the result names it; the same input as a submit is rejected with no write.

## File uploads & ingest

For presigned upload or file-ingest endpoints, validate more than presence:

- Require an allowed storage namespace.
- Reject traversal or absolute keys.
- Enforce a MIME/type allowlist before signing any write.
- Do not accept caller-supplied final object keys for shared folders; clients may provide upload *intent* (namespace, content type), but the **service** generates the final unique storage key and extension.

### Processing ingested media server-side

When the service downloads a remote object to process it (thumbnails, transcoding, metadata extraction), the input is user-controlled and unbounded. Do not materialize it as one in-memory byte array:

- Stream the remote body to a uniquely created temporary file, then hand the **file path** to path-based processors. Never buffer an unbounded upload into a single application-memory buffer.
- Create per-task temporary storage with restrictive permissions and remove the entire task-owned directory in a `finally` block on both success and failure.
- Reject a remote body that cannot provide the expected stream instead of silently falling back to buffering; a missing stream is an error, not a slow path.
- Test the processing path with real readable streams for each supported media type so a regression back to byte-array buffering is observable.

### Deleting records that own external objects

Removing the database row is not the whole operation when the record owns an external object (stored file, thumbnail) and contributes to a usage counter (quota). Dropping only the metadata orphans the object and leaves usage totals overstated forever.

- Authorize before every side effect, then delete the external object(s) **before** persisting the terminal deletion, and make the failure boundary explicit rather than silently orphaning storage. Restrict external deletion to the server-owned storage namespace so a stray key cannot target arbitrary objects.
- Persist the **server-verified** object size at attachment time and release exactly that amount from usage when deletion succeeds. Never trust or re-derive a client-supplied size at delete time.
- Clamp usage counters at zero and ignore non-positive adjustments, and reconcile aggregate usage after a cascade, so retries, legacy rows, or partial historical data cannot drive totals negative or leave them drifting.
- Give a parent-entity cascade the same object-cleanup and usage-release steps as a single-record delete; do not let the bulk path skip them.
- Cover single-record deletion and parent cascades with tests that assert object cleanup, usage release, authorization ordering, and metadata cleanup together.

## Side-effect ordering

In multi-step workflows with side effects, perform the side effect first and only persist terminal state after it succeeds. Handle rollback or transactional boundaries explicitly when ordering cannot change.

## Workflow gates and approvals

When one step builds on an approved earlier one (draft → review → approve → publish), the order is a business rule and lives in the service, not in the client.

- Check the predecessor's state in the service before the step runs, and fail with a conflict error whose message a person can act on. A disabled button in a client is not a gate.
- An approval records a version of every input the next step reads, not only the step directly before it. Include the root record the workflow hangs off, hashed by value so an edit that changes nothing does not count. Fold that version into each downstream record's fingerprint, so re-approving upstream forces a stale child to be regenerated rather than silently reused. A record saved before the version existed counts as stale.
- A write that must contain a fixed set of items checks identity, not count: match each item to a stored record by id, reject duplicates and strangers, and take fixed attributes (role, type) from the stored record rather than the input.
- Approval refuses placeholder content. Fallback text carries a fixed marker, and the approve path rejects any record still containing it; saving it as a draft stays allowed.

## Model output and outbound fetches

Output from a language model is untrusted input, the same as a request body.

- Read it as `unknown` and coerce every field to its type, with enum values allowlisted, before it reaches a record.
- Rebuild the persisted record field by field from an allowlist of keys; never spread model output into a write, so stray fields such as `status`, `approvedAt` or an owner id cannot ride along. Cap counts and string lengths.
- The model never approves anything. Generated records are persisted as drafts; only an authorized human request sets an approved state, and human-entered non-empty values win over generated ones.
- Values the prompt tells the model not to change (entitlements, assignments, configuration) are copied from their source in code after normalisation. The prompt instruction is a hint, not the control.
- A label claiming a value came from a person or a record is kept only when the value matches that input exactly; otherwise relabel it as generated. Filter citations to sources that were actually collected.

When the service fetches a caller-supplied URL, check the scheme and host against an allowlist first (no private, loopback or link-local address), give the request a timeout, and cap the response size before parsing or storing it. Truncate provider error bodies before logging or returning them.

## REST endpoints

REST endpoints that perform side effects must declare authentication intent at the method boundary. For admin-only writes, pair the JWT auth guard with the roles guard and an explicit `@Roles(...)` annotation; do not rely on request-body validation as an authorization control.

## Related References

- `auth-patterns.md` — guards, roles, and decorators referenced above
- `module-structure.md` — where services sit in the module
- `scheduled-work.md` — side-effect ordering in scheduled sweeps
- `multi-tenancy.md` — tenant checks belong in the service path too
