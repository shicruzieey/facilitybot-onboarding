import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  QrCode,
  LayoutGrid,
  UserPlus,
  PackageCheck,
  Wrench,
  Megaphone,
  MessagesSquare,
  Check,
  Star,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import qrPlacard from "@/assets/qr-placard.jpg";
import concierge from "@/assets/concierge.jpg";
import logo from "@/assets/agila-subic-logo.png";
import facilitybotLogo from "@/assets/facilitybot-logo.png";


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
  { key: "qr", eyebrow: "Access", title: "How to Access", short: "Access", icon: QrCode, minutes: 1 },
  { key: "menu", eyebrow: "Navigation", title: "Key Features", short: "Features", icon: LayoutGrid, minutes: 1 },
  { key: "visitor", eyebrow: "Requests", title: "Visitors & Deliveries", short: "Visitors", icon: UserPlus, minutes: 2 },
  { key: "gatepass", eyebrow: "Requests", title: "Removing Items", short: "Removals", icon: PackageCheck, minutes: 2 },
  { key: "service", eyebrow: "Requests", title: "Service Request", short: "Service", icon: Wrench, minutes: 2 },
  { key: "tracking", eyebrow: "Management", title: "Track Your Requests", short: "Tracking", icon: Megaphone, minutes: 1 },
  { key: "chat", eyebrow: "Support", title: "Account & Support", short: "Support", icon: MessagesSquare, minutes: 1 },
] as const;

const STORAGE_KEY = "facilitybot-onboarding-v1";

function Onboarding() {
  // 0 = welcome, 1..7 = steps, 8 = finish
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const total = STEPS.length;
  const progress = done.length / total;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { done?: number[] };
        if (Array.isArray(parsed.done)) setDone(parsed.done);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ done }));
    } catch {
      /* ignore */
    }
  }, [done, hydrated]);

  const complete = (n: number) => setDone((d) => (d.includes(n) ? d : [...d, n]));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement;
      if (typing) return;
      if (e.key === "ArrowRight")
        setPhase((p) => {
          if (p >= 1 && p <= total) complete(p);
          return Math.min(p + 1, total + 1);
        });
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
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-6 py-3 lg:px-12">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isDone = done.includes(n);
              const current = n === phase;
              return (
                <button
                  key={s.key}
                  onClick={() => setPhase(n)}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Step ${n}: ${s.title}`}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    current
                      ? "bg-sage-dark text-primary-foreground shadow-sm"
                      : isDone
                        ? "bg-sage-mid/25 text-sage-dark hover:bg-sage-mid/40"
                        : "text-muted-foreground hover:bg-sage-light/50"
                  }`}
                >
                  {isDone && !current ? <Check className="h-3 w-3" /> : null}
                  {s.short}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-12 lg:px-12">
        {phase === 0 && (
          <Welcome
            done={done}
            onStart={() => setPhase(done.length > 0 ? Math.min(done.length + 1, total) : 1)}
            onJump={(n) => setPhase(n)}
            onReset={() => setDone([])}
          />
        )}

        {phase > 0 && phase <= total && (
          <StepCard
            key={phase}
            index={phase}
            total={total}
            isDone={done.includes(phase)}
            onBack={() => setPhase(phase - 1)}
            onNext={() => {
              complete(phase);
              setPhase(phase + 1);
            }}
          />
        )}

        {phase === total + 1 && (
          <Finish
            onRestart={() => {
              setDone([]);
              setPhase(0);
            }}
            onJump={setPhase}
          />
        )}
      </main>

      {phase > 0 && phase <= total && (
        <p className="pb-6 text-center text-xs text-muted-foreground">
          💡 Psst... you can use ← and → keys to move between steps
        </p>
      )}

      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 p-12 opacity-20">
        <div className="h-64 w-64 rounded-full border border-sage-dark/20" />
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-sage-dark/20" />
      </div>
    </div>
  );
}

function Welcome({
  done,
  onStart,
  onJump,
  onReset,
}: {
  done: number[];
  onStart: () => void;
  onJump: (n: number) => void;
  onReset: () => void;
}) {
  const started = done.length > 0;
  return (
    <section className="animate-step-in space-y-8 text-center">
      <div className="flex items-center justify-center gap-5">
        <img
          src={logo}
          alt="Agila Subic"
          width={480}
          height={80}
          className="h-10 w-auto"
        />
        <span className="h-8 w-px bg-sage-mid/40" aria-hidden="true" />
        <img
          src={facilitybotLogo}
          alt="FacilityBot"
          width={300}
          height={300}
          className="h-11 w-auto"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-5xl">
          Hey, welcome! 👋
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
          This is a quick walkthrough of FacilityBot for POCs (that's Point of Contact). We'll show you the basics — creating requests, checking status, and getting things done at Agila Subic.
        </p>
      </div>

      <div className="grid gap-3 text-left sm:grid-cols-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = done.includes(i + 1);
          return (
            <button
              key={s.key}
              onClick={() => onJump(i + 1)}
              className="group flex items-center gap-4 rounded-2xl border border-sage-light bg-white/60 px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-sage-mid hover:shadow-sm"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isDone
                    ? "bg-sage-mid text-sage-dark"
                    : "bg-sage-light text-sage-dark group-hover:bg-sage-mid"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span>
                <span className="block font-medium text-foreground">{s.title}</span>
                <span className="block text-sm text-muted-foreground">{s.eyebrow}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <button
          onClick={onStart}
          className="rounded-full bg-sage-dark px-10 py-4 font-display font-medium text-primary-foreground shadow-lg shadow-sage-dark/20 transition-all hover:bg-sage-dark/90 active:scale-[0.98]"
        >
          {started ? "Pick up where you left off" : "Let's get started"}
        </button>
        <p className="text-sm text-muted-foreground">
          {started
            ? `You've finished ${done.length} out of ${STEPS.length} steps`
            : "Takes about 5 minutes — seven quick steps"}
        </p>
        {started && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Start over from the beginning
          </button>
        )}
      </div>
    </section>
  );
}

function StepCard({
  index,
  total,
  isDone,
  onBack,
  onNext,
}: {
  index: number;
  total: number;
  isDone: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const step = STEPS[index - 1]!;
  const Icon = step.icon;

  return (
    <section className="animate-step-in">
      <div className="rounded-[32px] border border-sage-light bg-white/60 p-8 shadow-sm sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sage-dark/60">
              Step {index} of {total} · {step.eyebrow}
            </span>
            <h2 className="mb-8 mt-4 flex items-center gap-3 text-3xl text-foreground">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-sage-dark">
                <Icon className="h-5 w-5" />
              </span>
              {step.title}
            </h2>
          </div>
          {isDone && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-sage-mid/25 px-3 py-1 text-xs font-medium text-sage-dark">
              <Check className="h-3 w-3" /> Done
            </span>
          )}
        </div>

        <StepBody stepKey={step.key} />

        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-medium text-sage-dark/60 transition-colors hover:text-sage-dark"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-full bg-sage-dark px-10 py-3 font-medium text-primary-foreground transition-all hover:bg-sage-dark/90 active:scale-[0.98]"
          >
            {index === total ? "Done" : "Got it"}
            <ArrowRight className="h-4 w-4" />
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
  const [method, setMethod] = useState<"web" | "app">("web");
  return (
    <>
      <Lead>
        You can use FacilityBot on your browser or phone — same account, works everywhere.
      </Lead>
      
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setMethod("web")}
          aria-pressed={method === "web"}
          className={`rounded-2xl border px-5 py-4 text-left transition-all ${
            method === "web"
              ? "border-sage-dark bg-sage-light/60"
              : "border-sage-mid/30 hover:border-sage-mid"
          }`}
        >
          <p className="font-medium text-foreground">Web Browser</p>
          <p className="text-sm text-muted-foreground">Go to agilasubic.facilitybot.co</p>
        </button>
        <button
          onClick={() => setMethod("app")}
          aria-pressed={method === "app"}
          className={`rounded-2xl border px-5 py-4 text-left transition-all ${
            method === "app"
              ? "border-sage-dark bg-sage-light/60"
              : "border-sage-mid/30 hover:border-sage-mid"
          }`}
        >
          <p className="font-medium text-foreground">Phone App</p>
          <p className="text-sm text-muted-foreground">App Store or Google Play</p>
        </button>
      </div>

      {method === "web" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
            <p className="mb-3 font-medium text-foreground">Logging in is straightforward:</p>
            <ol className="space-y-2">
              {[
                "Open your browser, go to agilasubic.facilitybot.co",
                "Type in your email or company domain",
                "Add your password",
                "Hit Sign In and you're good",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-mid/30 text-xs font-bold text-sage-dark">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <Note>
            Pro tip: You can use Google Authenticator to sign in if that's easier.
          </Note>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
            <p className="mb-3 font-medium text-foreground">Getting the app:</p>
            <ol className="space-y-2">
              {[
                'Search "FacilityBot" in your app store',
                "Download and install it",
                "Log in with your email and password (same as web)",
                "Turn on notifications so you don't miss updates",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-mid/30 text-xs font-bold text-sage-dark">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <Note>
            The app is handy for getting instant notifications. Everything syncs between your phone and computer automatically.
          </Note>
        </div>
      )}
    </>
  );
}

function MenuStep() {
  const features = [
    { title: "Requests", desc: "Create, access, track, and update your requests", icon: "📋" },
    { title: "Broadcasts", desc: "Receive announcements and advisories", icon: "📢" },
  ];
  
  return (
    <>
      <Lead>
        Once you're in, there are two main areas. You'll mostly use Requests — that's where the action happens.
      </Lead>
      <div className="space-y-3">
        {features.map(({ title, desc, icon }) => (
          <div
            key={title}
            className="flex items-center gap-4 rounded-2xl border border-sage-light bg-white/60 px-5 py-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-light text-2xl">
              {icon}
            </div>
            <div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Note>
        When you log in, your recent requests show up right on the main screen in the Preview Pane — makes it easy to jump back in.
      </Note>
    </>
  );
}


function VisitorStep() {
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [items, setItems] = useState("");
  
  return (
    <>
      <Lead>
        Use this when you have visitors, guests, or deliveries coming to the Shipyard. Just declare who's coming, what vehicles they're bringing, and any equipment or items.
      </Lead>
      <div className="space-y-6">
        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">What you need to tell us:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">👥</span>
              <div>
                <p className="text-sm font-medium text-foreground">Full names</p>
                <p className="text-xs text-muted-foreground">Everyone who's entering</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🚗</span>
              <div>
                <p className="text-sm font-medium text-foreground">Plate numbers</p>
                <p className="text-xs text-muted-foreground">Any vehicles coming in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📦</span>
              <div>
                <p className="text-sm font-medium text-foreground">Items & equipment</p>
                <p className="text-xs text-muted-foreground">Anything they're bringing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <span className="text-lg">📝</span> Practice Form (Nothing will be submitted)
          </p>
          <p className="mb-4 text-xs text-muted-foreground">Fields marked with * are required</p>
          <div className="space-y-4">
            <Field label="Visitor Names *">
              <textarea
                rows={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full names of all visitors"
                className={inputClass}
              />
            </Field>
            <Field label="Vehicle Plate Number(s)">
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g., ABC 1234"
                className={inputClass}
              />
            </Field>
            <Field label="Items/Equipment Brought In">
              <textarea
                rows={2}
                value={items}
                onChange={(e) => setItems(e.target.value)}
                placeholder="List all items being brought in"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-sage-mid/40 bg-sage-light/40 p-4">
          <p className="mb-2 text-sm font-semibold text-sage-dark">💡 Heads up</p>
          <p className="text-sm text-foreground">
            If something's coming in now but leaving later, you'll connect the removal request to this delivery when the time comes.
          </p>
        </div>
      </div>
    </>
  );
}

function GatepassStep() {
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  
  return (
    <>
      <Lead>
        Need to take something out? Use this for removing items or equipment. If the stuff was delivered earlier, just make sure it was declared when it came in.
      </Lead>
      <div className="space-y-6">
        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">What you need:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">📝</span>
              <div>
                <p className="text-sm font-medium text-foreground">List all items to be removed</p>
                <p className="text-xs text-muted-foreground">Provide complete details and descriptions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📸</span>
              <div>
                <p className="text-sm font-medium text-foreground">Photos for hazardous items</p>
                <p className="text-xs text-muted-foreground">Required for waste, garbage, or hazardous materials</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔗</span>
              <div>
                <p className="text-sm font-medium text-foreground">Link to original delivery</p>
                <p className="text-xs text-muted-foreground">If items were brought in earlier, link to that request</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <span className="text-lg">📝</span> Practice Form (Nothing will be submitted)
          </p>
          <p className="mb-4 text-xs text-muted-foreground">Fields marked with * are required</p>
          <div className="space-y-4">
            <Field label="Equipment/Items Description *">
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="List all equipment, tools, or materials to be removed"
                className={inputClass}
              />
            </Field>
            <Field label="Dock Location *">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Dry Dock 1, Building A"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-sage-mid/40 bg-sage-light/40 p-4">
          <p className="mb-2 text-sm font-semibold text-sage-dark">💡 Quick reminder</p>
          <p className="text-sm text-foreground">
            Guards check everything at the gate against what you listed. Double-check your details before submitting.
          </p>
        </div>
      </div>
    </>
  );
}

function ServiceStep() {
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  
  return (
    <>
      <Lead>
        Something broken or not working? Use this to get help with power, water, equipment issues — that kind of thing.
      </Lead>
      <div className="space-y-6">
        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">What you can request:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: "⚡", label: "Power Supply" },
              { icon: "💧", label: "Water Supply" },
              { icon: "🏗️", label: "Lift Station" },
              { icon: "🚑", label: "Support Services" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-sage-mid/30 bg-cream/40 px-3 py-2">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Support Services = ambulance, fire truck, training sessions, misc. facility stuff
          </p>
        </div>

        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <span className="text-lg">📝</span> Practice Form (Nothing will be submitted)
          </p>
          <p className="mb-4 text-xs text-muted-foreground">Fields marked with * are required</p>
          <div className="space-y-4">
            <Field label="Fault Description *">
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the issue in detail"
                className={inputClass}
              />
            </Field>
            <Field label="Fault Location *">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Building A, Floor 2, Room 201"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-sage-mid/40 bg-sage-light/40 p-4">
          <p className="mb-2 text-sm font-semibold text-sage-dark">Other stuff you can request:</p>
          <ul className="space-y-1 text-sm text-foreground">
            <li>• <strong>HSE Induction</strong> — safety training stuff</li>
            <li>• <strong>Talk to Agent</strong> — live chat with the helpdesk team</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function TrackingStep() {
  const statuses = [
    { status: "Pending", desc: "Submitted and waiting for review", color: "bg-sage-light/60 text-sage-dark border-sage-mid/40", icon: "⏳" },
    { status: "Processing", desc: "Being handled by the team", color: "bg-sage-mid/30 text-sage-dark border-sage-mid/40", icon: "⚙️" },
    { status: "Completed", desc: "Request fulfilled and closed", color: "bg-sage-mid/50 text-sage-dark border-sage-mid/40", icon: "✅" },
  ];
  
  return (
    <>
      <Lead>
        Want to check on a request? Look it up by request type or Case ID (that's basically your request number).
      </Lead>
      <div className="space-y-6">
        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">Tracking your stuff:</p>
          <div className="space-y-2">
            {[
              { step: "Go to Requests section", icon: "📋" },
              { step: "Find yours by type or Case ID", icon: "🔍" },
              { step: "Use Search/Filter if you have lots of requests", icon: "⚙️" },
              { step: "Check the status tag", icon: "🏷️" },
              { step: "Click it to see the full story", icon: "👆" },
            ].map(({ step, icon }, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-lg">{icon}</span>
                <p className="text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">What the statuses mean:</p>
          <div className="space-y-3">
            {statuses.map(({ status, desc, color, icon }) => (
              <div key={status} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-medium text-sm">{status}</p>
                  <p className="text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sage-mid/40 bg-sage-light/40 p-4">
          <p className="mb-2 text-sm font-semibold text-sage-dark">💡 Pro tip</p>
          <p className="text-sm text-foreground">
            Check in on your requests from time to time. If we need more info, the faster you reply, the faster we can help.
          </p>
        </div>
      </div>
    </>
  );
}

function NewsStep() {
  return <TrackingStep />;
}

function ChatStep() {
  return (
    <>
      <Lead>
        Here's where you update your account info and learn about the request guidelines (spoiler: they're pretty straightforward).
      </Lead>
      <div className="space-y-6">
        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">You can change:</p>
          <div className="space-y-2">
            {[
              { icon: "👤", label: "Username", desc: "Your display name" },
              { icon: "📱", label: "Phone number", desc: "Contact number" },
              { icon: "🔒", label: "Password", desc: "Login password" },
              { icon: "🔐", label: "Two-Factor Authentication", desc: "Extra security with Google Authenticator" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Click your profile picture (top-right corner) → My Account
          </p>
        </div>

        <div className="rounded-2xl border border-sage-light bg-white/60 p-5">
          <p className="mb-3 font-medium text-foreground">A few guidelines to keep in mind:</p>
          <div className="space-y-3">
            {[
              { num: "1", text: "POCs only", desc: "Only authorized POCs can submit (that's you!)" },
              { num: "2", text: "Double-check everything", desc: "Names, plates, items — make sure it's right" },
              { num: "3", text: "Plan ahead", desc: "Submit at least 24 hours before you need it" },
              { num: "4", text: "Keep us updated", desc: "POC changed? Let us know" },
            ].map(({ num, text, desc }) => (
              <div key={num} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-dark text-xs font-bold text-primary-foreground">
                  {num}
                </span>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{text}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sage-mid/40 bg-sage-light/40 p-4">
          <p className="mb-2 text-sm font-semibold text-sage-dark">💡 Not a POC?</p>
          <p className="text-sm text-foreground">
            No worries — just ask your designated POC to submit the request for you. They'll know what to do.
          </p>
        </div>
      </div>
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
    case "tracking":
      return <TrackingStep />;
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
      <h2 className="mb-4 flex items-center justify-center gap-2 text-3xl font-light text-foreground">
        <Star className="h-6 w-6 fill-sage-mid text-sage-mid" />
        That's it!
      </h2>
      <p className="mx-auto mb-10 max-w-md text-muted-foreground">
        You're good to go. Jump into the web portal or grab the mobile app whenever you need to handle requests at Agila Subic.
      </p>

      <div className="mb-10 grid gap-3 text-left sm:grid-cols-2">
        {STEPS.map((s, i) => {
          const Icon: LucideIcon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => onJump(i + 1)}
              className="flex items-center gap-3 rounded-2xl border border-sage-light bg-white/60 px-5 py-3 text-sm transition-colors hover:border-sage-mid"
            >
              <Icon className="h-4 w-4 shrink-0 text-sage-dark/60" />
              <span>
                <span className="font-medium text-foreground">{s.title}</span>
                <span className="block text-xs text-muted-foreground">Revisit this step</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        className="w-full rounded-2xl border border-sage-mid/30 bg-white py-4 font-display font-medium text-sage-dark transition-colors hover:bg-sage-light/20"
      >
        Start over from the beginning
      </button>
    </section>
  );
}
