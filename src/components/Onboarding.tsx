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
    setTimeout(() => {
      setPhase(newPhase);
      setIsTransitioning(false);
    }, 100);
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
        <div className={isTransitioning ? "animate-step-out" : "animate-step-in"}>
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
                  in any web browser (Chrome, Edge, Safari, etc.)
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  2
                </span>
                <span className="pt-0.5">Type your work email address</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  3
                </span>
                <span className="pt-0.5">Type your password</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  4
                </span>
                <span className="pt-0.5">Click the Sign In button</span>
              </li>
            </ol>
          </Panel>
          <Tip title="Extra security">
            If your account has extra security enabled, you'll also need to enter a 6-digit code from your authenticator app.
          </Tip>
        </>
      ) : (
        <>
          <Panel title="Setting up the app">
            <Steps
              items={[
                'On your phone, open the App Store (iPhone) or Play Store (Android)',
                'Search for "FacilityBot" and download the app',
                "Open the app and log in with your work email and password",
                "Allow notifications so you get updates on your requests",
              ]}
            />
          </Panel>
          <Tip title="Stay in sync">
            Changes you make on your phone will show up on the website, and vice versa. They're always connected.
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
      desc: "Submit and track all your requests",
      detail:
        "This is where you'll register visitors, request item removals, and report facility issues. You can check the progress of each request until it's completed.",
    },
    {
      title: "Broadcasts",
      desc: "Important announcements from the facility team",
      detail:
        "Check here for updates about power outages, construction work, safety drills, and other facility news. It's a good idea to review this before planning any work on site.",
    },
  ];

  return (
    <>
      <Lead>
        After signing in, you'll see two main sections. Most of your work happens in Requests.
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

      <Tip title="Your dashboard">
        When you first log in, you'll see your most recent requests right on the home screen.
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
        Register any visitors, guests, or deliveries coming to the shipyard. You'll need to provide their names, vehicle details, and what they're bringing.
      </Lead>

      <Panel title="What information to include">
        <Rows
          items={[
            { label: "Full names", desc: "First and last name of each person visiting" },
            { label: "Vehicle license plates", desc: "All cars, trucks, or vans entering the site" },
            { label: "Items being brought in", desc: "Tools, equipment, or materials they're carrying" },
          ]}
        />
      </Panel>

      <PracticeForm>
        <Field label="Visitor names (required)">
          <textarea
            rows={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: John Smith, Maria Garcia"
            className={inputClass}
          />
        </Field>
        <Field label="Vehicle license plate number(s)">
          <input
            type="text"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Example: ABC 1234, XYZ 5678"
            className={inputClass}
          />
        </Field>
        <Field label="Items or equipment being brought in">
          <textarea
            rows={2}
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Example: Laptop, safety helmet, toolbox"
            className={inputClass}
          />
        </Field>
        {(name || vehicle || items) && (
          <p className="text-sm text-muted-foreground">
            Preview: <span className="font-medium text-foreground">{name || "Visitor"}</span>
            {vehicle ? ` · Vehicle: ${vehicle}` : ""}
            {items ? ` · Bringing: ${items}` : ""}
          </p>
        )}
      </PracticeForm>

      <Tip title="Important reminder">
        If visitors are bringing items that will leave later, make sure to link that removal request back to this entry.
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
        Need to take tools, equipment, or materials out of the shipyard? Submit a removal request first. Security will check everything at the gate.
      </Lead>

      <Panel title="What information to include">
        <Rows
          items={[
            { label: "Complete list of items", desc: "Describe each item you're removing in detail" },
            { label: "Photos (if required)", desc: "Needed for waste, garbage, or hazardous materials" },
            { label: "Original delivery reference", desc: "Link to the request when these items came in, if applicable" },
          ]}
        />
      </Panel>

      <PracticeForm>
        <Field label="What are you removing? (required)">
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Example: 2 oxygen tanks, welding torch, power drill"
            className={inputClass}
          />
        </Field>
        <Field label="Where is it located? (required)">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Example: Dry Dock 2, near crane"
            className={inputClass}
          />
        </Field>
        {desc && location && (
          <p className="text-sm text-muted-foreground">
            Once submitted, you'll receive a reference number like{" "}
            <span className="font-medium text-foreground">AGL-2471</span>. Show this to security at the gate.
          </p>
        )}
      </PracticeForm>

      <Tip title="Double-check before submitting">
        Security will verify everything against your list at the exit gate, so make sure all details are accurate.
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
        Report any facility problems or request services like power, water, lift access, or emergency support.
      </Lead>

      <Panel title="Types of service requests">
        <div className="grid gap-2 sm:grid-cols-2">
          {["Power supply issues", "Water problems", "Lift or crane access", "Emergency services"].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium"
            >
              {label}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Emergency services include ambulance, fire response, and safety training sessions.
        </p>
      </Panel>

      <PracticeForm>
        <Field label="What's the problem? (required)">
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Example: Power outlet not working, water pipe leaking"
            className={inputClass}
          />
        </Field>
        <Field label="Where is it? (required)">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Example: Building A, Floor 2, Room 201"
            className={inputClass}
          />
        </Field>
        {desc && location && (
          <p className="text-sm text-muted-foreground">
            Your request will be marked as <span className="font-medium text-foreground">Pending</span> and the facility team will review it shortly.
          </p>
        )}
      </PracticeForm>

      <Tip title="Need help now?">
        You can also chat directly with the helpdesk team or book HSE safety training sessions through the app.
      </Tip>
    </>
  );
}

function TrackingStep() {
  const [selected, setSelected] = useState("Pending");
  const statuses = [
    { status: "Pending", desc: "Your request has been received and is waiting to be reviewed" },
    { status: "Processing", desc: "The team is currently working on your request" },
    { status: "Completed", desc: "Your request has been finished and closed" },
  ];

  return (
    <>
      <Lead>
        Find any of your requests by searching for its reference number or by type. You can see exactly what stage it's at.
      </Lead>

      <Panel title="How to find your requests">
        <Steps
          items={[
            "Click on the Requests section in the menu",
            "Look for your request by type (Visitor, Removal, Service) or reference number",
            "Use the search bar if you have many requests",
            "Click on a request to see its full history and current status",
          ]}
        />
      </Panel>

      <Panel title="Understanding request statuses">
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

      <Tip title="Stay updated">
        Check back on open requests regularly. The faster you respond to any questions from the team, the quicker your request gets completed.
      </Tip>
    </>
  );
}

function AccountStep() {
  return (
    <>
      <Lead>
        Manage your account settings and review important guidelines for submitting requests.
      </Lead>

      <Panel title="Update your profile (click your profile picture, then My Account)">
        <Rows
          items={[
            { label: "Display name", desc: "The name that appears on your requests" },
            { label: "Phone number", desc: "Your contact number for urgent updates" },
            { label: "Password", desc: "Change your login password" },
            { label: "Extra security", desc: "Turn on 6-digit code protection for added security" },
          ]}
        />
      </Panel>

      <Panel title="Important guidelines for requests">
        <Steps
          items={[
            "Only authorized contact persons can submit requests for their company",
            "Double-check all names, license plates, and item lists before submitting",
            "Submit requests at least 24 hours before you need them processed",
            "Notify the facility team if your company's contact person changes",
          ]}
        />
      </Panel>

      <Tip title="Not an authorized person?">
        Ask your company's designated contact person to submit requests on your behalf.
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
