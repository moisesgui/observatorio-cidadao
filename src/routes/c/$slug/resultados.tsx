import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampanhaResultados } from "@/components/CampanhaResultados";
import { fetchCampaignResponsesFn } from "@/fns/campaigns";

export const Route = createFileRoute("/c/$slug/resultados")({
  loader: ({ params }) => fetchCampaignResponsesFn({ data: { slug: params.slug } }),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  if (!data.campaign) throw notFound();
  return <CampanhaResultados campaign={data.campaign} responses={data.responses} />;
}