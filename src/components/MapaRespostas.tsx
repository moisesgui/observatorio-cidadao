import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

type Item = { label: string; count: number };

type CoordMap = Record<string, { lat: number; lng: number }>;

// Mapa gratuito (OpenStreetMap). Um círculo por localidade, nunca por pessoa.
export function MapaRespostas({
  data,
  selecionada,
  onSelect,
  coords,
  center,
}: {
  data: Item[];
  selecionada: string;
  onSelect: (b: string) => void;
  coords: CoordMap;
  center: { lat: number; lng: number };
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const layer = useRef<any>(null);
  const L = useRef<any>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancel = false;
    import("leaflet")
      .then((mod) => {
        if (cancel || !el.current) return;
        const Lf = (mod as any).default ?? mod;
        L.current = Lf;
        map.current = Lf.map(el.current, {
          center: [center.lat, center.lng],
          zoom: 12,
          scrollWheelZoom: false,
        });
        Lf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map.current);
        layer.current = Lf.layerGroup().addTo(map.current);
        setOk(true);
      })
      .catch(() => setOk(false));
    return () => {
      cancel = true;
      map.current?.remove();
      map.current = null;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const Lf = L.current;
    if (!ok || !Lf || !layer.current) return;
    layer.current.clearLayers();
    const max = Math.max(1, ...data.map((d) => d.count));
    data.forEach((d) => {
      const c = coords[d.label];
      if (!c || !d.count) return;
      const t = d.count / max;
      const ativo = selecionada === d.label;
      const color = t > 0.66 ? "#d9480f" : t > 0.33 ? "#f08c00" : "#fcc419";
      const pick = () => onSelect(ativo ? "Todos" : d.label);
      Lf.circle([c.lat, c.lng], {
        radius: 250 + 900 * Math.sqrt(t),
        color: ativo ? "#1f2937" : color,
        weight: ativo ? 3 : 1,
        fillColor: color,
        fillOpacity: ativo ? 0.75 : 0.5,
      })
        .on("click", pick)
        .addTo(layer.current);
      Lf.marker([c.lat, c.lng], {
        icon: Lf.divIcon({
          className: "",
          html: `<div style="transform:translate(-50%,-50%);white-space:nowrap;font:700 12px 'Atkinson Hyperlegible',sans-serif;background:rgba(255,255,255,.9);color:#1f2937;padding:2px 6px;border-radius:6px;display:inline-block">${d.label} · ${d.count}</div>`,
          iconSize: [0, 0],
        }),
        title: `${d.label}: ${d.count} respostas`,
      })
        .on("click", pick)
        .addTo(layer.current);
    });
  }, [ok, data, selecionada, onSelect, coords]);

  const hasCoords = Object.keys(coords).length > 0;

  if (!hasCoords) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted p-8 text-center text-sm text-muted-foreground">
        Mapa disponível quando as localidades tiverem coordenadas cadastradas no painel administrativo.
      </div>
    );
  }

  return (
    <div className="relative z-0 h-[380px] overflow-hidden rounded-[var(--radius)] border border-border bg-muted md:h-[460px]">
      <div ref={el} className="h-full w-full" />
      {ok !== true && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground">
          {ok === false ? "Não foi possível carregar o mapa agora." : "Carregando mapa…"}
        </div>
      )}
    </div>
  );
}