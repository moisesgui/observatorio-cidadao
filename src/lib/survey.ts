export const CITY = "Espacinha";
export const BAIRROS = ["Pereiros", "Peixe", "Mata Fresca", "Pitombeiras", "Retiro", "Espacinha de Baixo", "Patos", "Canafístula", "Extremas", "Assentamento Santana", "Outro"];
export const AREAS = ["Saúde", "Educação", "Segurança", "Infraestrutura e estradas", "Limpeza pública", "Emprego e renda", "Esporte e lazer", "Outra"];
export const SERVICOS = ["Ótimos", "Bons", "Regulares", "Ruins", "Péssimos", "Não sei avaliar", "Outro"];
export const GESTAO = ["Sim", "Em parte", "Não", "Não sei avaliar", "Outro"];
export const IDADES = ["16–24", "25–34", "35–49", "50–64", "65+", "Outro"];

export type Resposta = { bairro: string; idade: string; area: string; servicos: string; gestao: string; melhoria: string; data: string; outros?: Record<string, string>; audios?: Record<string, string> | undefined };

const KEY = "oc-respostas-v2";
const DONE = "oc-respondeu";

function seed(): Resposta[] {
  const melhorias = ["Mais médicos no posto", "Asfaltar as ruas da localidade", "Iluminação na praça", "Remédios na farmácia básica", "Coleta de lixo mais frequente", "Creche em tempo integral", "Policiamento à noite", "Cursos para jovens"];
  let s = 7;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pick = <T,>(a: T[], w?: number[]): T => {
    if (!w) return a[Math.floor(r() * a.length)]!;
    const t = w.reduce((x, y) => x + y, 0); let v = r() * t;
    for (let i = 0; i < a.length; i++) { v -= w[i]!; if (v <= 0) return a[i]!; }
    return a[0]!;
  };
  return Array.from({ length: 214 }, () => ({
    bairro: pick(BAIRROS, [14, 10, 9, 8, 7, 22, 8, 9, 6, 7, 3]),
    idade: pick(IDADES, [20, 25, 28, 18, 9]),
    area: pick(AREAS, [34, 14, 16, 18, 7, 8, 2, 1]),
    servicos: pick(SERVICOS, [5, 20, 32, 24, 14, 5]),
    gestao: pick(GESTAO, [26, 34, 30, 10]),
    melhoria: pick(melhorias),
    data: "2026-11-01",
  }));
}

export function getRespostas(): Resposta[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const d = seed(); localStorage.setItem(KEY, JSON.stringify(d)); return d;
}
export function addResposta(r: Resposta) {
  const all = getRespostas(); all.push(r);
  try { localStorage.setItem(KEY, JSON.stringify(all)); }
  catch { all[all.length - 1] = { ...r, audios: undefined }; localStorage.setItem(KEY, JSON.stringify(all)); } localStorage.setItem(DONE, "1");
}
export const jaRespondeu = () => typeof window !== "undefined" && localStorage.getItem(DONE) === "1";

export function contar(list: Resposta[], campo: keyof Resposta, opcoes: string[]) {
  const n = list.length || 1;
  return opcoes.map((o) => { const c = list.filter((x) => x[campo] === o).length; return { label: o, count: c, pct: Math.round((c / n) * 100) }; }).sort((a, b) => b.count - a.count);
}
