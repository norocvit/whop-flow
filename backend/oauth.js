// Exemple Express pour simuler OAuth
import express from "express";
const router = express.Router();

// Simule Instagram OAuth
router.get("/auth/instagram", (req, res) => {
  // Token fictif
  const token = "INSTAGRAM_FAKE_TOKEN";
  // Redirige vers le frontend avec le token
  res.redirect(`http://localhost:3000/oauth-callback?platform=instagram&token=${token}`);
});

// Simule TikTok OAuth
router.get("/auth/tiktok", (req, res) => {
  const token = "TIKTOK_FAKE_TOKEN";
  res.redirect(`http://localhost:3000/oauth-callback?platform=tiktok&token=${token}`);
});

// Simule Whop OAuth
router.get("/auth/whop", (req, res) => {
  const token = "WHOP_FAKE_TOKEN";
  res.redirect(`http://localhost:3000/oauth-callback?platform=whop&token=${token}`);
});

export default router;
