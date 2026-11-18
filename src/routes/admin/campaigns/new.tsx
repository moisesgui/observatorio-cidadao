import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createCampaignFn } from "@/fns/campaigns";

export const Route = createFileRoute("/admin/campaigns/new")({
  component: NewCampaign,
});

function NewCampaign() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [localityLabel, setLocalityLabel] = useState("localidade");
  const [localitiesText, setLocalitiesText] = useState("");
  const [mapCenterLat, setMapCenterLat] = useState("");
  const [mapCenterLng, setMapCenterLng] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const names = localitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!title.trim() || names.length === 0) {
      setError("Informe o título e ao menos uma localidade (uma por linha).");
      return;
    }
    setLoading(true);
    try {
      const row = await createCampaignFn({
        data: {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          localityLabel: localityLabel.trim() || "localidade",
          localityNames: names,
          mapCenterLat: mapCenterLat ? Number(mapCenterLat) : null,
          mapCenterLng: mapCenterLng ? Number(mapCenterLng) : null,
        },
      });
      nav({ to: "/admin/campaigns/$campaignId", params: { campaignId: row.id } });
    } catch {
      setError("Não foi possível salvar. Confira a conexão com o banco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="text-3xl font-bold">Nova campanha</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium">
          Nome do lugar (ex.: Espacinha, Fortaleza — Zona Norte)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Subtítulo (opcional)
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Como chamar bairros/distritos na pergunta?
          <input
            value={localityLabel}
            onChange={(e) => setLocalityLabel(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Localidades (uma por linha)
          <textarea
            value={localitiesText}
            onChange={(e) => setLocalitiesText(e.target.value)}
            rows={10}
            placeholder="Pereiros&#10;Peixe&#10;..."
            className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3 font-mono text-sm"
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Centro do mapa (lat)
            <input
              value={mapCenterLat}
              onChange={(e) => setMapCenterLat(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
            />
          </label>
          <label className="block text-sm font-medium">
            Centro do mapa (lng)
            <input
              value={mapCenterLng}
              onChange={(e) => setMapCenterLng(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
            />
          </label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Salvando…" : "Criar campanha"}
        </button>
      </form>
    </main>
  );
}