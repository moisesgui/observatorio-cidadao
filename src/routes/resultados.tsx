import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/resultados")({
  beforeLoad: () => {
    throw redirect({ to: "/c/$slug/resultados", params: { slug: "espacinha" } });
  },
});