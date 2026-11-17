import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AREAS, BAIRROS, GESTAO, IDADES, SERVICOS, addResposta, jaRespondeu, type Resposta } from "@/lib/survey";

export const Route = createFileRoute("/pesquisa")({
  head: () => ({
    meta: [
      { title: "Responder pesquisa — Observatório Cidadão" },
      { name: "description", content: "Pesquisa anônima de 2 minutos sobre a sua cidade." },
      { property: "og:title", content: "Responder pesquisa — Observatório Cidadão" },
      { property: "og:description", content: "Dê sua opinião sobre os serviços públicos e prioridades do seu bairro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pesquisa,
});

type Step = { key: keyof Resposta; title: string; options?: string[] };
const STEPS: Step[] = [
  { key: "bairro", title: "Em qual bairro ou comunidade você mora?", options: BAIRROS },
  { key: "idade", title: "Qual a sua faixa de idade?", options: IDADES },
  { key: "area", title: "Qual área mais precisa de melhorias no município?", options: AREAS },
  { key: "servicos", title: "Como você avalia os serviços públicos da sua cidade?", options: SERVICOS },
  { key: "gestao", title: "Você acredita que a atual gestão está trabalhando para resolver os problemas da população?", options: GESTAO },
  { key: "melhoria", title: "Se pudesse pedir uma melhoria ao gestor municipal, qual seria?" },
];

function Pesquisa() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<Partial<Resposta>>({});
  const [done, setDone] = useState(false);
  const nav = useNavigate();
  useEffect(() => setDone(jaRespondeu()), []);
  const step = STEPS[i];

  if (done)
    return (
      <div className="min-h-screen"><SiteHeader />
        <main className="mx-auto max-w-xl px-5 pt-16 text-center">
          <h1 className="text-4xl font-bold">Obrigado! Sua voz já foi registrada.</h1>
          <p className="mt-4 text-muted-foreground">Para manter os resultados justos, aceitamos uma resposta por aparelho em cada pesquisa.</p>
          <Link to="/resultados" className="mt-8 inline-block rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground">Ver o retrato da cidade</Link>
        </main>
      </div>
    );

  const choose = (v: string) => { setAns({ ...ans, [step.key]: v }); setTimeout(() => setI(i + 1), 180); };
  const finish = () => {
    addResposta({ ...(ans as Resposta), melhoria: (ans.melhoria || "").trim(), data: new Date().toISOString().slice(0, 10) });
    nav({ to: "/resultados" });
  };

  return (
    <div className="min-h-screen"><SiteHeader />
      <main className="mx-auto max-w-xl px-5 pb-16 pt-6">
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Pergunta {i + 1} de {STEPS.length}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">{step.title}</h1>
        <div className="mt-7 space-y-3">
          {step.options ? step.options.map((o) => (
            <button key={o} className="option-card" data-selected={ans[step.key] === o} onClick={() => choose(o)}>{o}</button>
          )) : (
            <>
              <textarea value={ans.melhoria || ""} onChange={(e) => setAns({ ...ans, melhoria: e.target.value.slice(0, 500) })} rows={5}
                placeholder="Ex.: mais médicos no posto de saúde do meu bairro"
                className="w-full rounded-[var(--radius)] border border-input bg-card p-4 outline-none focus:border-primary" />
              <button onClick={finish} className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground">Enviar minha opinião</button>
              <p className="text-xs text-muted-foreground">Não escreva nomes, telefone ou dados pessoais. Sua resposta é anônima.</p>
            </>
          )}
        </div>
        {i > 0 && <button onClick={() => setI(i - 1)} className="mt-6 text-sm font-medium text-muted-foreground">← Voltar</button>}
      </main>
    </div>
  );
}
