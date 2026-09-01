import { useEffect, useState } from "react";
import {
  QrCode,
  LayoutGrid,
  UserPlus,
  PackageCheck,
  Wrench,
  ListChecks,
  UserCog,
  Check,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import logo from "@/assets/agila-subic-logo.png";
import facilitybotLogo from "@/assets/facilitybot-logo.png";

const STEPS = [
  { key: "qr", title: "How to Access", short: "Access", icon: QrCode },
  { key: "menu", title: "Key Features", short: "Features", icon: LayoutGrid },
  { key: "visitor", title: "Visitors & Deliveries", short: "Visitors", icon: UserPlus },
  { key: "gatepass", title: "Removing Items", short: "Removals", icon: PackageCheck },
  { key: "service", title: "Service Requests", short: "Service", icon: Wrench },
  { key: "tracking", title: "Track Your Requests", short: "Tracking", icon: ListChecks },
  { key: "chat", title: "Account & Support", short: "Account", icon: UserCog },
] as const;

const STORAGE_KEY = "facilitybot-onboarding-v1";

export default function Onboarding() {
  // 0 = welcome, 1..7 = steps, 8 = finish
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const total = STEPS.length;

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

  const handlePhaseChange = (newPhase: number) => {
    setIsTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setPhase(newPhase);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      )
        return;
      if (e.key === "ArrowRight") {
        const currentPhase = phase;
        if (currentPhase >= 1 && currentPhase <= total) complete(currentPhase);
        handlePhaseChange(Math.min(currentPhase + 1, total + 1));
      }
      if (e.key === "ArrowLeft") {
        handlePhaseChange(Math.max(phase - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, total, isTransitioning]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <div 
          className={`transition-opacity duration-200 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          style={{ minHeight: '500px' }}
        >
          {phase === 0 && (
            <Welcome
              done={done}
              onStart={() => handlePhaseChange(done.length > 0 ? Math.min(done.length + 1, total) : 1)}
              onJump={handlePhaseChange}
              onReset={() => setDone([])}
            />
          )}

          {phase > 0 && phase <= total && (
            <StepView
              key={phase}
              index={phase}
              total={total}
              done={done}
              onJump={handlePhaseChange}
              onBack={() => handlePhaseChange(phase - 1)}
            onNext={() => {
              complete(phase);
              handlePhaseChange(phase + 1);
            }}
          />
        )}

        {phase === total + 1 && (
          <Finish
            onRestart={() => {
              setDone([]);
              handlePhaseChange(0);
            }}
            onJump={handlePhaseChange}
          />
        )}
        </div>
      </main>
    </div>
  );
}

/* ---------- shared primitives ---------- */

function Lockup() {
  return (
    <div className="flex items-center justify-center gap-4">
      <img src={logo} alt="Agila Subic" width={480} height={80} className="h-7 w-auto" />
      <span className="h-6 w-px bg-border" aria-hidden="true" />
      <img
        src={facilitybotLogo}
        alt="FacilityBot"
        width={300}
        height={300}
        className="h-8 w-auto"
      />
    </div>
  );
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {title && (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function Rows({ items }: { items: { label: string; desc?: string }[] }) {
  return (
    <ul className="divide-y divide-border/60">
      {items.map((it) => (
        <li key={it.label} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{it.label}</p>
            {it.desc && <p className="text-sm text-muted-foreground">{it.desc}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {i + 1}
          </span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-accent pl-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed text-muted-foreground">{children}</p>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent";

function PracticeForm({ children }: { children: React.ReactNode }) {
  return (
    <Panel title="Practice form — nothing is submitted">
      <div className="space-y-4">{children}</div>
    </Panel>
  );
}

/* ---------- welcome ---------- */

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
  const next = Math.min(done.length + 1, STEPS.length);

  return (
    <section className="flex flex-col items-center text-center">
      <Lockup />

      <h1 className="mt-12 font-display text-4xl font-semibold tracking-tight">
        Welcome to FacilityBot
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Seven short steps on how to raise and track requests at the Agila Subic shipyard campus.
      </p>

      <div className="mt-12 grid w-full gap-3 sm:grid-cols-2">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const isDone = done.includes(n);
          const isNext = started ? n === next : n === 1;
          return (
            <button
              key={s.key}
              onClick={() => onJump(n)}
              className={`flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-colors ${
                isNext ? "border-accent" : "border-border/70 hover:border-accent/60"
              } ${i === STEPS.length - 1 ? "sm:col-span-2" : ""}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone
                    ? "bg-accent text-accent-foreground"
                    : isNext
                      ? "bg-foreground text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className="text-sm font-medium">{s.title}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onStart}
        className="mt-12 rounded-full bg-foreground px-10 py-4 font-medium text-primary-foreground transition-transform hover:shadow-lg active:scale-95"
      >
        {started ? "Continue where you left off" : "Start onboarding"}
      </button>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {started ? `${done.length} of ${STEPS.length} done` : `${STEPS.length} steps · about 5 min`}
      </p>

      {started && (
        <button
          onClick={onReset}
          className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Start over
        </button>
      )}
    </section>
  );
}

/* ---------- step shell ---------- */

function StepView({
  index,
  total,
  done,
  onJump,
  onBack,
  onNext,
}: {
  index: number;
  total: number;
  done: number[];
  onJump: (n: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const step = STEPS[index - 1]!;
  const Icon: LucideIcon = step.icon;

  return (
    <section>
      <div className="mb-10 flex items-center justify-between gap-6">
        <Lockup />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step {index} of {total}
        </span>
      </div>

      <div className="mb-10 flex gap-1.5" role="tablist" aria-label="Onboarding steps">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const active = n === index;
          return (
            <button
              key={s.key}
              onClick={() => onJump(n)}
              aria-label={`Step ${n}: ${s.title}`}
              aria-current={active ? "step" : undefined}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                active
                  ? "bg-foreground"
                  : done.includes(n)
                    ? "bg-accent"
                    : "bg-border hover:bg-accent/50"
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-3xl font-semibold tracking-tight">{step.title}</h2>
      </div>

      <div className="mt-6 space-y-6">
        <StepBody stepKey={step.key} />
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-border/70 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-primary-foreground transition-transform hover:shadow-lg active:scale-95"
        >
          {index === total ? "Finish" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Tip: use ← and → to move between steps
      </p>
    </section>
  );
}

/* ---------- steps ---------- */

function QrStep() {
  const [method, setMethod] = useState<"web" | "app">("web");

  return (
    <>
      <Lead>Use FacilityBot in your browser or on your phone — same account either way.</Lead>

      <div className="inline-flex rounded-full border border-border p-1">
        {(["web", "app"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            aria-pressed={method === m}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              method === m ? "bg-foreground text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "web" ? "Web browser" : "Mobile app"}
          </button>
        ))}
      </div>

      {method === "web" ? (
        <>
          <Panel title="Signing in on the web">
            <ol className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  1
                </span>
                <span className="pt-0.5">
                  Open{" "}
                  <a
                    href="https://agilasubic.facilitybot.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 transition-colors hover:text-accent"
                  >
                    agilasubic.facilitybot.co
                  </a>{" "}
                  in your browser
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  2
                </span>
                <span className="pt-0.5">Enter your email or company domain</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  3
                </span>
                <span className="pt-0.5">Enter your password</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  4
                </span>
                <span className="pt-0.5">Select Sign In</span>
              </li>
            </ol>
          </Panel>
          <Tip title="Good to know">
            You can also sign in with Google Authenticator if two-factor is enabled on your account.
          </Tip>
        </>
      ) : (
        <>
          <Panel title="Setting up the app">
            <Steps
              items={[
                'Search "FacilityBot" in the App Store or Google Play',
                "Download and install it",
                "Log in with the same email and password",
                "Turn on notifications for request updates",
              ]}
            />
          </Panel>
          <Tip title="Good to know">
            Everything syncs between phone and desktop, so you can start a request anywhere.
          </Tip>
        </>
      )}
    </>
  );
}

function MenuStep() {
  const [open, setOpen] = useState<string | null>("Requests");
  const features = [
    {
      title: "Requests",
      desc: "Create, access, track and update your requests",
      detail:
        "This is where you raise visitor entries, item removals and service requests — and where you follow their status until they close.",
    },
    {
      title: "Broadcasts",
      desc: "Announcements and advisories from the facility team",
      detail:
        "Power interruptions, road works, drills and safety advisories are posted here. Check it before planning site activity.",
    },
  ];

  return (
    <>
      <Lead>
        There are two main areas after you sign in. You will spend most of your time in Requests.
      </Lead>

      <div className="space-y-3">
        {features.map((f) => {
          const isOpen = open === f.title;
          return (
            <div key={f.title} className="rounded-2xl border border-border/70 bg-card">
              <button
                onClick={() => setOpen(isOpen ? null : f.title)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span>
                  <span className="block text-sm font-medium">{f.title}</span>
                  <span className="block text-sm text-muted-foreground">{f.desc}</span>
                </span>
                <span
                  className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {f.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Tip title="Preview pane">
        Your most recent requests appear on the main screen the moment you sign in.
      </Tip>
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
        Use this for visitors, guests or deliveries coming into the shipyard. Declare who is coming,
        what vehicles they bring, and any equipment with them.
      </Lead>

      <Panel title="What to include">
        <Rows
          items={[
            { label: "Full names", desc: "Everyone entering the campus" },
            { label: "Plate numbers", desc: "Any vehicles coming in" },
            { label: "Items & equipment", desc: "Anything they are bringing with them" },
          ]}
        />
      </Panel>

      <PracticeForm>
        <Field label="Visitor names *">
          <textarea
            rows={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full names of all visitors"
            className={inputClass}
          />
        </Field>
        <Field label="Vehicle plate number(s)">
          <input
            type="text"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="e.g. ABC 1234"
            className={inputClass}
          />
        </Field>
        <Field label="Items / equipment brought in">
          <textarea
            rows={2}
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="List all items being brought in"
            className={inputClass}
          />
        </Field>
        {(name || vehicle || items) && (
          <p className="text-sm text-muted-foreground">
            Preview: <span className="font-medium text-foreground">{name || "Visitor"}</span>
            {vehicle ? ` · ${vehicle}` : ""}
            {items ? ` · ${items}` : ""}
          </p>
        )}
      </PracticeForm>

      <Tip title="Heads up">
        If something comes in now but leaves later, link the removal request back to this delivery.
      </Tip>
    </>
  );
}

function GatepassStep() {
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");

  return (
    <>
      <Lead>
        Use this to take items or equipment out of the campus. If the items were delivered earlier,
        make sure they were declared on the way in.
      </Lead>

      <Panel title="What to include">
        <Rows
          items={[
            { label: "List of items to remove", desc: "Complete details and descriptions" },
            { label: "Photos for hazardous items", desc: "Required for waste, garbage or hazardous materials" },
            { label: "Link to the original delivery", desc: "If the items were brought in earlier" },
          ]}
        />
      </Panel>

      <PracticeForm>
        <Field label="Equipment / items description *">
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Equipment, tools or materials to be removed"
            className={inputClass}
          />
        </Field>
        <Field label="Dock location *">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dry Dock 1, Building A"
            className={inputClass}
          />
        </Field>
        {desc && location && (
          <p className="text-sm text-muted-foreground">
            Ready to submit — a case ID like{" "}
            <span className="font-medium text-foreground">AGL-2471</span> would be issued.
          </p>
        )}
      </PracticeForm>

      <Tip title="Quick reminder">
        Guards check everything at the gate against what you listed, so review the details before
        submitting.
      </Tip>
    </>
  );
}

function ServiceStep() {
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");

  return (
    <>
      <Lead>
        Raise a service request for anything broken or not working — power, water, lift station and
        general support.
      </Lead>

      <Panel title="What you can request">
        <div className="grid gap-2 sm:grid-cols-2">
          {["Power supply", "Water supply", "Lift station", "Support services"].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium"
            >
              {label}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Support services covers ambulance, fire truck, training sessions and other facility needs.
        </p>
      </Panel>

      <PracticeForm>
        <Field label="Fault description *">
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the issue in detail"
            className={inputClass}
          />
        </Field>
        <Field label="Fault location *">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Building A, Floor 2, Room 201"
            className={inputClass}
          />
        </Field>
        {desc && location && (
          <p className="text-sm text-muted-foreground">
            Logged as <span className="font-medium text-foreground">Pending</span> — the helpdesk
            picks it up from here.
          </p>
        )}
      </PracticeForm>

      <Tip title="Also available">
        HSE induction bookings and Talk to Agent live chat with the helpdesk team.
      </Tip>
    </>
  );
}

function TrackingStep() {
  const [selected, setSelected] = useState("Pending");
  const statuses = [
    { status: "Pending", desc: "Submitted and waiting for review" },
    { status: "Processing", desc: "Being handled by the team" },
    { status: "Completed", desc: "Request fulfilled and closed" },
  ];

  return (
    <>
      <Lead>
        Look up any request by type or Case ID to see exactly where it stands.
      </Lead>

      <Panel title="How to find a request">
        <Steps
          items={[
            "Open the Requests section",
            "Find yours by request type or Case ID",
            "Use search and filters if you have many requests",
            "Check the status tag, then open it for the full history",
          ]}
        />
      </Panel>

      <Panel title="What the statuses mean">
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s.status}
              onClick={() => setSelected(s.status)}
              aria-pressed={selected === s.status}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                selected === s.status
                  ? "border-accent bg-accent/10"
                  : "border-border/70 text-muted-foreground hover:border-accent/60"
              }`}
            >
              {s.status}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {statuses.find((s) => s.status === selected)?.desc}
        </p>
      </Panel>

      <Tip title="Pro tip">
        Check back on open requests — the faster you answer follow-up questions, the faster they
        close.
      </Tip>
    </>
  );
}

function AccountStep() {
  return (
    <>
      <Lead>
        Update your account details here, and keep these request guidelines in mind.
      </Lead>

      <Panel title="Profile picture → My Account">
        <Rows
          items={[
            { label: "Username", desc: "Your display name" },
            { label: "Phone number", desc: "Contact number" },
            { label: "Password", desc: "Login password" },
            { label: "Two-factor authentication", desc: "Extra security via Google Authenticator" },
          ]}
        />
      </Panel>

      <Panel title="Request guidelines">
        <Steps
          items={[
            "Only authorised POCs can submit requests",
            "Double-check names, plates and item lists",
            "Submit at least 24 hours before you need it",
            "Tell the facility team if the POC changes",
          ]}
        />
      </Panel>

      <Tip title="Not a POC?">
        Ask your designated point of contact to submit the request on your behalf.
      </Tip>
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
      return <AccountStep />;
  }
}

/* ---------- finish ---------- */

function Finish({ onRestart, onJump }: { onRestart: () => void; onJump: (n: number) => void }) {
  return (
    <section className="flex flex-col items-center text-center">
      <Lockup />

      <span className="mt-12 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Check className="h-5 w-5" />
      </span>

      <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">You're all set</h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        Sign in on the web portal or the mobile app whenever you need to raise or follow up on a
        request at Agila Subic.
      </p>

      <div className="mt-12 grid w-full gap-3 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => onJump(i + 1)}
            className={`flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left text-sm font-medium transition-colors hover:border-accent/60 ${
              i === STEPS.length - 1 ? "sm:col-span-2" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {i + 1}
            </span>
            {s.title}
          </button>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="mt-12 rounded-full border border-border px-8 py-3 text-sm font-medium transition-colors hover:border-accent"
      >
        Start over
      </button>
    </section>
  );
}
