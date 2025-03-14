import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react'
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ATRACaaS Platform",
  description: "Advanced Threat Response & Analysis Cloud as a Service - A comprehensive security platform offering real-time monitoring, threat detection, and automated response capabilities for digital infrastructure protection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Navigation />
          <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
