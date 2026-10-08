import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toast";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "StudyFlow — Your study companion",
    template: "%s · StudyFlow",
  },
  description:
    "StudyFlow keeps your whole study life in one place: tasks, timetable, assignments, exams, notes, flashcards, practice tests, grades, analytics, files, calculator, math solver, AI assistant and focus timer.",
  applicationName: "StudyFlow",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
