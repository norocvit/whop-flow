"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // State pour stocker les tokens
  const [whopToken, setWhopToken] = useState(null);
  const [instaToken, setInstaToken] = useState(null);
  const [tiktokToken, setTiktokToken] = useState(null);
  const [error, setError] = useState("");

  const tiktokOAuthUrl = `https://open-api.tiktok.com/platform/oauth/connect/?client_key=${process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY}&response_type=code&scope=video.upload&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI)}`;

  // Fonction générique pour simuler la connexion
  const connectAccount = (platform) => {
    // Ici tu appelleras ton API réelle plus tard
    if (platform === "whop") setWhopToken("fake-whop-token");
    if (platform === "instagram") setInstaToken("fake-insta-token");
    if (platform === "tiktok") setTiktokToken("fake-tiktok-token");
  };

  // Vérification avant redirection
  const handleContinue = () => {
    if (!whopToken) {
      setError("Please connect your Whop account.");
      return;
    }
    if (!instaToken && !tiktokToken) {
      setError("Please connect at least one social account (Instagram or TikTok).");
      return;
    }

    // Tout est ok → rediriger vers la page principale du produit
    router.push("/");
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: "0 16px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>
        Connect Your Accounts
      </h1>
      <p style={{ fontSize: "1rem", marginBottom: "24px" }}>
        Please connect your Whop account and at least one social account
        (Instagram or TikTok) to continue.
      </p>

      {/* Boutons de connexion */}
      <div style={{ margin: "12px 0" }}>
        <button
          onClick={() => connectAccount("whop")}
          style={{
            width : '300px', 
            backgroundColor: "#d95c02ff", // orange foncé
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {whopToken ? "Whop Connected ✅" : "Connect Whop"}
        </button>
      </div>

      <div style={{ margin: "12px 0" }}>
        <button
          onClick={() => connectAccount("instagram")}
          style={{
            width : '300px',
            backgroundColor: "#e14254ff", // rouge/rosé/orangé
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {instaToken ? "Instagram Connected ✅" : "Connect Instagram"}
        </button>
      </div>

      <div style={{ margin: "12px 0" }}>
        <button
          onClick={() => window.location.href = tiktokOAuthUrl}
          style={{
            width : '300px',
            backgroundColor: "#242424ff", // noir
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {tiktokToken ? "TikTok Connected ✅" : "Connect TikTok"}
        </button>   
      </div>

      {/* Message d'erreur */}
      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {/* Bouton continuer */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={handleContinue}
          style={{
            width : '150px',
            backgroundColor: "#1E90FF",
            color: "white",
            padding: "8px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
