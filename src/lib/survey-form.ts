export const AREAS = [
  "Saúde",
  "Educação",
  "Segurança",
  "Infraestrutura e estradas",
  "Limpeza pública",
  "Emprego e renda",
  "Esporte e lazer",
  "Outra",
] as const;

export const IDADES = ["16–24", "25–34", "35–49", "50–64", "65+", "Outro"] as const;
export const SERVICOS = ["Ótimos", "Bons", "Regulares", "Ruins", "Péssimos", "Não sei avaliar", "Outro"] as const;
export const GESTAO = ["Sim", "Em parte", "Não", "Não sei avaliar", "Outro"] as const;

export type Resposta = {
  bairro: string;
  idade: string;
  area: string;
  servicos: string;
  gestao: string;
  melhoria: string;
  data: string;
  outros?: Record<string, string>;
  audios?: Record<string, string>;
};

export function contar(list: Resposta[], campo: keyof Resposta, opcoes: readonly string[] | string[]) {
  const n = list.length || 1;
  return opcoes
    .map((o) => {
      const c = list.filter((x) => x[campo] === o).length;
      return { label: o, count: c, pct: Math.round((c / n) * 100) };
    })
    .sort((a, b) => b.count - a.count);
}

export function toRespostaRows(
  rows: {
    locality: string;
    idade: string;
    area: string;
    servicos: string;
    gestao: string;
    melhoria: string;
    outros: Record<string, string> | null;
    audios: Record<string, string> | null;
    createdAt: Date;
  }[],
): Resposta[] {
  return rows.map((r) => ({
    bairro: r.locality,
    idade: r.idade,
    area: r.area,
    servicos: r.servicos,
    gestao: r.gestao,
    melhoria: r.melhoria,
    data: r.createdAt.toISOString().slice(0, 10),
    outros: r.outros ?? undefined,
    audios: r.audios ?? undefined,
  }));
}