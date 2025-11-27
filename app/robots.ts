import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;

  return {
    rules: [
      // Cloudflare Managed Content Signals
      {
        userAgent: "*",
        allow: ["/", "/questions", "/questions/*"],
        disallow: [
          "/api/*",
          "/admin/*",
          "/dashboard/*",
          "/private/*",
          "/*?*", // avoid crawling query-based duplicates
        ],
        crawlDelay: 2, // prevent aggressive crawling
      },

      // AI Crawler Restrictions
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "CCBot",
          "ClaudeBot",
          "anthropic-ai",
          "Claude-Web",
          "meta-externalagent",
          "Amazonbot",
          "Applebot-Extended",
          "Bytespider",
        ],
        disallow: ["/"],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
