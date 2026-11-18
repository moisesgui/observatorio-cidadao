import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampanhaPesquisa } from "@/components/CampanhaPesquisa";
import { fetchCampaignPublicFn } from "@/fns/campaigns";

export const Route = createFileRoute("/c/$slug/pesquisa")({
  loader: ({ params }) => fetchCampaignPublicFn({ data: { slug: params.slug } }),
  component: Page,
});

function Page() {
  const campaign = Route.useLoaderData();
  if (!campaign) throw notFound();
  return <CampanhaPesquisa campaign={campaign} />;
}