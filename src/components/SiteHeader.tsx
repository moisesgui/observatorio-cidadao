import { Link } from "@tanstack/react-router";
export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
      <Link to="/" className="font-display text-lg font-bold text-primary">Observatório<span className="text-accent">.</span>Cidadão</Link>
      <nav className="flex gap-5 text-sm font-medium text-muted-foreground">
        <Link to="/pesquisa" activeProps={{ className: "text-foreground" }}>Responder</Link>
        <Link to="/resultados" activeProps={{ className: "text-foreground" }}>Resultados</Link>
      </nav>
    </header>
  );
}
