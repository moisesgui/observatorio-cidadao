import { useEffect, useRef, useState } from "react";
import { CENTRO, COORDS } from "@/lib/localidades";

type Item = { label: string; count: number };
declare global { interface Window { __initMapaOC?: () => void; google?: any } }

let loader: Promise<void> | null = null;
function loadMaps() {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const env = import.meta.env as Record<string, string | undefined>;
    window.__initMapaOC = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"]}&loading=async&callback=__initMapaOC&language=pt-BR&region=BR&channel=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"]}`;
    s.async = true; s.onerror = () => reject(new Error("maps"));
    document.head.appendChild(s);
  });
  return loader;
}

export function MapaRespostas({ data, selecionada, onSelect }: { data: Item[]; selecionada: string; onSelect: (b: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const shapes = useRef<any[]>([]);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    loadMaps().then(() => {
      if (!el.current) return;
      const g = window.google.maps;
      map.current = new g.Map(el.current, { center: CENTRO, zoom: 12, mapTypeId: "hybrid", clickableIcons: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: true });
      setOk(true);
    }).catch(() => setOk(false));
  }, []);

  useEffect(() => {
    if (!ok || !map.current) return;
    const g = window.google.maps;
    shapes.current.forEach((s) => s.setMap(null)); shapes.current = [];
    const max = Math.max(1, ...data.map((d) => d.count));
    data.forEach((d) => {
      const c = COORDS[d.label]; if (!c || !d.count) return;
      const t = d.count / max;
      const ativo = selecionada === d.label;
      const color = t > 0.66 ? "#d9480f" : t > 0.33 ? "#f08c00" : "#fcc419";
      const circle = new g.Circle({ map: map.current, center: c, radius: 250 + 900 * Math.sqrt(t), fillColor: color, fillOpacity: ativo ? 0.75 : 0.5, strokeColor: ativo ? "#ffffff" : color, strokeWeight: ativo ? 3 : 1 });
      const label = new g.Marker({ map: map.current, position: c, icon: { path: g.SymbolPath.CIRCLE, scale: 0 }, label: { text: `${d.label} · ${d.count}`, color: "#ffffff", fontSize: "12px", fontWeight: "700" }, title: `${d.label}: ${d.count} respostas` });
      const pick = () => onSelect(ativo ? "Todos" : d.label);
      circle.addListener("click", pick); label.addListener("click", pick);
      shapes.current.push(circle, label);
    });
  }, [ok, data, selecionada, onSelect]);

  return (
    <div className="relative h-[380px] overflow-hidden rounded-[var(--radius)] border border-border bg-muted md:h-[460px]">
      <div ref={el} className="h-full w-full" />
      {ok !== true && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground">{ok === false ? "Não foi possível carregar o mapa agora." : "Carregando mapa…"}</div>}
    </div>
  );
}
