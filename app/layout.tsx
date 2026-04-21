import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyCards — Blooket-like Study Tool",
  description: "Upload questions and study them with instant feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
