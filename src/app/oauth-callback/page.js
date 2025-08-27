"use client"; // indique que c'est un client component
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false); // pour ne rien afficher tant que useEffect n'a pas tourné

  useEffect(() => {
    const platform = searchParams.get("platform");
    const token = searchParams.get("token");

    if (platform && token) {
      localStorage.setItem(`${platform}_token`, token);
      alert(`${platform} connected! Token saved locally.`);
      router.push("/");
    }
    setReady(true); // rendu maintenant safe côté client
  }, [searchParams, router]);

  if (!ready) return <div style={{ textAlign: "center", marginTop: "50px" }}><h2>Connecting...</h2><p>Please wait, you are being redirected...</p></div>;

  return null; // rien d'autre à afficher
}
