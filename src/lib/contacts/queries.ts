"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addNote,
  changeContactStatus,
  createContact,
  getContactDetail,
  listContacts,
  updateContact,
} from "@/lib/api/contacts";
import { isNotFound } from "@/lib/api/errors";
import type { ContactFormValues } from "./schema";
import type { Contact, ContactDetail, ContactStatus } from "./types";

export const contactKeys = {
  all: ["contacts"] as const,
  list: () => [...contactKeys.all, "list"] as const,
  detail: (id: string) => [...contactKeys.all, "detail", id] as const,
};

export function useContacts() {
  return useQuery({ queryKey: contactKeys.list(), queryFn: listContacts });
}

export function useContactDetail(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => getContactDetail(id),
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 1,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ContactFormValues) => createContact(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ContactFormValues) => updateContact(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

export function useAddNote(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addNote(contactId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

interface StatusChange {
  id: string;
  status: ContactStatus;
}

interface StatusChangeSnapshot {
  list: Contact[] | undefined;
  detail: ContactDetail | undefined;
}

export function useChangeStatus() {
  const queryClient = useQueryClient();

  return useMutation<Contact, unknown, StatusChange, StatusChangeSnapshot>({
    mutationFn: ({ id, status }) => changeContactStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.all });

      const snapshot: StatusChangeSnapshot = {
        list: queryClient.getQueryData<Contact[]>(contactKeys.list()),
        detail: queryClient.getQueryData<ContactDetail>(contactKeys.detail(id)),
      };
      const now = new Date().toISOString();

      queryClient.setQueryData<Contact[]>(contactKeys.list(), (contacts) =>
        contacts?.map((contact) => (contact.id === id ? { ...contact, status, updatedAt: now } : contact)),
      );
      queryClient.setQueryData<ContactDetail>(contactKeys.detail(id), (detail) =>
        detail ? { ...detail, contact: { ...detail.contact, status, updatedAt: now } } : detail,
      );
      return snapshot;
    },

    onError: (_error, { id }, snapshot) => {
      if (!snapshot) return;
      queryClient.setQueryData(contactKeys.list(), snapshot.list);
      queryClient.setQueryData(contactKeys.detail(id), snapshot.detail);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}
