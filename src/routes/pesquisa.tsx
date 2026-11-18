import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/pesquisa")({
  beforeLoad: () => {
    throw redirect({ to: "/c/$slug/pesquisa", params: { slug: "espacinha" } });
  },
});