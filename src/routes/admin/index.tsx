import { createFileRoute, Link } from "@tanstack/react-router";
import { listCampaignsAdminFn } from "@/fns/campaigns";

export const Route = createFileRoute("/admin/")({
  loader: () => listCampaignsAdminFn(),
  component: AdminHome,
});

function AdminHome() {
  const campaigns = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Campanhas de escuta</h1>
          <p className="mt-2 text-muted-foreground">Cada campanha tem link e resultados isolados.</p>
        </div>
        <Link
          to="/admin/campaigns/new"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Nova campanha
        </Link>
      </div>
      <ul className="mt-10 space-y-4">
        {campaigns.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-card p-5">
            <div>
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p className="text-sm text-muted-foreground">/{c.slug}</p>
            </div>
            <Link
              to="/admin/campaigns/$campaignId"
              params={{ campaignId: c.id }}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
            >
              Abrir painel
            </Link>
          </li>
        ))}
        {campaigns.length === 0 && (
          <li className="rounded-[var(--radius)] border border-dashed border-border p-10 text-center text-muted-foreground">
            Nenhuma campanha ainda. Crie a primeira (ex.: Espacinha).
          </li>
        )}
      </ul>
    </main>
  );
}