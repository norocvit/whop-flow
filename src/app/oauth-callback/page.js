"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;

    const platform = searchParams.get("platform");
    const token = searchParams.get("token");

    if (platform && token) {
      // Stockage local du token pour test
      localStorage.setItem(`${platform}_token`, token);
      alert(`${platform} connected! Token saved locally.`);

      // Redirection vers la page principale
      router.push("/");
    } else {
      alert("OAuth failed or missing parameters.");
    }
  }, [searchParams, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Connecting...</h2>
      <p>Please wait, you are being redirected...</p>
    </div>
  );
}
