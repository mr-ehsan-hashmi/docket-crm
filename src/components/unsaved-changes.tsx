"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";

const LEAVE_MESSAGE = "You have unsaved changes. Leave without saving?";

// a ref rather than state: links only need the value at click time,
// so there's no reason to re-render them whenever a form becomes dirty
const UnsavedChangesContext = createContext<RefObject<boolean> | null>(null);

function useDirtyRef() {
  const dirtyRef = useContext(UnsavedChangesContext);
  if (!dirtyRef) throw new Error("UnsavedChangesProvider is missing");
  return dirtyRef;
}

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const dirtyRef = useRef(false);
  return <UnsavedChangesContext.Provider value={dirtyRef}>{children}</UnsavedChangesContext.Provider>;
}

export function useUnsavedChanges(dirty: boolean) {
  const dirtyRef = useDirtyRef();

  useEffect(() => {
    if (!dirty) return;

    dirtyRef.current = true;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);

    return () => {
      dirtyRef.current = false;
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, dirtyRef]);
}

export function AppLink(props: ComponentProps<typeof Link>) {
  const dirtyRef = useDirtyRef();

  return (
    <Link
      {...props}
      onNavigate={(event) => {
        if (dirtyRef.current && !window.confirm(LEAVE_MESSAGE)) event.preventDefault();
      }}
    />
  );
}
