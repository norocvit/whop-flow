import fetch from "node-fetch";

export async function GET(req) {
  try {
    // Récupérer le code temporaire dans l'URL
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return new Response("No code provided", { status: 400 });
    }

    // Tes identifiants TikTok (à mettre dans .env.local)
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    // On échange le code temporaire contre un access token
    const tokenResponse = await fetch(
      `https://open-api.tiktok.com/oauth/access_token/?client_key=${clientKey}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code`,
      { method: "POST" }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.data) {
      // Ici tu peux stocker tokenData.data.access_token et refresh_token dans ta DB
      console.log("TikTok token:", tokenData.data.access_token);

      // Rediriger vers la page principale de ton site
      return Response.redirect("https://whop-flow-taupe.vercel.app/", 302);
    } else {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return new Response("Error during TikTok OAuth", { status: 500 });
  }
}
