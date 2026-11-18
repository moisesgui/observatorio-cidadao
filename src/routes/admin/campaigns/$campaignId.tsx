import { createFileRoute, Link } from "@tanstack/react-router";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { getCampaignAdminFn, updateCampaignFn } from "@/fns/campaigns";

export const Route = createFileRoute("/admin/campaigns/$campaignId")({
  loader: ({ params }) => getCampaignAdminFn({ data: { id: params.campaignId } }),
  component: CampaignAdmin,
});

function CampaignAdmin() {
  const initial = Route.useLoaderData();
  const [data, setData] = useState(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [localityLabel, setLocalityLabel] = useState(initial?.localityLabel ?? "localidade");
  const [localitiesText, setLocalitiesText] = useState(initial?.localities.map((l) => l.name).join("\n") ?? "");
  const [qr, setQr] = useState("");
  const [saved, setSaved] = useState(false);

  const publicUrl = useMemo(() => {
    if (!data?.slug) return "";
    if (typeof window !== "undefined") return `${window.location.origin}/c/${data.slug}`;
    return `/c/${data.slug}`;
  }, [data?.slug]);

  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { margin: 2, width: 260 }).then(setQr).catch(() => setQr(""));
  }, [publicUrl]);

  if (!data) {
    return <main className="px-5 py-10">Campanha não encontrada.</main>;
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = localitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = await updateCampaignFn({
      data: {
        id: data.id,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        localityLabel: localityLabel.trim(),
        localityNames: names,
        mapCenterLat: data.mapCenterLat,
        mapCenterLng: data.mapCenterLng,
        localityCoords: Object.fromEntries(
          data.localities
            .filter((l) => l.lat != null && l.lng != null)
            .map((l) => [l.name, { lat: l.lat!, lng: l.lng! }]),
        ),
      },
    });
    const refreshed = await getCampaignAdminFn({ data: { id: data.id } });
    if (refreshed) setData(refreshed);
    else setData({ ...data, ...updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/admin" className="text-sm text-muted-foreground underline">
        ← Campanhas
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{data.title}</h1>
      <p className="text-sm text-muted-foreground">slug: {data.slug}</p>

      <section className="mt-8 rounded-[var(--radius)] border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Link e QR Code</h2>
        <p className="mt-2 break-all font-mono text-sm">{publicUrl}</p>
        <div className="mt-4 flex flex-wrap gap-6">
          {qr && <img src={qr} alt="QR Code da campanha" className="rounded-lg border border-border" />}
          <CampaignLinks slug={data.slug} />
        </div>
      </section>

      <form onSubmit={save} className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">Editar campanha</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtítulo"
          className="w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
        />
        <input
          value={localityLabel}
          onChange={(e) => setLocalityLabel(e.target.value)}
          className="w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
        />
        <textarea
          value={localitiesText}
          onChange={(e) => setLocalitiesText(e.target.value)}
          rows={8}
          className="w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3 font-mono text-sm"
        />
        <button type="submit" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Salvar alterações
        </button>
        {saved && <span className="text-sm text-accent">Salvo.</span>}
      </form>
    </main>
  );
}

function CampaignLinks({ slug }: { slug: string }) {
  return (
    <ul className="space-y-2 text-sm">
      <li>
        <Link to="/c/$slug" params={{ slug }} className="text-primary underline" target="_blank">
          Página inicial
        </Link>
      </li>
      <li>
        <Link to="/c/$slug/pesquisa" params={{ slug }} className="text-primary underline" target="_blank">
          Pesquisa
        </Link>
      </li>
      <li>
        <Link to="/c/$slug/resultados" params={{ slug }} className="text-primary underline" target="_blank">
          Resultados
        </Link>
      </li>
    </ul>
  );
}