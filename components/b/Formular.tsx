"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { company } from "@/app/content";
import { terminB } from "@/app/copy-b";
import { EMAIL, GROESSEN, STUNDEN, ZEITFRESSER, mailtoAdresse, type Abwehr, type Anfrage } from "@/app/api/anfrage/format";
import { Haken } from "./ui";

/* Anmeldung zum KI-Workshop (Variante B): ein einziger, übersichtlicher Schritt.
   Handy: Auswahl-Knöpfe zweispaltig, Name und Firma nebeneinander, keine zusätzliche Karte (formular.css).
   Schickt an /api/anfrage wie Variante A (gleiche Felder, Prüfung und Spam-Abwehr).
   Antwort 503 = Versand noch nicht eingerichtet → E-Mail-Programm mit fertiger Nachricht. */

// Meldung „anfrage_gesendet“ an den Google Tag Manager, falls er geladen ist (derzeit nicht eingebunden)
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const F = terminB.form;
type Feld = keyof typeof F.errors;
type Status = "idle" | "sending" | "done" | "fallback" | "failure";

export default function Formular() {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [tasks, setTasks] = useState<string[]>([]);
  const [hours, setHours] = useState<number>(STUNDEN.start);
  const [employees, setEmployees] = useState("");
  const [t, setT] = useState({ name: "", company: "", email: "", phone: "", message: "", falle: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Feld, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [mailto, setMailto] = useState<string | null>(null);
  const geoeffnet = useRef(0);
  const ergebnis = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geoeffnet.current = performance.now();
  }, []);
  useEffect(() => {
    if (status !== "idle" && status !== "sending") ergebnis.current?.focus();
  }, [status]);

  const pruefe = (k: Feld): string | undefined => {
    if (k === "tasks" && !tasks.length) return F.errors.tasks;
    if (k === "employees" && !employees) return F.errors.employees;
    if (k === "name" && !t.name.trim()) return F.errors.name;
    if (k === "company" && !t.company.trim()) return F.errors.company;
    if (k === "email" && !EMAIL.test(t.email.trim())) return F.errors.email;
    if (k === "consent" && !consent) return F.errors.consent;
    return undefined;
  };
  const alle: Feld[] = ["tasks", "employees", "name", "company", "email", "consent"];

  // Fehler verschwindet, sobald das Feld stimmt
  const loese = (k: Feld) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  async function absenden(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const neu: Partial<Record<Feld, string>> = {};
    alle.forEach((k) => {
      const f = pruefe(k);
      if (f) neu[k] = f;
    });
    setErrors(neu);
    const erstes = alle.find((k) => neu[k]);
    if (erstes) {
      document.getElementById(id(erstes))?.focus();
      return;
    }

    const anfrage: Anfrage & Abwehr = {
      tasks,
      hours,
      employees,
      industry: "",
      name: t.name.trim(),
      company: t.company.trim(),
      email: t.email.trim(),
      phone: t.phone.trim(),
      message: t.message.trim(),
      consent,
      nf_extra: t.falle,
      dauer: Math.round(performance.now() - geoeffnet.current),
    };

    setStatus("sending");
    let neuStatus: Status = "failure";
    try {
      const antwort = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anfrage),
      });
      if (antwort.ok) neuStatus = "done";
      else if (antwort.status === 503) neuStatus = "fallback";
    } catch {
      neuStatus = "failure";
    }
    if (neuStatus === "done") window.dataLayer?.push({ event: "anfrage_gesendet", formular: "ki-workshop-b" });
    if (neuStatus === "fallback") {
      const href = mailtoAdresse(anfrage, company.email);
      setMailto(href);
      window.location.href = href;
    }
    setStatus(neuStatus);
  }

  if (status === "done" || status === "fallback" || status === "failure") {
    const vorname = t.name.trim().split(/\s+/)[0] ?? "";
    return (
      <div className="fm fm--fertig b-karte" ref={ergebnis} tabIndex={-1} role="status" aria-live="polite">
        {status === "done" ? (
          <>
            <span className="fm-fertig-symbol" aria-hidden="true">
              <Haken size={34} />
            </span>
            <p className="fm-fertig-titel">{F.success(vorname)}</p>
            <p>{F.successText}</p>
          </>
        ) : status === "fallback" ? (
          <>
            <p className="fm-fertig-titel">{F.success(vorname)}</p>
            <p>{F.fallback}</p>
            <a className="b-textlink" href={mailto ?? `mailto:${company.email}`}>
              {F.fallbackLink}
            </a>
          </>
        ) : (
          <>
            <p>{F.failure}</p>
            <p className="fm-direkt">
              <a className="b-textlink" href={`tel:${company.phoneHref}`}>
                {company.phone}
              </a>
              <a className="b-textlink" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </p>
          </>
        )}
      </div>
    );
  }

  const sending = status === "sending";
  const fehler = (k: Feld) =>
    errors[k] ? (
      <p className="fm-fehler" id={id(`${k}-fehler`)}>
        {errors[k]}
      </p>
    ) : null;
  const beschrieb = (k: Feld) => (errors[k] ? id(`${k}-fehler`) : undefined);

  return (
    <form className="fm b-karte" onSubmit={absenden} noValidate aria-busy={sending}>
      <fieldset className="fm-gruppe">
        <legend className="fm-frage">
          {F.tasks} <span className="fm-hint">{F.tasksHint}</span>
        </legend>
        <div className="fm-chips" id={id("tasks")} tabIndex={-1} aria-describedby={beschrieb("tasks")}>
          {ZEITFRESSER.map((z) => {
            const an = tasks.includes(z);
            return (
              <label key={z} className="fm-chip" data-an={an ? "true" : "false"}>
                <input
                  type="checkbox"
                  checked={an}
                  onChange={() => {
                    setTasks((l) => (an ? l.filter((x) => x !== z) : [...l, z]));
                    loese("tasks");
                  }}
                />
                {z}
              </label>
            );
          })}
        </div>
        {fehler("tasks")}
      </fieldset>

      <div className="fm-gruppe">
        <label className="fm-frage" htmlFor={id("hours")}>
          {F.hours}
        </label>
        <div className="fm-regler">
          <input
            id={id("hours")}
            type="range"
            min={STUNDEN.min}
            max={STUNDEN.max}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={{ "--wert": `${((hours - STUNDEN.min) / (STUNDEN.max - STUNDEN.min)) * 100}%` } as React.CSSProperties}
          />
          <output htmlFor={id("hours")} className="fm-regler-wert">
            {hours} {F.hoursUnit}
          </output>
        </div>
        <p className="fm-calc">{F.hoursCalc(hours)}</p>
      </div>

      <fieldset className="fm-gruppe">
        <legend className="fm-frage">{F.size}</legend>
        <div className="fm-chips" id={id("employees")} tabIndex={-1} aria-describedby={beschrieb("employees")}>
          {GROESSEN.map((g) => (
            <label key={g} className="fm-chip" data-an={employees === g ? "true" : "false"}>
              <input
                type="radio"
                name={id("employees")}
                checked={employees === g}
                onChange={() => {
                  setEmployees(g);
                  loese("employees");
                }}
              />
              {g}
            </label>
          ))}
        </div>
        {fehler("employees")}
      </fieldset>

      <div className="fm-felder">
        {(
          [
            ["name", F.name, "text", "name", true],
            ["company", F.company, "text", "organization", true],
            ["email", F.email, "email", "email", true],
            ["phone", F.phone, "tel", "tel", false],
          ] as const
        ).map(([k, label, typ, auto, pflicht]) => (
          <div key={k} className={`fm-feld fm-feld--${k}`}>
            <label htmlFor={id(k)}>
              {label} {pflicht ? null : <span className="fm-hint">{F.optional}</span>}
            </label>
            <input
              id={id(k)}
              type={typ}
              autoComplete={auto}
              value={t[k]}
              aria-invalid={pflicht && errors[k as Feld] ? true : undefined}
              aria-describedby={pflicht ? beschrieb(k as Feld) : undefined}
              onChange={(e) => {
                setT((v) => ({ ...v, [k]: e.target.value }));
                if (pflicht) loese(k as Feld);
              }}
            />
            {pflicht ? fehler(k as Feld) : null}
          </div>
        ))}
        <div className="fm-feld fm-feld--breit">
          <label htmlFor={id("message")}>
            {F.message} <span className="fm-hint">{F.optional}</span>
          </label>
          <textarea id={id("message")} rows={3} value={t.message} onChange={(e) => setT((v) => ({ ...v, message: e.target.value }))} />
        </div>
        {/* Falle für Programme: für Menschen unsichtbar */}
        <div className="fm-falle" aria-hidden="true">
          <label htmlFor={id("extra")}>Bitte leer lassen</label>
          <input id={id("extra")} name="nf_extra" tabIndex={-1} autoComplete="off" value={t.falle} onChange={(e) => setT((v) => ({ ...v, falle: e.target.value }))} />
        </div>
      </div>

      <div className="fm-gruppe">
        <label className="fm-zustimmung" htmlFor={id("consent")}>
          <input
            id={id("consent")}
            type="checkbox"
            checked={consent}
            aria-describedby={beschrieb("consent")}
            onChange={(e) => {
              setConsent(e.target.checked);
              loese("consent");
            }}
          />
          <span>
            {F.consentBefore}
            <a href="/datenschutz" target="_blank" rel="noopener">
              {F.consentLink}
            </a>
            {F.consentAfter}
          </span>
        </label>
        {fehler("consent")}
      </div>

      <button type="submit" className="btn btn-primary fm-senden" disabled={sending}>
        <span>{sending ? F.sending : F.submit}</span>
        <span className="btn-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>
      <p className="fm-unten">{F.below}</p>
    </form>
  );
}
