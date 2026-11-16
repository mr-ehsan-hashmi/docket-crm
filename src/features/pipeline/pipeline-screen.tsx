"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRegion } from "@/components/ui/skeleton";
import { ErrorState, StateMessage } from "@/components/ui/state-message";
import { useToast } from "@/components/toast";
import { groupByStatus } from "@/lib/contacts/filter";
import { STATUS_LABELS } from "@/lib/contacts/labels";
import { useChangeStatus, useContacts } from "@/lib/contacts/queries";
import { CONTACT_STATUSES, type Contact, type ContactStatus } from "@/lib/contacts/types";
import { PipelineCardPreview } from "./pipeline-card";
import { PipelineColumn, PipelineColumnSkeleton } from "./pipeline-column";

const BOARD_LAYOUT = "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:items-start md:gap-4 md:overflow-visible md:px-0";
const SKELETON_CARDS: Record<ContactStatus, number> = { lead: 3, active: 4, closed: 2 };

function isContactStatus(value: unknown): value is ContactStatus {
  return (CONTACT_STATUSES as readonly unknown[]).includes(value);
}

export function PipelineHeader() {
  return (
    <PageHeader
      title="Pipeline"
      description={
        <>
          Where every enquiry stands. <span className="hidden md:inline">Drag a card, or use</span>
          <span className="md:hidden">Use</span> &ldquo;Move to&rdquo; to change its status.
        </>
      }
    />
  );
}

export function PipelineSkeleton() {
  return (
    <div className={BOARD_LAYOUT}>
      {CONTACT_STATUSES.map((status) => (
        <PipelineColumnSkeleton key={status} status={status} cards={SKELETON_CARDS[status]} />
      ))}
    </div>
  );
}

export function PipelineScreen() {
  const contactsQuery = useContacts();
  const changeStatus = useChangeStatus();
  const { showToast } = useToast();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }));

  const contacts = contactsQuery.data;
  const columns = useMemo(() => groupByStatus(contacts ?? []), [contacts]);
  const draggedContact = contacts?.find((contact) => contact.id === draggedId) ?? null;

  function moveContact(contact: Contact, status: ContactStatus) {
    if (contact.status === status) return;
    changeStatus.mutate(
      { id: contact.id, status },
      {
        onSuccess: () => showToast(`${contact.fullName} moved to ${STATUS_LABELS[status]}.`),
        onError: () =>
          showToast(
            `Couldn't move ${contact.fullName}, so they're back in ${STATUS_LABELS[contact.status]}.`,
            "error",
          ),
      },
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggedId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggedId(null);
    const contact = contacts?.find((candidate) => candidate.id === event.active.id);
    const target = event.over?.id;
    if (contact && isContactStatus(target)) moveContact(contact, target);
  }

  function renderBody() {
    if (contactsQuery.isPending) {
      return (
        <LoadingRegion label="Loading pipeline">
          <PipelineSkeleton />
        </LoadingRegion>
      );
    }

    if (contactsQuery.isError) {
      return (
        <ErrorState
          title="We couldn't load the pipeline"
          error={contactsQuery.error}
          onRetry={() => void contactsQuery.refetch()}
          isRetrying={contactsQuery.isFetching}
        />
      );
    }

    if (contactsQuery.data.length === 0) {
      return (
        <StateMessage
          title="The pipeline is empty"
          description="Contacts show up here as soon as they're added, starting in whichever status you give them."
          actions={
            <Link href="/contacts/new" className={buttonStyles({ variant: "primary" })}>
              Add a contact
            </Link>
          }
        />
      );
    }

    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedId(null)}
      >
        <div className={BOARD_LAYOUT}>
          {CONTACT_STATUSES.map((status) => (
            <PipelineColumn key={status} status={status} contacts={columns[status]} onMove={moveContact} />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {draggedContact ? <PipelineCardPreview contact={draggedContact} /> : null}
        </DragOverlay>
      </DndContext>
    );
  }

  return (
    <>
      <PipelineHeader />
      {renderBody()}
    </>
  );
}
