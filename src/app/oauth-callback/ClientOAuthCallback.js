"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ClientOAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;
    const platform = searchParams.get("platform");
    const token = searchParams.get("token");
    if (platform && token) {
      localStorage.setItem(`${platform}_token`, token);
      router.push("/");
    }
  }, [searchParams, router]);

  return <div>Connecting...</div>;
}
