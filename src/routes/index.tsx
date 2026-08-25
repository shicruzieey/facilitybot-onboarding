import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import qrPlacard from "@/assets/qr-placard.jpg";
import concierge from "@/assets/concierge.jpg";
import logo from "@/assets/agila-subic-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FacilityBot Onboarding — Agila Subic facility guide" },
      {
        name: "description",
        content:
          "A simple, seven-step walkthrough of FacilityBot: QR access, visitor entry, gatepasses, service requests, announcements and chat support.",
      },
      { property: "og:title", content: "FacilityBot Onboarding" },
      {
        property: "og:description",
        content: "A calm, seven-step guide to facility services at the Agila Subic shipyard campus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  { key: "qr", eyebrow: "Access", title: "Quick access via QR", short: "QR" },
  { key: "menu", eyebrow: "Getting around", title: "What's in the menu", short: "Menu" },
  { key: "visitor", eyebrow: "Guests", title: "Inviting a visitor", short: "Visitors" },
  { key: "gatepass", eyebrow: "Equipment", title: "Moving things in and out", short: "Gatepass" },
  { key: "service", eyebrow: "Repairs", title: "Reporting an issue", short: "Service" },
  { key: "news", eyebrow: "Updates", title: "Staying in the loop", short: "Updates" },
  { key: "chat", eyebrow: "Help", title: "Talking to a person", short: "Chat" },
] as const;

function Onboarding() {
  // 0 = welcome, 1..7 = steps, 8 = finish
  const [phase, setPhase] = useState(0);
  const total = STEPS.length;
  const progress = Math.min(phase / (total + 1), 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement;
      if (typing) return;
      if (e.key === "ArrowRight") setPhase((p) => Math.min(p + 1, total + 1));
      if (e.key === "ArrowLeft") setPhase((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cream text-foreground selection:bg-sage-mid/30">
      <div className="fixed inset-x-0 top-0 z-50 h-1.5 bg-sage-light/50">
        <div
          className="h-full bg-sage-mid transition-all duration-700 ease-in-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {phase > 0 && phase <= total && (
        <nav className="sticky top-1.5 z-40 border-b border-sage-light/70 bg-cream/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 px-6 py-3">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const state = n === phase ? "current" : n < phase ? "done" : "todo";
              return (
                <button
                  key={s.key}
                  onClick={() => setPhase(n)}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    state === "current"
                      ? "bg-sage-dark text-primary-foreground shadow-sm"
                      : state === "done"
                        ? "bg-sage-mid/25 text-sage-dark hover:bg-sage-mid/40"
                        : "text-muted-foreground hover:bg-sage-light/50"
                  }`}
                >
                  {s.short}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12">
        {phase === 0 && <Welcome onStart={() => setPhase(1)} onJump={(n) => setPhase(n)} />}

        {phase > 0 && phase <= total && (
          <StepCard
            key={phase}
            index={phase}
            total={total}
            onBack={() => setPhase(phase - 1)}
            onNext={() => setPhase(phase + 1)}
          />
        )}

        {phase === total + 1 && <Finish onRestart={() => setPhase(0)} onJump={setPhase} />}
      </main>

      {phase > 0 && phase <= total && (
        <p className="pb-6 text-center text-xs text-muted-foreground">
          Tip: use your ← and → arrow keys to move between steps.
        </p>
      )}

      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 p-12 opacity-20">
        <div className="h-64 w-64 rounded-full border border-sage-dark/20" />
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-sage-dark/20" />
      </div>
    </div>
  );
}

function Welcome({ onStart, onJump }: { onStart: () => void; onJump: (n: number) => void }) {
  return (
    <section className="animate-step-in space-y-8 text-center">
      <img
        src={logo.url}
        alt="Agila Subic"
        width={480}
        height={80}
        className="mx-auto h-10 w-auto"
      />
      <div className="space-y-4">
        <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
          Welcome to the Agila Subic facility.
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
          FacilityBot is your guide to getting around the shipyard campus — gate access, visitors,
          equipment movement and repairs. Let's walk through it, one step at a time.
        </p>
      </div>


      <div className="grid gap-3 text-left sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => onJump(i + 1)}
            className="group flex items-center gap-4 rounded-2xl border border-sage-light bg-white/60 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-sage-mid hover:shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-light text-sm font-medium text-sage-dark transition-colors group-hover:bg-sage-mid">
              {i + 1}
            </span>
            <span>
              <span className="block font-medium text-foreground">{s.title}</span>
              <span className="block text-sm text-muted-foreground">{s.eyebrow}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={onStart}
          className="rounded-full bg-sage-dark px-10 py-4 font-display font-medium text-primary-foreground shadow-lg shadow-sage-dark/20 transition-all hover:bg-sage-dark/90 active:scale-[0.98]"
        >
          Begin the tour
        </button>
        <p className="text-sm text-muted-foreground">Seven short steps, about five minutes.</p>
      </div>
    </section>
  );
}

function StepCard({
  index,
  total,
  onBack,
  onNext,
}: {
  index: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const step = STEPS[index - 1]!;

  return (
    <section className="animate-step-in">
      <div className="rounded-[32px] border border-sage-light bg-white/60 p-8 shadow-sm sm:p-10">
        <span className="text-xs font-bold uppercase tracking-widest text-sage-dark/60">
          Step {index} of {total} · {step.eyebrow}
        </span>
        <h2 className="mb-8 mt-4 text-3xl text-foreground">{step.title}</h2>

        <StepBody stepKey={step.key} />

        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="font-medium text-sage-dark/60 transition-colors hover:text-sage-dark"
          >
            Go back
          </button>
          <button
            onClick={onNext}
            className="rounded-full bg-sage-dark px-10 py-3 font-medium text-primary-foreground transition-all hover:bg-sage-dark/90 active:scale-[0.98]"
          >
            {index === total ? "Finish" : "Got it"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border-b border-sage-mid/30 bg-cream/40 px-1 py-3 transition-colors placeholder:text-muted-foreground/50 focus:border-sage-dark focus:outline-none";

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-2xl bg-sage-light/40 px-5 py-4 text-sm leading-relaxed text-foreground">
      {children}
    </p>
  );
}

function QrStep() {
  const [scanned, setScanned] = useState(false);
  return (
    <>
      <Lead>
        You'll find these placards at every entry point. Scanning one connects you to the campus's
        services instantly — nothing to download.
      </Lead>
      <div className="grid gap-6 sm:grid-cols-2">
        <img
          src={qrPlacard}
          alt="A QR code placard mounted on a plaster wall beside a wooden door"
          width={800}
          height={600}
          className="h-56 w-full rounded-2xl object-cover"
        />
        <div className="flex flex-col justify-center rounded-2xl border border-sage-light bg-cream/50 p-6">
          {scanned ? (
            <div className="animate-step-in space-y-2">
              <p className="font-medium text-foreground">Connected ✓</p>
              <p className="text-sm text-muted-foreground">
                You'd land straight on the menu — no app, no password.
              </p>
              <button
                onClick={() => setScanned(false)}
                className="text-sm font-medium text-sage-dark underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">Curious what happens next?</p>
              <button
                onClick={() => setScanned(true)}
                className="rounded-full bg-sage-dark px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-sage-dark/90 active:scale-[0.98]"
              >
                Try a scan
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function MenuStep() {
  const items = [
    ["Visitor requests", "Let guests, vendors and contractors in", "Approved passes reach the guard before your guest arrives."],
    ["Gatepass", "Move equipment or materials through the gate", "One form covers both bringing in and taking out."],
    ["Service requests", "Report anything broken or uncomfortable", "You'll get a ticket number and status updates."],
  ];
  const [open, setOpen] = useState(0);
  return (
    <>
      <Lead>
        Once you're in, everything lives in one short menu. Tap any item to see what it's for.
      </Lead>
      <ul className="space-y-3">
        {items.map(([title, desc, detail], i) => (
          <li key={title}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className={`w-full rounded-2xl px-5 py-4 text-left transition-colors ${
                open === i ? "bg-sage-light/70" : "bg-sage-light/30 hover:bg-sage-light/50"
              }`}
            >
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
              {open === i && (
                <p className="mt-3 border-t border-sage-mid/30 pt-3 text-sm text-foreground">
                  {detail}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function VisitorStep() {
  const [name, setName] = useState("");
  return (
    <>
      <Lead>
        When someone's coming to see you, tell us ahead of time. Try filling this in — nothing is
        sent.
      </Lead>
      <div className="space-y-6">
        <Field label="Guest's full name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eleanor Shellstrop"
            className={inputClass}
          />
        </Field>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Arrival date">
            <input type="text" placeholder="Today" className={inputClass} />
          </Field>
          <Field label="Purpose">
            <select className={inputClass}>
              <option>Business meeting</option>
              <option>Delivery</option>
              <option>Contractor work</option>
            </select>
          </Field>
        </div>
      </div>
      {name.trim() && (
        <Note>
          <strong>{name.trim()}</strong> would be added to today's guest list, and the guard sees the
          pass at the gate.
        </Note>
      )}
    </>
  );
}

function GatepassStep() {
  const [dir, setDir] = useState<"in" | "out">("in");
  const options = [
    { id: "in" as const, title: "Bringing in", desc: "Deliveries and new equipment" },
    { id: "out" as const, title: "Taking out", desc: "Removals and returns" },
  ];
  return (
    <>
      <Lead>
        A gatepass covers anything physical crossing the gate. Choose the direction, describe the
        items, and submit a day ahead.
      </Lead>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setDir(o.id)}
            aria-pressed={dir === o.id}
            className={`rounded-2xl border px-5 py-4 text-left transition-all ${
              dir === o.id
                ? "border-sage-dark bg-sage-light/60"
                : "border-sage-mid/30 hover:border-sage-mid"
            }`}
          >
            <p className="font-medium text-foreground">{o.title}</p>
            <p className="text-sm text-muted-foreground">{o.desc}</p>
          </button>
        ))}
      </div>
      <Field label="What are you moving?">
        <textarea rows={3} placeholder="Two office chairs and a monitor" className={inputClass} />
      </Field>
      <Note>
        {dir === "in"
          ? "For items coming in, the guard checks your list against the delivery at the gate."
          : "For items going out, management approval is required before the guard releases them."}
      </Note>
    </>
  );
}

function ServiceStep() {
  const cats = ["Power supply", "Water supply", "Lift station", "General maintenance"];
  const urgencies = [
    ["Whenever you can", "Handled within the week."],
    ["Sometime this week", "Scheduled with the next crew round."],
    ["Today, please", "Picked up the same working day."],
    ["Right now — it's unsafe", "Dispatched immediately, day or night."],
  ];
  const [cat, setCat] = useState(0);
  const [urg, setUrg] = useState(0);
  return (
    <>
      <Lead>
        Something not working? Tell us what and where, and how urgent it feels. We'll take it from
        there.
      </Lead>
      <div className="space-y-6">
        <Field label="What needs attention">
          <div className="flex flex-wrap gap-2">
            {cats.map((c, i) => (
              <button
                key={c}
                onClick={() => setCat(i)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  cat === i
                    ? "bg-sage-dark text-primary-foreground"
                    : "bg-sage-light/50 text-foreground hover:bg-sage-light"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Where">
          <input type="text" placeholder="Building A, Floor 3, Room 301" className={inputClass} />
        </Field>
        <Field label="How urgent">
          <select
            className={inputClass}
            value={urg}
            onChange={(e) => setUrg(Number(e.target.value))}
          >
            {urgencies.map(([label], i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Note>
        {cats[cat]} · {urgencies[urg]![1]}
      </Note>
    </>
  );
}

function NewsStep() {
  const items = [
    ["Scheduled maintenance", "Dec 15, 2:00–4:00 AM. Services briefly unavailable."],
    ["Holiday hours", "The facility is closed Dec 25. Emergency support stays open."],
    ["New safety protocol", "Updated fire procedures — worth a two-minute read."],
  ];
  const [read, setRead] = useState<number[]>([]);
  return (
    <>
      <Lead>
        Building announcements arrive in the same place — maintenance windows, holiday hours and
        safety notices. Tap one to mark it read.
      </Lead>
      <div className="space-y-4">
        {items.map(([title, body], i) => {
          const isRead = read.includes(i);
          return (
            <button
              key={title}
              onClick={() => setRead(isRead ? read.filter((r) => r !== i) : [...read, i])}
              className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                isRead ? "border-sage-light bg-sage-light/30" : "border-sage-mid/40 bg-cream/50"
              }`}
            >
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  isRead ? "bg-sage-light" : "bg-sage-mid"
                }`}
              />
              <span>
                <span className="block font-medium text-foreground">{title}</span>
                <span className="block text-sm leading-relaxed text-muted-foreground">{body}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {read.length} of {items.length} marked as read.
      </p>
    </>
  );
}

function ChatStep() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I'm here to help. What can I do for you today?" },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "you", text }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "Got it — in the real app I'd check your requests and reply in a moment.",
        },
      ]);
    }, 600);
  };

  return (
    <>
      <Lead>
        If anything is unclear, ask. A real person answers during working hours, and the bot can
        check your request status anytime.
      </Lead>
      <div className="rounded-2xl border border-sage-light bg-cream/50 p-5">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <p
              key={i}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.from === "bot"
                  ? "rounded-bl-sm bg-sage-light text-foreground"
                  : "ml-auto rounded-br-sm bg-sage-dark text-primary-foreground"
              }`}
            >
              {m.text}
            </p>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your message…"
            className={inputClass}
          />
          <button
            onClick={send}
            className="rounded-full bg-sage-dark px-5 text-sm font-medium text-primary-foreground"
          >
            Send
          </button>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Urgent? Call 0918-912-4533 or 0977-110-0375.
      </p>
    </>
  );
}

function StepBody({ stepKey }: { stepKey: (typeof STEPS)[number]["key"] }) {
  switch (stepKey) {
    case "qr":
      return <QrStep />;
    case "menu":
      return <MenuStep />;
    case "visitor":
      return <VisitorStep />;
    case "gatepass":
      return <GatepassStep />;
    case "service":
      return <ServiceStep />;
    case "news":
      return <NewsStep />;
    case "chat":
      return <ChatStep />;
  }
}

function Finish({ onRestart, onJump }: { onRestart: () => void; onJump: (n: number) => void }) {
  return (
    <section className="animate-step-in text-center">
      <div className="mb-8 inline-block rounded-full bg-sage-light/20 p-1">
        <img
          src={concierge}
          alt="A smiling facility coordinator at the Agila Subic reception"
          width={512}
          height={512}
          loading="lazy"
          className="h-24 w-24 rounded-full object-cover outline-4 outline-white"
        />
      </div>
      <h2 className="mb-4 text-3xl font-light text-foreground">You're all set.</h2>
      <p className="mx-auto mb-10 max-w-md text-muted-foreground">
        The facility is now at your fingertips. If you ever feel lost, look for the placards or tap
        the chat bubble.
      </p>

      <div className="mb-10 grid gap-3 text-left sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => onJump(i + 1)}
            className="rounded-2xl border border-sage-light bg-white/60 px-5 py-3 text-sm transition-colors hover:border-sage-mid"
          >
            <span className="font-medium text-foreground">{s.title}</span>
            <span className="block text-xs text-muted-foreground">Revisit this step</span>
          </button>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full rounded-2xl border border-sage-mid/30 bg-white py-4 font-display font-medium text-sage-dark transition-colors hover:bg-sage-light/20"
      >
        Take the tour again
      </button>
    </section>
  );
}
