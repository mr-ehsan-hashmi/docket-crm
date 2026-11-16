import type { Metadata } from "next";
import { Suspense } from "react";
import { PipelineHeader, PipelineScreen, PipelineSkeleton } from "@/features/pipeline/pipeline-screen";

export const metadata: Metadata = { title: "Pipeline" };

export default function PipelinePage() {
  return (
    <Suspense
      fallback={
        <>
          <PipelineHeader />
          <PipelineSkeleton />
        </>
      }
    >
      <PipelineScreen />
    </Suspense>
  );
}
