import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MapaRespostas } from "@/components/MapaRespostas";
import { AREAS, BAIRROS, CITY, GESTAO, SERVICOS, contar, getRespostas, type Resposta } from "@/lib/survey";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Resultados — Observatório Cidadão" },
      { name: "description", content: "Painel público com a percepção dos participantes sobre a cidade." },
      { property: "og:title", content: "Resultados — Observatório Cidadão" },
      { property: "og:description", content: "Veja os principais problemas apontados por localidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Resultados,
});

function Bars({ data }: { data: { label: string; pct: number; count: number }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex justify-between text-sm"><span className="font-medium">{d.label}</span><span className="text-muted-foreground">{d.pct}% · {d.count}</span></div>
          <div className="mt-1 h-2.5 rounded-full bg-muted"><div className={`h-full rounded-full ${i === 0 ? "bg-accent" : "bg-primary"}`} style={{ width: `${d.pct}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

const DONUT_CORES: Record<string, string> = { "Sim": "var(--chart-1)", "Em parte": "var(--chart-3)", "Não": "var(--chart-2)", "Não sei avaliar": "var(--chart-5)", "Outro": "var(--chart-4)" };

function Donut({ data }: { data: { label: string; pct: number; count: number }[] }) {
  const total = data.reduce((a, b) => a + b.count, 0);
  const r = 40, c = 2 * Math.PI * r;
  let off = 0;
  const top = [...data].sort((a, b) => b.count - a.count)[0];
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 100 100" className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label={data.map((d) => `${d.label}: ${d.pct}%`).join(", ")}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="16" />
        {total > 0 && data.filter((d) => d.count).map((d) => {
          const len = (d.count / total) * c;
          const el = <circle key={d.label} cx="50" cy="50" r={r} fill="none" stroke={DONUT_CORES[d.label] ?? "var(--chart-5)"} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />;
          off += len;
          return el;
        })}
        <g className="rotate-90" style={{ transformOrigin: "50px 50px" }}>
          <text x="50" y="49" textAnchor="middle" className="fill-foreground font-bold" fontSize="16">{top?.pct ?? 0}%</text>
          <text x="50" y="62" textAnchor="middle" className="fill-muted-foreground" fontSize="8">{top?.label ?? "—"}</text>
        </g>
      </svg>
      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium"><span className="h-3 w-3 rounded-full" style={{ background: DONUT_CORES[d.label] ?? "var(--chart-5)" }} />{d.label}</span>
            <span className="text-muted-foreground">{d.pct}% · {d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Resultados() {
  const [all, setAll] = useState<Resposta[]>([]);
  const [bairro, setBairro] = useState("Todos");
  useEffect(() => setAll(getRespostas()), []);
  const list = useMemo(() => (bairro === "Todos" ? all : all.filter((r) => r.bairro === bairro)), [all, bairro]);
  const areas = contar(list, "area", AREAS).filter((a) => a.count);
  const gestao = contar(list, "gestao", GESTAO);
  const serv = contar(list, "servicos", SERVICOS);
  const pos = serv.filter((s) => ["Ótimos", "Bons"].includes(s.label)).reduce((a, b) => a + b.pct, 0);
  const neg = serv.filter((s) => ["Ruins", "Péssimos"].includes(s.label)).reduce((a, b) => a + b.pct, 0);
  const porBairro = contar(all, "bairro", BAIRROS);
  const recentes = list.filter((r) => r.melhoria).slice(-6).reverse();

  return (
    <div className="min-h-screen"><SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20">
        <span className="stamp">Painel público · {CITY}</span>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">O retrato da cidade, por quem mora nela.</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {["Todos", ...BAIRROS].map((b) => (
            <button key={b} onClick={() => setBairro(b)} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${bairro === b ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{b}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[["Participantes", list.length.toString()], ["Principal problema", areas[0]?.label ?? "—"], ["Avaliam serviços como bons", `${pos}%`], ["Avaliam como ruins", `${neg}%`]].map(([k, v]) => (
            <div key={k} className="rounded-[var(--radius)] border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">{k}</div>
              <div className="mt-1 font-display text-3xl font-bold">{v}</div>
            </div>
          ))}
        </div>
        <section className="mt-6 rounded-[var(--radius)] border border-border bg-card p-6">
          <h2 className="text-xl font-bold">Onde as pessoas estão respondendo</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Cada círculo mostra o total de uma localidade — nunca a casa de ninguém. Quanto maior e mais forte a cor, mais respostas. Toque para filtrar.</p>
          <MapaRespostas data={porBairro} selecionada={bairro} onSelect={setBairro} />
        </section>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-[var(--radius)] border border-border bg-card p-6"><h2 className="mb-5 text-xl font-bold">Áreas que mais precisam melhorar</h2><Bars data={areas} /></section>
          <section className="rounded-[var(--radius)] border border-border bg-card p-6"><h2 className="mb-5 text-xl font-bold">A gestão está resolvendo os problemas?</h2><Donut data={gestao} /></section>
          <section className="rounded-[var(--radius)] border border-border bg-card p-6"><h2 className="mb-5 text-xl font-bold">Participação por localidade</h2><Bars data={porBairro} /></section>
          <section className="rounded-[var(--radius)] border border-border bg-card p-6"><h2 className="mb-5 text-xl font-bold">O que as pessoas pedem</h2>
            <ul className="space-y-3">{recentes.map((r, i) => <li key={i} className="border-l-2 border-accent pl-3">{r.audios?.["melhoria"] ? <audio controls src={r.audios["melhoria"]} className="w-full" /> : <p>“{r.melhoria}”</p>}<p className="text-xs text-muted-foreground">{r.bairro} · {r.idade} anos</p></li>)}</ul>
          </section>
        </div>
        <p className="mt-10 max-w-3xl text-sm text-muted-foreground">
          <strong>Nota de método:</strong> {all.length} participações voluntárias recebidas por link e QR Code. Os números refletem a percepção de quem respondeu e não têm margem de erro de pesquisa probabilística.
        </p>
      </main>
    </div>
  );
}
