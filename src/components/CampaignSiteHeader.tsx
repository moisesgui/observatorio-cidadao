import { Link } from "@tanstack/react-router";

export function CampaignSiteHeader({ slug, title }: { slug: string; title: string }) {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
      <Link to="/c/$slug" params={{ slug }} className="font-display text-lg font-bold text-primary">
        Observatório<span className="text-accent">.</span>
        <span className="text-foreground">{title}</span>
      </Link>
      <nav className="flex gap-5 text-sm font-medium text-muted-foreground">
        <Link to="/c/$slug/pesquisa" params={{ slug }} activeProps={{ className: "text-foreground" }}>
          Responder
        </Link>
        <Link to="/c/$slug/resultados" params={{ slug }} activeProps={{ className: "text-foreground" }}>
          Resultados
        </Link>
      </nav>
    </header>
  );
}