import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "AutoFlow",
  description: "Social posting MVP",
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Contenu principal de chaque page */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer global */}
          <footer className="bg-gray-100 text-center p-4 text-sm text-gray-600">
            <a href="/terms" className="mx-2 hover:underline">Terms of Service</a>
            |
            <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
