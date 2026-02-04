import { Suspense } from "react";
import { ReceivePanel } from "@/components/transfer/ReceivePanel";

function ReceivePanelFallback() {
  return <div>Loading...</div>;
}

export default function ReceivePage() {
  return (
    <Suspense fallback={<ReceivePanelFallback />}>
      <ReceivePanel />
    </Suspense>
  );
}

