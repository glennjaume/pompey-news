import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pompey News",
  description: "Portsmouth FC news aggregator - all the latest Pompey news in one place",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
