export const metadata = {
  title: "Privacy Policy - WhopFlow",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Privacy Policy</h1>

      <p>
        At AutoFlow, your privacy is important to us. This Privacy Policy explains what information we collect, how it is used, and your rights regarding your data.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginTop: "30px", marginBottom: "10px" }}>1. Information We Collect</h2>
      <p>
        We collect the following information from users:
      </p>
      <ul>
        <li>-Email address provided during account creation</li>
        <li>-Username used on AutoFlow</li>
        <li>-API tokens for Instagram, TikTok, and Whop to enable posting and submission</li>
      </ul>

      <h2 style={{ fontSize: "1.5rem", marginTop: "30px", marginBottom: "10px" }}>2. How We Use Your Information</h2>
      <p>
        The information collected is used solely to provide and improve our services, specifically:
      </p>
      <ul>
        <li>Posting and scheduling content on Instagram and TikTok</li>
        <li>Submitting content to Whop</li>
      </ul>
      <p>
        Some information may be shared with third-party platforms (Instagram, TikTok, Whop) strictly for the purpose of posting content.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginTop: "30px", marginBottom: "10px" }}>3. Data Security</h2>
      <p>
        We take reasonable measures to protect your data, including secure storage of API tokens and limiting access only to necessary processes.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginTop: "30px", marginBottom: "10px" }}>4. Your Rights</h2>
      <p>
        You have the right to delete your AutoFlow account at any time. Deleting your account will remove your personal data from our system.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginTop: "30px", marginBottom: "10px" }}>5. Cookies and Tracking</h2>
      <p>
        We do not use cookies or tracking tools at this time.
      </p>

      <h2 style={{ fontSize: "1.5rem", marginTop: "30px", marginBottom: "10px" }}>6. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:norocvit2@gmail.com">norocvit2@gmail.com</a>.
      </p>
    </div>
  );
}

