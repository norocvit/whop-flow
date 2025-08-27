import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "16px 24px",
        fontSize: 14,
        color: "#6b7280",
      }}
    >
      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span>© {year} WhopFlow</span>

        <nav style={{ display: "flex", gap: 16 }}>
          <Link href="/terms" style={{ textDecoration: "none", color: "inherit" }}>
            Terms of Service
          </Link>
          <Link href="/privacy" style={{ textDecoration: "none", color: "inherit" }}>
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
