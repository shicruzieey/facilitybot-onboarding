import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import qrPlacard from "@/assets/qr-placard.jpg";
import concierge from "@/assets/concierge.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FacilityBot Onboarding — A calm guide to your building" },
      {
        name: "description",
        content:
          "A simple, seven-step walkthrough of FacilityBot: QR access, visitor entry, gatepasses, service requests, announcements and chat support.",
      },
      { property: "og:title", content: "FacilityBot Onboarding" },
      {
        property: "og:description",
        content: "A calm, seven-step guide to using your building's facility services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  { key: "qr", eyebrow: "Access", title: "Quick access via QR" },
  { key: "menu", eyebrow: "Getting around", title: "What's in the menu" },
  { key: "visitor", eyebrow: "Guests", title: "Inviting a visitor" },
  { key: "gatepass", eyebrow: "Equipment", title: "Moving things in and out" },
  { key: "service", eyebrow: "Repairs", title: "Reporting an issue" },
  { key: "news", eyebrow: "Updates", title: "Staying in the loop" },
  { key: "chat", eyebrow: "Help", title: "Talking to a person" },
] as const;

function Onboarding() {
  // 0 = welcome, 1..7 = steps, 8 = finish
  const [phase, setPhase] = useState(0);
  const total = STEPS.length;
  const progress = Math.min(phase / (total + 1), 1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream text-foreground selection:bg-sage-mid/30">
      <div className="fixed inset-x-0 top-0 z-50 h-1.5 bg-sage-light/50">
        <div
          className="h-full bg-sage-dark transition-all duration-700 ease-in-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <main className="mx-auto max-w-xl px-6 py-20">
        {phase === 0 && <Welcome onStart={() => setPhase(1)} />}

        {phase > 0 && phase <= total && (
          <StepCard
            key={phase}
            index={phase}
            total={total}
            onBack={() => setPhase(phase - 1)}
            onNext={() => setPhase(phase + 1)}
          />
        )}

        {phase === total + 1 && <Finish onRestart={() => setPhase(0)} />}
      </main>

      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 p-12 opacity-20">
        <div className="h-64 w-64 rounded-full border border-sage-dark/20" />
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-sage-dark/20" />
      </div>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className="animate-step-in space-y-6 text-center">
      <img
        src={logo.url}
        alt="Agila Subic"
        width={480}
        height={80}
        className="mx-auto mb-6 h-10 w-auto"
      />
      <h1 className="text-4xl font-light tracking-tight text-foreground">Welcome home, neighbor.</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">
        FacilityBot is your quiet companion for navigating this building. Let's take a moment to see
        how things work here, one door at a time.
      </p>
      <button
        onClick={onStart}
        className="rounded-full bg-sage-dark px-8 py-4 font-display font-medium text-primary-foreground shadow-lg shadow-sage-dark/20 transition-all hover:bg-sage-dark/90 active:scale-[0.98]"
      >
        Begin the tour
      </button>
      <p className="text-sm text-muted-foreground">Seven short steps, about five minutes.</p>
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
      <div className="rounded-[32px] border border-sage-light bg-white/60 p-8 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-sage-dark/60">
          Step {index} of {total} · {step.eyebrow}
        </span>
        <h2 className="mb-6 mt-4 text-2xl text-foreground">{step.title}</h2>

        <StepBody stepKey={step.key} />

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={onBack}
            className="font-medium text-sage-dark/60 transition-colors hover:text-sage-dark"
          >
            Go back
          </button>
          <div className="flex space-x-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i + 1 === index ? "bg-sage-dark" : i + 1 < index ? "bg-sage-mid" : "bg-sage-light"
                }`}
              />
            ))}
          </div>
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
  return <p className="mb-8 leading-relaxed text-muted-foreground">{children}</p>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border-b border-sage-mid/30 bg-cream/40 px-1 py-3 transition-colors placeholder:text-muted-foreground/50 focus:border-sage-dark focus:outline-none";

function StepBody({ stepKey }: { stepKey: (typeof STEPS)[number]["key"] }) {
  switch (stepKey) {
    case "qr":
      return (
        <>
          <Lead>
            You'll find these placards at every entry point. Scanning one connects you to the
            building's services instantly — nothing to download.
          </Lead>
          <img
            src={qrPlacard}
            alt="A QR code placard mounted on a plaster wall beside a wooden door"
            width={800}
            height={600}
            className="w-full rounded-2xl object-cover"
          />
        </>
      );

    case "menu":
      return (
        <>
          <Lead>
            Once you're in, everything lives in one short menu. Three things cover almost every
            request.
          </Lead>
          <ul className="space-y-3">
            {[
              ["Visitor requests", "Let guests, vendors and contractors in"],
              ["Gatepass", "Move equipment or materials through the gate"],
              ["Service requests", "Report anything broken or uncomfortable"],
            ].map(([title, desc]) => (
              <li key={title} className="rounded-2xl bg-sage-light/40 px-5 py-4">
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ul>
        </>
      );

    case "visitor":
      return (
        <>
          <Lead>
            When someone's coming to see you, tell us ahead of time. Try filling this in — nothing is
            sent.
          </Lead>
          <div className="space-y-6">
            <Field label="Guest's full name">
              <input type="text" placeholder="e.g. Eleanor Shellstrop" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-8">
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
        </>
      );

    case "gatepass":
      return (
        <>
          <Lead>
            A gatepass covers anything physical crossing the gate. Choose the direction, describe the
            items, and submit a day ahead.
          </Lead>
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[
              ["Bringing in", "Deliveries and new equipment"],
              ["Taking out", "Removals and returns"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-sage-mid/30 px-5 py-4">
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <Field label="What are you moving?">
            <textarea
              rows={3}
              placeholder="Two office chairs and a monitor"
              className={inputClass}
            />
          </Field>
        </>
      );

    case "service":
      return (
        <>
          <Lead>
            Something not working? Tell us what and where, and how urgent it feels. We'll take it from
            there.
          </Lead>
          <div className="space-y-6">
            <Field label="What needs attention">
              <select className={inputClass}>
                <option>Power supply</option>
                <option>Water supply</option>
                <option>Lift station</option>
                <option>General maintenance</option>
              </select>
            </Field>
            <Field label="Where">
              <input type="text" placeholder="Building A, Floor 3, Room 301" className={inputClass} />
            </Field>
            <Field label="How urgent">
              <select className={inputClass}>
                <option>Whenever you can</option>
                <option>Sometime this week</option>
                <option>Today, please</option>
                <option>Right now — it's unsafe</option>
              </select>
            </Field>
          </div>
        </>
      );

    case "news":
      return (
        <>
          <Lead>
            Building announcements arrive in the same place — maintenance windows, holiday hours and
            safety notices.
          </Lead>
          <div className="space-y-4">
            {[
              ["Scheduled maintenance", "Dec 15, 2:00–4:00 AM. Services briefly unavailable."],
              ["Holiday hours", "The facility is closed Dec 25. Emergency support stays open."],
              ["New safety protocol", "Updated fire procedures — worth a two-minute read."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-sage-light bg-cream/50 px-5 py-4">
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </>
      );

    case "chat":
      return (
        <>
          <Lead>
            If anything is unclear, ask. A real person answers during working hours, and the bot can
            check your request status anytime.
          </Lead>
          <div className="rounded-2xl border border-sage-light bg-cream/50 p-5">
            <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-sage-light px-4 py-3 text-sm text-foreground">
              Hello! I'm here to help. What can I do for you today?
            </p>
            <div className="mt-4 flex gap-3">
              <input type="text" placeholder="Type your message…" className={inputClass} />
              <button className="rounded-full bg-sage-dark px-5 text-sm font-medium text-primary-foreground">
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
}

function Finish({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="animate-step-in text-center">
      <div className="mb-8 inline-block rounded-full bg-sage-light/20 p-1">
        <img
          src={concierge}
          alt="A smiling building concierge in the lobby"
          width={512}
          height={512}
          loading="lazy"
          className="h-24 w-24 rounded-full object-cover outline-4 outline-white"
        />
      </div>
      <h2 className="mb-4 text-3xl font-light text-foreground">You're all set.</h2>
      <p className="mx-auto mb-10 max-w-sm text-muted-foreground">
        The building is now at your fingertips. If you ever feel lost, look for the green placards or
        tap the chat bubble.
      </p>
      <button
        onClick={onRestart}
        className="w-full rounded-2xl border border-sage-mid/30 bg-white py-4 font-display font-medium text-sage-dark transition-colors hover:bg-sage-light/20"
      >
        Take the tour again
      </button>
    </section>
  );
}
