# Forms — react-hook-form + zod

## Stack

- `react-hook-form` (`useForm`, `Controller`, `useFieldArray`, `useWatch`) for form state.
- `zod` schema + `zodResolver` (`@hookform/resolvers/zod`) for validation — the schema is the single source of truth.
- shadcn inputs for primitives; shared field wrappers (rich text, upload, etc.) consumed through `Controller`.

---

## Form Setup Pattern

Colocate the schema with the form component, infer the values type from it, and derive default values through one helper used everywhere.

```tsx
const itemFormSchema = z.object({
  title: z.string().trim().min(3).max(300),
  // derive a comparable value before validating it (e.g. plain text out of rich HTML)
  description: z
    .string()
    .transform(getPlainTextFromRichTextHtml)
    .pipe(z.string().min(20).max(1000)),
  closingDate: z.string().refine((value) => new Date(value) > new Date(), {
    message: 'Closing date must be in the future',
  }),
  status: z.nativeEnum(ItemStatus),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

function getDefaultValues(item?: ItemRecord | null): ItemFormValues {
  return {
    title: item?.title ?? '',
    description: item?.description ?? '',
    closingDate: formatDateTimeLocal(item?.closingDate),
    status: item?.status ?? ItemStatus.Draft,
  };
}

const form = useForm<ItemFormValues>({
  resolver: zodResolver(itemFormSchema),
  defaultValues: getDefaultValues(item),
});
```

Rules:

- **One `getDefaultValues` helper** — never duplicate default-value literals across create/edit/reset call sites.
- **Validate in the schema, not the submit handler.** `trim()`, length limits, cross-field `refine`, enum membership (`z.nativeEnum`) all belong in zod.
- Prototype `if` checks and manually assigned error strings describe intended feedback only. Translate them into this schema and the standard API error mapping; never copy them as the production validation layer.
- Client schemas provide immediate UX feedback. The API must independently enforce persisted business rules, authorization, and security-sensitive constraints.
- **Use `transform` + `pipe`** when the raw input value must be normalized before validating (rich text → plain text length, string → parsed number).
- Do not `as`-cast form values; if the types don't line up, the schema or the values type is wrong.

---

## Resetting

- **When the edited entity changes** (dialog reused for another row), `form.reset(getDefaultValues(entity))` in an effect keyed on the entity identity — otherwise the form shows stale values.
- **After a successful create**, reset to empty defaults so reopening the dialog is clean.
- **On cancel/close**, reset rather than leaving dirty state to leak into the next open.

```tsx
useEffect(() => {
  form.reset(getDefaultValues(item));
}, [item?.id]); // entity identity, not the object reference
```

---

## Array Fields — useFieldArray

Validate the array shape at the schema level (item shape + `min`/`max` with messages), manage rows with `useFieldArray`, and key rows by `field.id` — never by index.

```tsx
const optionsSchema = z
  .array(z.object({ value: z.string().trim().min(1).max(200) }))
  .min(2, 'At least 2 options required')
  .max(8, 'Maximum 8 options allowed');

const fieldArray = useFieldArray({ control: form.control, name: 'options' });

{fieldArray.fields.map((field, index) => (
  <div key={field.id}>
    <Input {...form.register(`options.${index}.value`)} />
    <Button type="button" onClick={() => fieldArray.remove(index)} />
  </div>
))}
```

Disable the "add row" control at the schema's max and the "remove row" control at the schema's min so the UI can't produce a state the schema rejects.

---

## Shared Field Wrappers — Controller

When a shared field wrapper exists for an input type (rich text, file/image upload, date picker, tag input), consume it through `Controller` with the standard contract — `value`, `onChange`, `errorMessage`, `disabled`. Never re-implement its internals inline (see `common-anti-patterns.md` § Re-Implementing a Shared Field Component Inline).

```tsx
<Controller
  control={form.control}
  name="imageUrl"
  render={({ field }) => (
    <SharedUploadField
      value={field.value ?? ''}
      onChange={field.onChange}
      errorMessage={form.formState.errors.imageUrl?.message}
      disabled={isBusy}
    />
  )}
/>
```

---

## Watching Values — useWatch

Read live form values with `useWatch({ control, name })`. Never call `form.watch()` in render — it bails out React Compiler memoization and re-renders the whole form on every keystroke.

---

## Submit Gating and Busy State

Derive one busy flag from every mutation the form can trigger, then apply the mutation-safety non-negotiable:

```tsx
const isBusy =
  createMutation.isPending ||
  updateMutation.isPending;

<form
  onSubmit={form.handleSubmit((values) => {
    if (isBusy) return;
    // choose create vs update, call mutate
  })}
>
  <Button type="submit" disabled={isBusy}>
    {isBusy ? <Loader2 className="animate-spin" /> : null}
    Save
  </Button>
</form>
```

- Disable the submit control **and** guard the handler — either alone still double-fires.
- Pass `disabled={isBusy}` down to shared field wrappers so uploads/edits can't race the submit.

---

## Error Display

- **Field-level errors** render inline next to their control from `form.formState.errors`, with `role="alert"` on the message element. The zod message is the copy — write messages in the schema.
- **Submit-level errors** (server rejection) surface once, as a toast, through the client's error-explaining helper — never raw error objects. Do not double-report the same failure as both toast and inline text.
- Do not clear or mask server errors by resetting the form on failure; keep the user's input so they can correct and resubmit.

---

## Drafts and Save-for-Later

A multi-step or long form that offers "save and finish later" makes two different requests: a **draft save** and a **final submit**. Validate them differently.

- **The final submit is all or nothing.** Every required field present and every format check passing, or a field-level rejection and no write.
- **A draft save is never all or nothing.** One malformed or half-typed field must not throw away every other answer. Store every valid field, leave the malformed one out so the last good stored value stays, and return the names of the fields it did not store.
- **Never store a malformed value to make a draft succeed.** The format rules still decide what reaches storage. A draft only relaxes what blocks the *rest* of the save, not what gets persisted.
- **A partly successful save says so.** Mark the named fields with their inline errors and say "Saved, except the fields marked…". A bare "Saved" hides the part the user still has to fix.
- **Resuming reads the stored draft back through the same default-values helper**, including the step or page the user stopped on, so a returning user lands where they left off with their answers filled in.
- **A mock or preview mode that claims to save must keep the draft** somewhere the next page load reads (browser storage, read after mount and never during render), or say plainly that nothing is kept. A "saved" message that doesn't survive a reload reads as a save and isn't one.
- **Test both sides.** A draft with one malformed field succeeds, its write omits that field and includes the rest, and the response names it; the same body sent as a final submit is rejected with no write.

---

## Dialog and Drawer Forms

Create/edit flows live in modals or drawers (see the Inline flows non-negotiable). For dialog-hosted forms:

- Reset with the target entity's values when the dialog opens or the target changes.
- Keep the dialog mounted state and the form reset logic together so a reopened dialog never flashes the previous entity's values.
- On success: toast, targeted cache invalidation, close the dialog, then reset.

---

## Anti-Patterns

- `form.watch()` in render (React Compiler memoization bailout) — use `useWatch`.
- Validating in the submit handler what the schema should own.
- Duplicated default-value literals instead of one `getDefaultValues` helper.
- Keying `useFieldArray` rows by index.
- Storing server objects in form state — forms hold editable values only; server state stays in the query cache.
- Leaving a submit control enabled while its mutation is pending.
- Running the final submit's all-or-nothing validation on a "save and finish later" draft, so one half-typed field discards every other answer.
- `as` casts to force form values into API input types.
- An edit mode that silently skips some of the fields it shows. Every field an edit view displays either gets an input or says, in edit mode, why it is locked. "Structured" values (lists of objects, flag groups) still need an editor, and the server needs a matching per-row validator.
- Seeding an edit input with `JSON.stringify(object)` or rendering an object with `String(value)` (`[object Object]`). Give each structured shape an explicit to-text and from-text mapping, and reject bad rows with a message naming the field and line.

---

## Related References

- `references/caching.md` — mutation lifecycle, invalidation after successful submits
- `references/graphql-patterns.md` — error handling in mutation submit handlers
- `references/notifications-toast.md` — success/error toast conventions for submits
- `references/upload-fields.md` — the shared upload field consumed via `Controller`
- `references/tiptap-richtext.md` — rich text field form integration
- `references/common-anti-patterns.md` — § Re-Implementing a Shared Field Component Inline
- `references/accessibility.md` — label pairing and error association for form controls
