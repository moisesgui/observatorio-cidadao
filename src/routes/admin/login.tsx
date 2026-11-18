import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginAdminFn, registerAdminFn } from "@/fns/auth";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const res = await loginAdminFn({ data: { email, password } });
      if (res instanceof Response) {
        const body = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          setError(body.error ?? "Falha no login.");
          return;
        }
      }
      nav({ to: "/admin" });
      return;
    }
    const res = await registerAdminFn({ data: { email, password, name: name || undefined } });
    if (res instanceof Response) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "Não foi possível criar a conta.");
      return;
    }
    if (!res.ok) {
      setError("Não foi possível criar a conta.");
      return;
    }
    await loginAdminFn({ data: { email, password } });
    nav({ to: "/admin" });
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5">
      <h1 className="text-3xl font-bold">Acesso administrativo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cadastre campanhas, localidades, links e QR codes.{" "}
        <Link to="/" className="text-primary underline">
          Voltar ao site
        </Link>
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Senha
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
          />
        </label>
        {mode === "bootstrap" && (
          <label className="block text-sm font-medium">
            Nome (opcional)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[var(--radius)] border border-input bg-card px-4 py-3"
            />
          </label>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground">
          {mode === "login" ? "Entrar" : "Criar primeiro administrador"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "bootstrap" : "login")}
        className="mt-4 text-center text-sm text-muted-foreground underline"
      >
        {mode === "login" ? "Primeiro acesso? Criar administrador inicial" : "Já tenho conta — entrar"}
      </button>
    </main>
  );
}