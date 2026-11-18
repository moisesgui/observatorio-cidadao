import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CampaignSiteHeader } from "@/components/CampaignSiteHeader";
import { fetchCampaignPublicFn } from "@/fns/campaigns";

export const Route = createFileRoute("/c/$slug/")({
  loader: ({ params }) => fetchCampaignPublicFn({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Observatório — ${loaderData.title}` : "Campanha" },
      { name: "description", content: "Pesquisa rápida e anônima sobre prioridades da sua localidade." },
    ],
  }),
  component: CampanhaHome,
});

function CampanhaHome() {
  const campaign = Route.useLoaderData();
  if (!campaign) throw notFound();

  return (
    <div className="min-h-screen">
      <CampaignSiteHeader slug={campaign.slug} title={campaign.title} />
      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="pt-10 md:pt-20">
          <span className="stamp">Independente · Anônimo · Sem partido</span>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">
            Se você pudesse melhorar <em className="text-accent">uma coisa</em> em {campaign.title} hoje, o que seria?
          </h1>
          {campaign.subtitle && <p className="mt-4 text-lg text-muted-foreground">{campaign.subtitle}</p>}
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Responda em cerca de 2 minutos. Sem nome, sem CPF, sem telefone. Depois, veja o que outras pessoas também
            disseram — só nesta campanha.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/c/$slug/pesquisa"
              params={{ slug: campaign.slug }}
              className="rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Quero dar minha opinião
            </Link>
            <Link
              to="/c/$slug/resultados"
              params={{ slug: campaign.slug }}
              className="rounded-full border border-border bg-card px-7 py-4 font-semibold"
            >
              Ver resultados
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}