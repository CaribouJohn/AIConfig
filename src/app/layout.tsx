import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Config Manager",
  description: "Manage Claude Code settings across Global, User, and Project scopes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
