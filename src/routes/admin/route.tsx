import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { getAdminSessionFn, logoutAdminFn } from "@/fns/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return { admin: null as null };
    const { user } = await getAdminSessionFn();
    if (!user) throw redirect({ to: "/admin/login" });
    return { admin: user };
  },
  component: AdminShell,
});

function AdminShell() {
  const { admin } = Route.useRouteContext();
  const router = useRouter();
  const onLogout = async () => {
    await logoutAdminFn();
    router.invalidate();
    router.navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {admin ? (
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link to="/admin" className="font-display font-bold text-primary">
              Painel · Observatório
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{admin.email}</span>
              <button type="button" onClick={onLogout} className="font-medium text-accent">
                Sair
              </button>
            </div>
          </div>
        </header>
      ) : null}
      <Outlet />
    </div>
  );
}