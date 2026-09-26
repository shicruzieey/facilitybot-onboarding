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
import qrPlacard from "@/assets/qr-placard.jpg";
import concierge from "@/assets/concierge.jpg";
import {
  AccountScreen,
  AppScreen,
  Callouts,
  DashboardScreen,
  Lesson,
  LoginScreen,
  PhotoCard,
  PulloutScreen,
  ServiceScreen,
  TrackingScreen,
  VisitorScreen,
} from "./TutorialVisuals";

const STEPS = [
  { key: "qr", title: "How to Access", short: "Access", icon: QrCode },
  { key: "menu", title: "Key Features", short: "Features", icon: LayoutGrid },
  { key: "visitor", title: "Visitors & Deliveries", short: "Visitors", icon: UserPlus },
  { key: "gatepass", title: "Pull-out Items", short: "Pull-out", icon: PackageCheck },
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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14">
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
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {title && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </div>
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
    <Panel title="Practice — nothing is submitted">
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

      <h1 className="mt-10 font-display text-4xl font-semibold tracking-tight">
        Welcome to FacilityBot
      </h1>
      <p className="mt-3 max-w-lg text-muted-foreground">
        A short visual guide to raising and tracking requests at the Agila Subic shipyard.
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <PhotoCard
          src={qrPlacard}
          alt="QR code placard on a wall beside a door"
          caption="Scan campus QR codes or open the web portal."
          className="h-44 sm:h-52"
        />
        <PhotoCard
          src={concierge}
          alt="Facility team member ready to help"
          caption="The facility team is here if you get stuck."
          className="h-44 sm:h-52"
        />
      </div>

      <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
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
        className="mt-10 rounded-full bg-foreground px-10 py-4 font-medium text-primary-foreground transition-transform hover:shadow-lg active:scale-95"
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
      <div className="mb-8 flex items-center justify-between gap-6">
        <Lockup />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step {index} of {total}
        </span>
      </div>

      <div className="mb-8 flex gap-1.5" role="tablist" aria-label="Onboarding steps">
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

      <div className="mt-10 flex items-center justify-between border-t border-border/70 pt-6">
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
        <Lesson visual={<LoginScreen />}>
          <Callouts
            items={[
              "Open agilasubic.facilitybot.co in Chrome, Edge, or Safari.",
              "Type your work email.",
              "Type your password.",
              "Click Sign In.",
            ]}
          />
          <p className="text-sm">
            <a
              href="https://agilasubic.facilitybot.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 transition-colors hover:text-accent"
            >
              agilasubic.facilitybot.co
            </a>
          </p>
          <PhotoCard
            src={qrPlacard}
            alt="QR code on a wall near an entrance"
            caption="QR codes around campus open this same login."
            className="h-40"
          />
          <Tip title="Extra security">
            If it is enabled, enter the 6-digit code from your authenticator app.
          </Tip>
        </Lesson>
      ) : (
        <Lesson
          visual={
            <div className="space-y-4">
              <AppScreen />
              <PhotoCard
                src={qrPlacard}
                alt="QR code placard"
                caption="You can still scan campus QR codes on your phone."
                className="h-36"
              />
            </div>
          }
        >
          <Callouts
            items={[
              "Open the App Store (iPhone) or Play Store (Android).",
              'Search for "FacilityBot" and install it.',
              "Log in with your work email and password.",
              "Allow notifications so you get request updates.",
            ]}
          />
          <Tip title="Stay in sync">
            Phone and website share the same requests. Change one, see it on the other.
          </Tip>
        </Lesson>
      )}
    </>
  );
}

function MenuStep() {
  const [open, setOpen] = useState<"requests" | "broadcasts">("requests");

  return (
    <Lesson visual={<DashboardScreen highlight={open} />}>
      <Lead>After signing in you will see two main sections. Tap a card to preview it.</Lead>
      <div className="space-y-3">
        {(
          [
            {
              key: "requests" as const,
              n: 1,
              title: "Requests",
              desc: "Visitors, pull-outs, and facility issues — plus status until done.",
            },
            {
              key: "broadcasts" as const,
              n: 2,
              title: "Broadcasts",
              desc: "Outages, construction, drills, and other site news.",
            },
          ] as const
        ).map((f) => {
          const isOpen = open === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setOpen(f.key)}
              aria-pressed={isOpen}
              className={`flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-colors ${
                isOpen ? "border-accent" : "border-border/70 hover:border-accent/60"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {f.n}
              </span>
              <span>
                <span className="block text-sm font-medium">{f.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{f.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Tip title="Your dashboard">Recent requests show on the home screen as soon as you log in.</Tip>
    </Lesson>
  );
}

function VisitorStep() {
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [items, setItems] = useState("");

  return (
    <>
      <Lesson visual={<VisitorScreen />}>
        <Lead>Register guests and deliveries before they arrive. Match the numbered fields on the screen.</Lead>
        <Callouts
          items={[
            "Full names of everyone visiting.",
            "License plates of every vehicle.",
            "Tools, equipment, or materials they are bringing in.",
          ]}
        />
        <Tip title="Pull-out later?">Link the later pull-out request back to this visitor entry.</Tip>
      </Lesson>
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
    </>
  );
}

function GatepassStep() {
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");

  return (
    <>
      <Lesson visual={<PulloutScreen />}>
        <Lead>Submit a pull-out before tools or materials leave the shipyard. Security checks the list at the gate.</Lead>
        <Callouts
          items={[
            "List every item in enough detail to identify it.",
            "Where it is on site right now.",
            "Photos if it is waste, garbage, or hazardous material.",
          ]}
        />
        <Tip title="Before you submit">The gate will match the vehicle load to this list, so keep it accurate.</Tip>
      </Lesson>
      <PracticeForm>
        <Field label="What are you pulling out? (required)">
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
            <span className="font-medium text-foreground">AGL-2471</span>. Show this to security at the
            gate.
          </p>
        )}
      </PracticeForm>
    </>
  );
}

function ServiceStep() {
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");

  return (
    <>
      <Lesson visual={<ServiceScreen />}>
        <Lead>Report a facility problem or ask for power, water, lift access, or emergency support.</Lead>
        <Callouts
          items={[
            "Pick the request type — including ambulance, fire, or HSE training.",
            "Describe the problem in plain language.",
            "Give a precise location (building, floor, room or dock).",
          ]}
        />
        <Tip title="Need help now?">Chat the helpdesk in the app, or book HSE training from there too.</Tip>
      </Lesson>
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
            Your request will be marked as <span className="font-medium text-foreground">Pending</span>{" "}
            and the facility team will review it shortly.
          </p>
        )}
      </PracticeForm>
    </>
  );
}

function TrackingStep() {
  const [selected, setSelected] = useState<"Pending" | "Processing" | "Completed">("Pending");
  const statuses = [
    { status: "Pending" as const, desc: "Received — waiting to be reviewed." },
    { status: "Processing" as const, desc: "The team is working on it now." },
    { status: "Completed" as const, desc: "Finished and closed." },
  ];

  return (
    <Lesson visual={<TrackingScreen status={selected} />}>
      <Lead>Find a request by type or reference number, then read its status.</Lead>
      <Callouts
        items={[
          "Open Requests, then search by visitor, pull-out, service, or number.",
          "Open a row to see history and the current status.",
        ]}
      />
      <Panel title="Tap a status to preview">
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
      <Tip title="Stay updated">Reply quickly if the team asks a question — that unblocks the request.</Tip>
    </Lesson>
  );
}

function AccountStep() {
  return (
    <Lesson
      visual={
        <div className="space-y-4">
          <AccountScreen />
          <PhotoCard
            src={concierge}
            alt="Facility team member"
            caption="Ask your company contact or the facility team if you cannot submit requests."
            className="h-40"
          />
        </div>
      }
    >
      <Lead>Update your profile and follow these rules when you submit.</Lead>
      <Callouts
        items={[
          "Click your photo, then My Account.",
          "Keep display name, phone, password, and extra security up to date.",
        ]}
      />
      <Panel title="Request guidelines">
        <Callouts
          items={[
            "Only authorized company contacts can submit.",
            "Check names, plates, and item lists before sending.",
            "Submit at least 24 hours ahead when you can.",
            "Tell the facility team if your company contact changes.",
          ]}
        />
      </Panel>
      <Tip title="Not an authorized person?">Ask your company's designated contact to submit for you.</Tip>
    </Lesson>
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

      <div className="mt-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/70">
        <img
          src={concierge}
          alt="Facility team ready to help"
          className="h-48 w-full object-cover object-top"
        />
      </div>

      <span className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Check className="h-5 w-5" />
      </span>

      <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">You're all set</h2>
      <p className="mt-4 max-w-md text-muted-foreground">
        Sign in on the web portal or the mobile app whenever you need to raise or follow up on a
        request at Agila Subic.
      </p>

      <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
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
        className="mt-10 rounded-full border border-border px-8 py-3 text-sm font-medium transition-colors hover:border-accent"
      >
        Start over
      </button>
    </section>
  );
}
