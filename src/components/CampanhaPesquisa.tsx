import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CampaignSiteHeader } from "@/components/CampaignSiteHeader";
import { AudioRecorder, ListenButton, speak } from "@/components/Voice";
import { AREAS, GESTAO, IDADES, SERVICOS } from "@/lib/survey-form";
import type { CampaignPublic } from "@/types/campaign";
import { checkVisitorFn, submitResponseFn } from "@/fns/responses";

type Key = "bairro" | "idade" | "area" | "servicos" | "gestao" | "melhoria";
type Step = { key: Key; title: string; options?: string[] };

const readAll = (s: Step) =>
  s.options ? `${s.title} As opções são: ${s.options.map((o, i) => `${i + 1}, ${o}`).join(". ")}.` : s.title;

export function CampanhaPesquisa({ campaign }: { campaign: CampaignPublic }) {
  const localityOptions = campaign.localities.map((l) => l.name);
  const steps: Step[] = [
    {
      key: "bairro",
      title: `Em qual ${campaign.localityLabel} você mora?`,
      options: localityOptions,
    },
    { key: "idade", title: "Qual a sua faixa de idade?", options: [...IDADES] },
    {
      key: "area",
      title: `Qual área mais precisa de melhorias na sua ${campaign.localityLabel}?`,
      options: [...AREAS],
    },
    {
      key: "servicos",
      title: `Como você avalia os serviços públicos da sua ${campaign.localityLabel}?`,
      options: [...SERVICOS],
    },
    {
      key: "gestao",
      title: "Você acredita que a atual gestão está trabalhando para resolver os problemas da população?",
      options: [...GESTAO],
    },
    {
      key: "melhoria",
      title: "Se pudesse pedir uma melhoria ao gestor municipal, qual seria? Pode escrever ou mandar um áudio.",
    },
  ];

  const [i, setI] = useState(0);
  const [ans, setAns] = useState<Partial<Record<Key, string>>>({});
  const [outros, setOutros] = useState<Record<string, string>>({});
  const [audios, setAudios] = useState<Record<string, string>>({});
  const [done, setDone] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    checkVisitorFn({ data: { slug: campaign.slug } }).then((r) => setDone(r.already ?? false));
  }, [campaign.slug]);

  const step = steps[Math.min(i, steps.length - 1)]!;
  const isOutro = ans[step.key] === "Outro";
  const isOpen = !step.options;

  if (done === null) {
    return (
      <div className="min-h-screen">
        <CampaignSiteHeader slug={campaign.slug} title={campaign.title} />
        <main className="mx-auto max-w-xl px-5 pt-16 text-center text-muted-foreground">Carregando…</main>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <CampaignSiteHeader slug={campaign.slug} title={campaign.title} />
        <main className="mx-auto max-w-xl px-5 pt-16 text-center">
          <h1 className="text-4xl font-bold">Obrigado! Sua voz já foi registrada.</h1>
          <p className="mt-4 text-muted-foreground">
            Para manter os resultados justos, aceitamos uma resposta por aparelho em cada pesquisa.
          </p>
          <Link
            to="/c/$slug/resultados"
            params={{ slug: campaign.slug }}
            className="mt-8 inline-block rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground"
          >
            Ver o retrato de {campaign.title}
          </Link>
        </main>
      </div>
    );
  }

  const next = () => {
    window.speechSynthesis?.cancel();
    setI(i + 1);
  };
  const choose = (v: string) => {
    setAns({ ...ans, [step.key]: v });
    speak(v);
    if (v !== "Outro") setTimeout(next, 450);
  };
  const setAudio = (v?: string) => {
    const a = { ...audios };
    if (v) a[step.key] = v;
    else delete a[step.key];
    setAudios(a);
  };
  const outroOk = (outros[step.key] || "").trim() || audios[step.key];

  const finish = async () => {
    setSubmitting(true);
    try {
      const res = await submitResponseFn({
        data: {
          slug: campaign.slug,
          locality: ans.bairro!,
          idade: ans.idade!,
          area: ans.area!,
          servicos: ans.servicos!,
          gestao: ans.gestao!,
          melhoria: (outros["melhoria"] || "").trim() || (audios["melhoria"] ? "(áudio)" : ""),
          outros,
          audios,
        },
      });
      if (res instanceof Response) {
        const body = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          if (body.error === "already_answered") setDone(true);
          return;
        }
      }
      nav({ to: "/c/$slug/resultados", params: { slug: campaign.slug } });
    } finally {
      setSubmitting(false);
    }
  };

  const extra = (
    <div className="space-y-3 rounded-[var(--radius)] border border-border bg-muted p-4">
      <textarea
        value={outros[step.key] || ""}
        onChange={(e) => setOutros({ ...outros, [step.key]: e.target.value.slice(0, 500) })}
        rows={isOpen ? 4 : 3}
        placeholder={isOpen ? "Ex.: mais médicos no posto de saúde" : "Escreva aqui…"}
        className="w-full rounded-[var(--radius)] border border-input bg-card p-4 outline-none focus:border-primary"
      />
      <p className="text-center text-sm text-muted-foreground">ou</p>
      <AudioRecorder value={audios[step.key]} onChange={setAudio} />
    </div>
  );

  return (
    <div className="min-h-screen">
      <CampaignSiteHeader slug={campaign.slug} title={campaign.title} />
      <main className="mx-auto max-w-xl px-5 pb-16 pt-6">
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          Pergunta {i + 1} de {steps.length}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">{step.title}</h1>
        <div className="mt-4">
          <ListenButton text={readAll(step)} label={step.options ? "Ouvir pergunta e opções" : "Ouvir pergunta"} />
        </div>
        <div className="mt-6 space-y-3">
          {step.options?.map((o) => (
            <div key={o} className="flex items-center gap-2">
              <button className="option-card" data-selected={ans[step.key] === o} onClick={() => choose(o)}>
                {o}
              </button>
              <ListenButton text={o} small />
            </div>
          ))}
          {(isOutro || isOpen) && extra}
          {isOutro && (
            <button
              onClick={next}
              disabled={!outroOk}
              className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-40"
            >
              Continuar
            </button>
          )}
          {isOpen && (
            <>
              <button
                onClick={finish}
                disabled={submitting}
                className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-40"
              >
                {submitting ? "Enviando…" : "Enviar minha opinião"}
              </button>
              <p className="text-xs text-muted-foreground">
                Não diga nomes, telefone ou dados pessoais. Sua resposta é anônima.
              </p>
            </>
          )}
        </div>
        {i > 0 && (
          <button onClick={() => setI(i - 1)} className="mt-6 text-sm font-medium text-muted-foreground">
            ← Voltar
          </button>
        )}
      </main>
    </div>
  );
}