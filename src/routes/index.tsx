import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { CITY } from "@/lib/survey";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Observatório Cidadão — Sua voz sobre a cidade" },
      { name: "description", content: "Pesquisa rápida e anônima sobre os problemas e prioridades do seu município." },
      { property: "og:title", content: "Observatório Cidadão — Sua voz sobre a cidade" },
      { property: "og:description", content: "Responda em 2 minutos e veja o retrato da sua cidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="pt-10 md:pt-20">
          <span className="stamp">Independente · Anônimo · Sem partido</span>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">
            Se você pudesse melhorar <em className="text-accent">uma coisa</em> em {CITY} hoje, o que seria?
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Responda em cerca de 2 minutos. Sem nome, sem CPF, sem telefone. Depois, veja o que os seus vizinhos também disseram.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/pesquisa" className="rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition hover:opacity-90">Quero dar minha opinião</Link>
            <Link to="/resultados" className="rounded-full border border-border bg-card px-7 py-4 font-semibold">Ver resultados</Link>
          </div>
        </section>
        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            ["01", "Responda", "4 perguntas objetivas sobre saúde, serviços e prioridades da sua localidade."],
            ["02", "Some sua voz", "Cada resposta ajuda a montar um retrato real dos problemas de cada região."],
            ["03", "Acompanhe", "Os resultados ficam públicos, com número de participantes e limitações."],
          ].map(([n, t, d]) => (
            <div key={n} className="border-t-2 border-primary pt-5">
              <div className="font-display text-sm text-accent">{n}</div>
              <h3 className="mt-2 text-2xl font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>
        <p className="mt-20 text-sm text-muted-foreground">
          O Observatório Cidadão não pertence a nenhum político ou partido. Os resultados mostram a percepção de quem participou, não de toda a população.
        </p>
      </main>
    </div>
  );
}
