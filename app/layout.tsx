import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/components/providers/session-provider";
import { env } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = env.NEXT_PUBLIC_APP_NAME;
const baseUrl = env.NEXT_PUBLIC_BASE_URL;
const appDomain = env.NEXT_PUBLIC_APP_DOMAIN;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${appName} - Q&A Platform`,
    template: `%s | ${appName}`,
  },
  description:
    "Join our community of learners and experts. Ask questions about programming, design, business, and more. Get help from people who've been there.",
  keywords: [
    "Q&A",
    "questions",
    "answers",
    "programming",
    "design",
    "business",
    "learning",
    "community",
    "help",
    "expert advice",
    "knowledge sharing",
  ],
  authors: [{ name: `${appName} Team` }],
  creator: appName,
  publisher: appName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: `${appName} - Q&A Platform`,
    description:
      "Join our community of learners and experts. Ask questions about programming, design, business, and more. Get help from people who've been there.",
    siteName: appName,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${appName} - Q&A Platform`,
      },
      {
        url: "/og-image-square.png",
        width: 1200,
        height: 1200,
        alt: `${appName} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Q&A Platform`,
    description:
      "Join our community of learners and experts. Ask questions about programming, design, business, and more.",
    site: `@${appDomain.replace(".", "")}`,
    creator: `@${appDomain.replace(".", "")}`,
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-site-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
