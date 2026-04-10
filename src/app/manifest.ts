import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TimeLog Family Web",
    short_name: "TimeLog Family",
    description:
      "Protected family listening and archive management for TimeLog stories.",
    start_url: routes.overview,
    display: "standalone",
    background_color: "#11100d",
    theme_color: "#11100d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
