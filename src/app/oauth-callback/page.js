import React, { Suspense } from "react";
import ClientOAuthCallback from "./ClientOAuthCallback";

export default function Page() {
  return (
    <Suspense fallback={<div>Connecting…</div>}>
      <ClientOAuthCallback />
    </Suspense>
  );
}
