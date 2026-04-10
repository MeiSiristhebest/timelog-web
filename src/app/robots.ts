import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/favicon.ico", "/manifest.webmanifest"],
        disallow: [
          "/",
          "/overview",
          "/stories",
          "/interactions",
          "/family",
          "/devices",
          "/audit",
          "/settings",
        ],
      },
    ],
  };
}
