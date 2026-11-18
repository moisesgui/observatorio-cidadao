import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Observatório Cidadão" },
      { name: "description", content: "Plataforma de escuta anônima por campanha — cada lugar com seu link e resultados." },
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
            Sua voz sobre o lugar onde você mora — <em className="text-accent">campanha a campanha</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Cada consulta pública tem link e QR próprios. Quem responde vê só aquela escuta; os resultados não se misturam
            entre cidades.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/c/$slug"
              params={{ slug: "espacinha" }}
              className="rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Exemplo: Espacinha
            </Link>
            <Link to="/admin/login" className="rounded-full border border-border bg-card px-7 py-4 font-semibold">
              Área administrativa
            </Link>
          </div>
        </section>
        <p className="mt-20 text-sm text-muted-foreground">
          O Observatório Cidadão não pertence a nenhum político ou partido.
        </p>
      </main>
    </div>
  );
}