import type { ReactNode } from "react";
import {
  Bell,
  ClipboardList,
  Megaphone,
  Search,
  UserRound,
} from "lucide-react";
import facilitybotLogo from "@/assets/facilitybot-logo.png";

export function Lesson({
  visual,
  children,
}: {
  visual: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="lg:sticky lg:top-6">{visual}</div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function PhotoCard({
  src,
  alt,
  caption,
  className = "h-52 sm:h-64",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <img src={src} alt={alt} className={`w-full object-cover ${className}`} />
      {caption ? (
        <figcaption className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function BrowserFrame({
  url = "agilasubic.facilitybot.co",
  children,
  caption,
  urlPin,
}: {
  url?: string;
  children: ReactNode;
  caption?: string;
  urlPin?: number;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 border-b border-border/70 bg-muted/80 px-3 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
        </span>
        <span className="relative min-w-0 flex-1 truncate rounded-full bg-background px-3 py-1 text-center text-[11px] font-medium text-muted-foreground">
          {url}
          {urlPin != null ? <Pin n={urlPin} className="-right-1 -top-2" /> : null}
        </span>
      </div>
      <div className="bg-background">{children}</div>
      {caption ? (
        <figcaption className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function PhoneFrame({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: string;
}) {
  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border-[6px] border-foreground bg-card p-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="relative overflow-hidden rounded-[1.45rem] bg-background">
          <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-muted" aria-hidden="true" />
          {children}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function Pin({
  n,
  className,
}: {
  n: number;
  className?: string;
}) {
  return (
    <span
      className={`absolute z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground shadow-sm animate-pin ${className ?? ""}`}
    >
      {n}
    </span>
  );
}

export function Callouts({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            {i + 1}
          </span>
          <span className="pt-0.5">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function FieldMock({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground">{value}</div>
    </div>
  );
}

export function LoginScreen() {
  return (
    <BrowserFrame caption="The sign-in page you'll see in your browser." urlPin={1}>
      <div className="relative px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-xs text-center">
          <img src={facilitybotLogo} alt="" className="mx-auto h-10 w-auto" />
          <p className="mt-4 text-sm font-semibold">Sign in to Agila Subic</p>
          <div className="relative mt-5 space-y-3 text-left">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Work email
              </p>
              <div className="relative rounded-lg border-2 border-accent bg-background px-3 py-2 text-xs text-muted-foreground">
                you@company.com
                <Pin n={2} className="-right-2 -top-2" />
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Password
              </p>
              <div className="relative rounded-lg border border-border bg-background px-3 py-2 text-xs tracking-widest text-muted-foreground">
                ••••••••
                <Pin n={3} className="-right-2 -top-2" />
              </div>
            </div>
            <div className="relative">
              <div className="rounded-lg bg-foreground py-2.5 text-center text-xs font-semibold text-primary-foreground">
                Sign In
              </div>
              <Pin n={4} className="-right-2 -top-2" />
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AppScreen() {
  return (
    <PhoneFrame caption="Same account on the FacilityBot mobile app.">
      <div className="px-4 pb-6 pt-4">
        <img src={facilitybotLogo} alt="" className="mx-auto h-8 w-auto" />
        <p className="mt-3 text-center text-sm font-semibold">Welcome back</p>
        <div className="relative mt-4 space-y-2">
          <Pin n={3} className="right-0 top-0" />
          <div className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">Work email</div>
          <div className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">Password</div>
          <div className="rounded-xl bg-foreground py-2.5 text-center text-xs font-semibold text-primary-foreground">
            Log in
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Allow notifications when asked</p>
      </div>
    </PhoneFrame>
  );
}

export function DashboardScreen({
  highlight,
}: {
  highlight: "requests" | "broadcasts";
}) {
  return (
    <BrowserFrame caption="Home after you sign in — most work happens in Requests.">
      <div className="flex min-h-[270px]">
        <aside className="w-[7.5rem] shrink-0 space-y-1 border-r border-border/70 bg-muted/40 p-2.5 text-[11px]">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Menu
          </p>
          <div
            className={`relative flex items-center gap-2 rounded-lg px-2 py-2 font-medium ${
              highlight === "requests" ? "bg-accent/20 text-foreground" : "text-muted-foreground"
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Requests
            {highlight === "requests" ? <Pin n={1} className="-right-2 -top-1" /> : null}
          </div>
          <div
            className={`relative flex items-center gap-2 rounded-lg px-2 py-2 font-medium ${
              highlight === "broadcasts" ? "bg-accent/20 text-foreground" : "text-muted-foreground"
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            Broadcasts
            {highlight === "broadcasts" ? <Pin n={2} className="-right-2 -top-1" /> : null}
          </div>
        </aside>
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">
              {highlight === "requests" ? "Your requests" : "Facility news"}
            </p>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          {highlight === "requests" ? (
            <div className="space-y-2">
              {[
                ["Visitor — Smith, Garcia", "Pending"],
                ["Pull-out — welding kit", "Processing"],
                ["Service — power outlet", "Completed"],
              ].map(([title, status]) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2.5"
                >
                  <span className="text-xs font-medium">{title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {["Power shutdown — Dry Dock 2, 10:00–12:00", "Safety drill this Friday"].map((item) => (
                <div key={item} className="rounded-xl border border-border/70 bg-card px-3 py-2.5 text-xs">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function VisitorScreen() {
  return (
    <BrowserFrame caption="Visitor / delivery request — names, plates, and items.">
      <div className="relative p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">New visitor request</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Pin n={1} className="-left-1 -top-1" />
            <FieldMock label="Visitor names" value="John Smith, Maria Garcia" wide />
          </div>
          <div className="relative">
            <Pin n={2} className="-left-1 -top-1" />
            <FieldMock label="License plates" value="ABC 1234" />
          </div>
          <div className="relative sm:col-span-2">
            <Pin n={3} className="-left-1 -top-1" />
            <FieldMock label="Items brought in" value="Laptop, helmet, toolbox" wide />
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-foreground px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
          Submit request
        </div>
      </div>
    </BrowserFrame>
  );
}

export function PulloutScreen() {
  return (
    <BrowserFrame caption="Pull-out request — security checks this list at the gate.">
      <div className="relative p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">New pull-out</p>
        <div className="space-y-3">
          <div className="relative">
            <Pin n={1} className="-left-1 -top-1" />
            <FieldMock label="Items leaving site" value="2 oxygen tanks, welding torch, drill" wide />
          </div>
          <div className="relative">
            <Pin n={2} className="-left-1 -top-1" />
            <FieldMock label="Location" value="Dry Dock 2, near crane" />
          </div>
          <div className="relative rounded-lg border border-dashed border-accent/70 bg-sage-light/50 px-3 py-3 text-xs text-muted-foreground">
            <Pin n={3} className="-left-1 -top-1" />
            Photo upload — required for waste or hazardous materials
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          After submit you'll get a reference like <span className="font-semibold text-foreground">AGL-2471</span>
        </p>
      </div>
    </BrowserFrame>
  );
}

export function ServiceScreen() {
  const types = ["Power", "Water", "Lift / crane", "Emergency"];
  return (
    <BrowserFrame caption="Service request — say what's wrong and exactly where it is.">
      <div className="p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">New service request</p>
        <div className="relative mb-3 grid grid-cols-2 gap-2">
          <Pin n={1} className="-left-1 -top-1" />
          {types.map((t, i) => (
            <div
              key={t}
              className={`rounded-xl border px-3 py-2 text-center text-[11px] font-medium ${
                i === 0 ? "border-accent bg-accent/10" : "border-border/70"
              }`}
            >
              {t}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Pin n={2} className="-left-1 -top-1" />
            <FieldMock label="What's the problem?" value="Power outlet not working" wide />
          </div>
          <div className="relative">
            <Pin n={3} className="-left-1 -top-1" />
            <FieldMock label="Where?" value="Building A, Floor 2, Room 201" />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function TrackingScreen({ status }: { status: "Pending" | "Processing" | "Completed" }) {
  const tone =
    status === "Completed"
      ? "bg-accent/20 text-foreground"
      : status === "Processing"
        ? "bg-foreground text-primary-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <BrowserFrame caption="Search by type or reference number, then open the request.">
      <div className="p-4 sm:p-5">
        <div className="relative mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Search AGL-2471 or Visitor…
          <Pin n={1} className="-right-1 -top-2" />
        </div>
        <div className="space-y-2">
          <div className="relative rounded-xl border-2 border-accent bg-card px-3 py-3">
            <Pin n={2} className="-right-1 -top-2" />
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold">AGL-2471 · Pull-out</p>
                <p className="text-[11px] text-muted-foreground">Welding kit · Dry Dock 2</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{status}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 px-3 py-3 opacity-60">
            <p className="text-xs font-medium">AGL-2460 · Visitor</p>
            <p className="text-[11px] text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AccountScreen() {
  return (
    <BrowserFrame caption="Open your photo, then My Account to update details.">
      <div className="relative flex min-h-[250px]">
        <div className="flex-1 p-4">
          <p className="text-sm font-semibold">Dashboard</p>
          <p className="mt-2 text-xs text-muted-foreground">Your latest requests appear here.</p>
        </div>
        <div className="relative m-3 w-44 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
          <Pin n={1} className="-left-2 -top-2" />
          <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold">My Account</p>
              <p className="text-[10px] text-muted-foreground">you@company.com</p>
            </div>
          </div>
          {["Display name", "Phone number", "Password", "Extra security"].map((item, i) => (
            <p key={item} className="relative py-1.5 text-xs text-muted-foreground">
              {item}
              {i === 0 ? <Pin n={2} className="right-0 top-1" /> : null}
            </p>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}
