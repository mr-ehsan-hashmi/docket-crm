"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { describedBy, fieldErrorId, inputClasses } from "@/components/ui/field";
import { describeError } from "@/lib/api/errors";
import { useAddNote } from "@/lib/contacts/queries";
import { noteSchema, type NoteFormValues } from "@/lib/contacts/schema";
import type { Note } from "@/lib/contacts/types";
import { cn, formatDateTime } from "@/lib/format";

const NOTE_FIELD_ID = "note-body";

function NoteComposer({ contactId }: { contactId: string }) {
  const addNote = useAddNote(contactId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({ resolver: zodResolver(noteSchema), defaultValues: { body: "" } });

  const submit = handleSubmit(({ body }) => addNote.mutate(body, { onSuccess: () => reset() }));
  const errorMessage = errors.body?.message ?? (addNote.isError ? `${describeError(addNote.error)} Your note is still in the box.` : undefined);

  return (
    <form noValidate onSubmit={submit}>
      <label htmlFor={NOTE_FIELD_ID} className="sr-only">
        Add a note
      </label>
      <textarea
        id={NOTE_FIELD_ID}
        rows={3}
        placeholder="Called back, documents received, what happens next…"
        className={cn(inputClasses, "py-2.5 leading-relaxed")}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={describedBy(NOTE_FIELD_ID, { error: Boolean(errorMessage) })}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit();
        }}
        {...register("body")}
      />
      <div className="mt-2 flex items-start justify-between gap-4">
        <p id={fieldErrorId(NOTE_FIELD_ID)} role="alert" className="text-sm font-medium text-danger">
          {errorMessage}
        </p>
        <Button type="submit" variant="secondary" size="sm" disabled={addNote.isPending}>
          {addNote.isPending ? "Saving…" : "Save note"}
        </Button>
      </div>
    </form>
  );
}

export function NotesPanel({ contactId, notes }: { contactId: string; notes: Note[] }) {
  return (
    <section aria-labelledby="notes-heading">
      <h2 id="notes-heading" className="mb-3 font-serif text-xl font-medium">
        Notes
      </h2>
      <NoteComposer contactId={contactId} />

      {notes.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-rule-strong px-4 py-6 text-center text-sm text-ink-soft">
          No notes yet. Write down what was said so the next person doesn&apos;t have to ask again.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-md border border-rule bg-card px-4 py-3 shadow-card">
              <p className="wrap-anywhere whitespace-pre-wrap text-sm leading-relaxed text-ink">{note.body}</p>
              <p className="mt-2 text-xs text-ink-faint">
                <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
