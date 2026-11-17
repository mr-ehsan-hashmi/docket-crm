"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button, buttonStyles } from "@/components/ui/button";
import { Field, describedBy, inputClasses, selectClasses } from "@/components/ui/field";
import { AppLink, useUnsavedChanges } from "@/components/unsaved-changes";
import { describeError } from "@/lib/api/errors";
import {
  ATTORNEYS,
  PRACTICE_AREA_LABELS,
  REFERRAL_SOURCE_LABELS,
  STATUS_LABELS,
  UNASSIGNED_LABEL,
} from "@/lib/contacts/labels";
import {
  MATTER_SUMMARY_LIMIT,
  contactFormSchema,
  type ContactFormInput,
  type ContactFormValues,
} from "@/lib/contacts/schema";
import { CONTACT_STATUSES, PRACTICE_AREAS, REFERRAL_SOURCES, type Contact } from "@/lib/contacts/types";
import { cn } from "@/lib/format";
import { DuplicateWarning } from "./duplicate-warning";

export const EMPTY_CONTACT_FORM: ContactFormInput = {
  fullName: "",
  email: "",
  phone: "",
  practiceArea: "",
  referralSource: "website",
  status: "lead",
  assignedTo: "",
  matterSummary: "",
};

export function toFormInput(contact: Contact): ContactFormInput {
  return {
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    practiceArea: contact.practiceArea,
    referralSource: contact.referralSource,
    status: contact.status,
    assignedTo: contact.assignedTo,
    matterSummary: contact.matterSummary,
  };
}

interface ContactFormProps {
  contactId?: string;
  defaultValues: ContactFormInput;
  submitLabel: string;
  submittingLabel: string;
  cancelHref: string;
  onSubmit: (values: ContactFormValues) => void;
  isSubmitting: boolean;
  isSaved: boolean;
  submitError: unknown;
}

const textInputClasses = cn(inputClasses, "h-11");

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-rule pt-6 first:border-t-0 first:pt-0 sm:grid-cols-2">
      <legend className="float-left mb-1 w-full font-serif text-lg font-medium text-ink sm:col-span-2">{title}</legend>
      {children}
    </fieldset>
  );
}

export function ContactForm({
  contactId,
  defaultValues,
  submitLabel,
  submittingLabel,
  cancelHref,
  onSubmit,
  isSubmitting,
  isSaved,
  submitError,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const summaryLength = useWatch({ control, name: "matterSummary" }).length;

  useUnsavedChanges(isDirty && !isSaved);

  const errorCount = Object.keys(errors).length;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-rule bg-card p-5 shadow-card sm:p-8"
    >
      {submitError ? (
        <div role="alert" className="mb-6 rounded-md border border-danger/40 bg-danger-tint/60 px-4 py-3 text-sm">
          <p className="font-semibold text-danger">This contact wasn&apos;t saved</p>
          <p className="mt-0.5 text-ink-soft">
            {describeError(submitError)} Your entries are still here, so you can save again.
          </p>
        </div>
      ) : null}

      <div className="space-y-6">
        <FormSection title="Who is it?">
          <Field id="fullName" label="Full name" error={errors.fullName?.message} className="sm:col-span-2">
            <input
              id="fullName"
              type="text"
              autoComplete="off"
              className={textInputClasses}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy("fullName", { error: Boolean(errors.fullName) })}
              {...register("fullName")}
            />
          </Field>

          <Field
            id="phone"
            label="Phone"
            error={errors.phone?.message}
            hint="A phone number or an email is enough. Both is better."
          >
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              className={textInputClasses}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy("phone", { hint: true, error: Boolean(errors.phone) })}
              {...register("phone")}
            />
          </Field>

          <Field id="email" label="Email" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="off"
              className={textInputClasses}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("email", { error: Boolean(errors.email) })}
              {...register("email", { deps: ["phone"] })}
            />
          </Field>

          <DuplicateWarning control={control} excludeId={contactId} className="sm:col-span-2" />
        </FormSection>

        <FormSection title="What do they need?">
          <Field id="practiceArea" label="Practice area" error={errors.practiceArea?.message}>
            <select
              id="practiceArea"
              className={selectClasses}
              aria-invalid={Boolean(errors.practiceArea)}
              aria-describedby={describedBy("practiceArea", { error: Boolean(errors.practiceArea) })}
              {...register("practiceArea")}
            >
              <option value="">Choose one</option>
              {PRACTICE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {PRACTICE_AREA_LABELS[area]}
                </option>
              ))}
            </select>
          </Field>

          <Field id="referralSource" label="How they reached us">
            <select id="referralSource" className={selectClasses} {...register("referralSource")}>
              {REFERRAL_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {REFERRAL_SOURCE_LABELS[source]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="matterSummary"
            label="Matter summary"
            optional
            error={errors.matterSummary?.message}
            hint={
              <span className="flex justify-between gap-3">
                <span>Two or three sentences an attorney can skim before calling back.</span>
                <span
                  className={cn("tabular-nums", summaryLength > MATTER_SUMMARY_LIMIT && "font-semibold text-danger")}
                >
                  {summaryLength}/{MATTER_SUMMARY_LIMIT}
                </span>
              </span>
            }
            className="sm:col-span-2"
          >
            <textarea
              id="matterSummary"
              rows={4}
              className={cn(inputClasses, "py-2.5 leading-relaxed")}
              aria-invalid={Boolean(errors.matterSummary)}
              aria-describedby={describedBy("matterSummary", { hint: true, error: Boolean(errors.matterSummary) })}
              {...register("matterSummary")}
            />
          </Field>
        </FormSection>

        <FormSection title="Where does it stand?">
          <Field id="status" label="Status">
            <select id="status" className={selectClasses} {...register("status")}>
              {CONTACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>

          <Field id="assignedTo" label="Assigned attorney" optional>
            <select id="assignedTo" className={selectClasses} {...register("assignedTo")}>
              <option value="">{UNASSIGNED_LABEL}</option>
              {ATTORNEYS.map((attorney) => (
                <option key={attorney} value={attorney}>
                  {attorney}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-end">
        {errorCount > 0 ? (
          <p className="text-sm font-medium text-danger sm:mr-auto">
            {errorCount === 1 ? "1 field needs attention above." : `${errorCount} fields need attention above.`}
          </p>
        ) : null}
        <AppLink href={cancelHref} className={buttonStyles({ variant: "ghost" })}>
          Cancel
        </AppLink>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
