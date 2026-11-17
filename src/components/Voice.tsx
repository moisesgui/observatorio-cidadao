import { useEffect, useRef, useState } from "react";

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR"; u.rate = 0.9;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("pt"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function ListenButton({ text, label = "Ouvir", small }: { text: string; label?: string; small?: boolean }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); speak(text); }} aria-label={`${label}: ${text}`}
      className={small ? "listen-btn-sm" : "listen-btn"}>
      <span aria-hidden>🔊</span>{!small && <span>{label}</span>}
    </button>
  );
}

export function AudioRecorder({ value, onChange }: { value?: string | undefined; onChange: (dataUrl: string | undefined) => void }) {
  const [rec, setRec] = useState(false);
  const [err, setErr] = useState("");
  const mr = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  useEffect(() => () => mr.current?.stream.getTracks().forEach((t) => t.stop()), []);

  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      chunks.current = [];
      m.ondataavailable = (e) => chunks.current.push(e.data);
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const r = new FileReader();
        r.onload = () => onChange(r.result as string);
        r.readAsDataURL(new Blob(chunks.current, { type: m.mimeType }));
      };
      m.start(); mr.current = m; setRec(true);
      setTimeout(() => m.state === "recording" && m.stop(), 60000);
    } catch { setErr("Não foi possível usar o microfone. Permita o acesso e tente de novo."); }
  };
  const stop = () => { mr.current?.stop(); setRec(false); };

  return (
    <div className="space-y-2">
      {rec ? (
        <button type="button" onClick={stop} className="record-btn" data-recording="true">⏹ Parar gravação</button>
      ) : (
        <button type="button" onClick={start} className="record-btn">🎤 {value ? "Gravar de novo" : "Mandar áudio"}</button>
      )}
      {value && !rec && (
        <div className="flex items-center gap-2">
          <audio controls src={value} className="w-full" />
          <button type="button" onClick={() => onChange(undefined)} className="text-sm text-muted-foreground underline">Apagar</button>
        </div>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
    </div>
  );
}
