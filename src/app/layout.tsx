import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plan zajęć — ZAK Gdańsk",
  description: "Plan zajęć Zakładu Administracji i Koordynacji w Gdańsku",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-white text-gray-900 min-h-screen font-sans">
        <div className="max-w-5xl mx-auto px-5 py-8">{children}</div>
      </body>
    </html>
  );
}
