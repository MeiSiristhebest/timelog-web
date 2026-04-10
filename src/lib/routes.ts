import type { Route } from "next";

export const routes = {
  home: "/" as Route,
  login: "/login" as Route,
  register: "/register" as Route,
  overview: "/overview" as Route,
  stories: "/stories" as Route,
  interactions: "/interactions" as Route,
  family: "/family" as Route,
  devices: "/devices" as Route,
  audit: "/audit" as Route,
  settings: "/settings" as Route,
} as const;

export function storyRoute(id: string): Route {
  return `/stories/${id}` as Route;
}
