import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plan zajęć — Żak LO Gdańsk",
  description: "Plan zajęć w Żaku LO Gdańsk.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="438cab07-bab3-4486-9f37-d9d00b6237f7" />
      </head>
      <body className="bg-white text-gray-900 min-h-screen font-sans">
        <NuqsAdapter>
          <div className="max-w-5xl mx-auto px-5 py-8">{children}</div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
