import type { ReactNode } from "react";
import type { ElectionScreen as ElectionCopy, OfficeScreen as OfficeCopy, StatusTone } from "@/content/types";
import * as I from "@/components/icons";
import { SetukMark } from "@/components/site/setuk-mark";

/*
 * The product heroes' screens, drawn in HTML from the dictionaries so they stay sharp, follow the
 * theme and speak Hindi on /hi. They copy the real app's frame (the navy sidebar of the eLetter
 * screenshot) and fill it with illustrative data; the page says so under them. Each is one picture to
 * a screen reader (role="img" with the page's own description), so its parts are hidden from it.
 * Cards that float off the window are positioned with top/left, never transform: they rise in with
 * the hero's `rise`, which owns transform.
 */

const TONE: Record<StatusTone, string> = {
  leaf: "bg-leaf-soft text-leaf",
  accent: "bg-accent-soft text-accent",
  muted: "bg-surface-2 text-muted",
  warn: "bg-danger/10 text-danger"
};

const FLOAT = "absolute rounded-2xl border border-line bg-surface/95 shadow-[0_28px_60px_-28px_color-mix(in_srgb,var(--ink)_50%,transparent)] backdrop-blur-sm";

/** The app's window: a title bar, the navy sidebar with the active page lit, and the page */
function Window({ app, nav, icons, active, children }: { app: string; nav: string[]; icons: I.Icon[]; active: number; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-line bg-bg shadow-[0_50px_100px_-50px_color-mix(in_srgb,var(--accent)_70%,transparent),0_20px_40px_-30px_color-mix(in_srgb,var(--ink)_40%,transparent)]">
      <div className="flex h-10 items-center gap-3 border-b border-line bg-surface px-4">
        <span className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-2.5 rounded-full bg-line" />)}</span>
        <span className="text-[12px] font-semibold text-muted">{app}</span>
        <span className="ml-auto size-6 rounded-full bg-accent-soft ring-2 ring-surface" />
      </div>
      <div className="grid sm:grid-cols-[152px_minmax(0,1fr)]">
        <div className="hidden flex-col gap-0.5 bg-accent p-3 text-accent-ink sm:flex">
          <span className="mb-3 block w-9 px-1 pt-1 [--mark-arch:var(--accent-ink)] [--mark-dot-mid:var(--accent-ink)]"><SetukMark /></span>
          {nav.map((n, i) => {
            const Icon = icons[i];
            return (
              <span key={n} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] leading-tight ${i === active ? "bg-accent-ink/15 font-semibold" : "opacity-70"}`}>
                <Icon size={13} className="shrink-0" />{n}
              </span>
            );
          })}
        </div>
        <div className="min-w-0 p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

/** The office product: the eLetter queue, an appointment confirmed, a citizen's SMS and the letters running late */
export function OfficeScreen({ s, label }: { s: OfficeCopy; label: string }) {
  const icons = [I.ChartLineUp, I.CalendarCheck, I.CalendarDots, I.EnvelopeSimple, I.Train, I.DoorOpen, I.UsersThree, I.ClipboardText];
  return (
    <div role="img" aria-label={label} className="relative px-2 pt-10 pb-20 sm:px-6 lg:pr-0">
      <div aria-hidden className="rise [--i:2]">
        <Window app={s.app} nav={s.nav} icons={icons} active={3}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-accent font-mono text-[13px] font-semibold text-accent-ink">23</span>
            <span className="min-w-0">
              <span className="block text-[15px] leading-tight font-semibold">{s.title}</span>
              <span className="block text-[11.5px] text-muted">{s.date}</span>
            </span>
            <span className="ml-auto hidden h-8 min-w-0 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[11px] text-muted md:flex">
              <I.MagnifyingGlass size={12} className="shrink-0" /><span className="truncate">{s.search}</span>
            </span>
          </div>
          <div className="mt-4 flex gap-1.5 overflow-hidden">
            {s.tabs.map((x, i) => (
              <span key={x.t} className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium ${i === 0 ? "bg-accent text-accent-ink" : "border border-line bg-surface text-muted"}`}>
                {x.t}<span className={`rounded-full px-1.5 font-mono text-[10px] ${i === 0 ? "bg-accent-ink/20" : "bg-surface-2"}`}>{x.n}</span>
              </span>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_76px] gap-3 border-b border-line bg-surface-2/60 px-3 py-2 text-[10.5px] font-semibold text-muted sm:grid-cols-[76px_minmax(0,1fr)_minmax(0,0.8fr)_80px]">
              <span>{s.cols[0]}</span><span>{s.cols[1]}</span><span className="hidden sm:block">{s.cols[2]}</span><span>{s.cols[3]}</span>
            </div>
            {s.rows.map((r) => (
              <div key={r.no} className="grid grid-cols-[72px_minmax(0,1fr)_76px] items-center gap-3 border-b border-line px-3 py-2.5 text-[11.5px] last:border-b-0 sm:grid-cols-[76px_minmax(0,1fr)_minmax(0,0.8fr)_80px]">
                <span className="font-mono text-[10.5px] text-muted">{r.no}</span>
                <span className="truncate font-medium">{r.name}</span>
                <span className="hidden truncate text-muted sm:block">{r.dept}</span>
                <span className={`inline-flex h-6 w-fit items-center rounded-full px-2 text-[10.5px] font-semibold ${TONE[r.tone]}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </Window>
      </div>

      {/* an appointment confirmed, off the top right */}
      <div aria-hidden className={`${FLOAT} rise top-0 right-2 w-[212px] p-3.5 [--i:4] sm:right-0 lg:-right-4`}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-accent"><I.CalendarCheck size={13} />{s.meeting.kicker}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-[20px] leading-none font-semibold tabular-nums">{s.meeting.time}</span>
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-leaf-soft px-2 text-[10px] font-semibold text-leaf"><I.Check size={10} weight="bold" />{s.meeting.status}</span>
        </p>
        <p className="mt-1.5 text-[12px] leading-snug">{s.meeting.t}</p>
      </div>

      {/* the letters running late, off the bottom right */}
      <div aria-hidden className={`${FLOAT} rise right-6 bottom-2 hidden w-[164px] p-3.5 [--i:5] md:block`}>
        <p className="text-[11px] font-medium text-muted">{s.pending.label}</p>
        <p className="mt-1 font-mono text-[28px] leading-none font-semibold text-danger tabular-nums">{s.pending.value}</p>
        <p className="mt-1.5 text-[11.5px] leading-snug text-muted">{s.pending.note}</p>
      </div>

      {/* what the citizen got, as a notification, off the bottom left */}
      <div aria-hidden className="rise absolute bottom-0 left-2 w-[260px] rounded-2xl bg-ink p-3.5 text-bg shadow-[0_28px_60px_-24px_color-mix(in_srgb,var(--ink)_70%,transparent)] [--i:6] sm:left-0 lg:-left-10">
        <p className="flex items-center gap-2 text-[11px] text-bg/65">
          <span className="grid size-5 place-items-center rounded-md bg-leaf text-leaf-ink"><I.ChatsCircle size={12} /></span>
          <span className="font-semibold text-bg">{s.sms.from}</span><span className="ml-auto">{s.sms.when}</span>
        </p>
        <p className="mt-2 text-[12px] leading-snug">{s.sms.body}</p>
      </div>
    </div>
  );
}

/*
 * The constituency, drawn as booths: the 248 cells of a 26 × 14 grid nearest its centre (measured
 * against a wobbling edge, so the outline reads as a place rather than a box). Coverage follows a
 * smooth wave over the grid, so it lands in patches as it does on the ground, and is split in the
 * legend's proportions: 32 not yet, 52 partly, the rest covered. One booth is lit, the one in the card.
 */
const COLS = 26;
const ROWS = 14;
type Booth = "ok" | "part" | "not" | "lit";
const BOOTHS: (Booth | null)[] = (() => {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const x = i % COLS, y = Math.floor(i / COLS);
    const dx = (x - (COLS - 1) / 2) / (COLS / 2), dy = (y - (ROWS - 1) / 2) / (ROWS / 2);
    const a = Math.atan2(dy, dx);
    const edge = 1 + 0.13 * Math.sin(3 * a + 0.6) + 0.07 * Math.sin(5 * a + 2.1);
    const wave = Math.sin(x * 0.55 + 1.3) + Math.sin(y * 0.8 + 0.4) + Math.sin((x - y) * 0.35 + 2);
    return { i, x, y, d: Math.hypot(dx, dy) / edge, wave };
  });
  const inside = [...cells].sort((p, q) => p.d - q.d).slice(0, 248);
  const out: (Booth | null)[] = Array(COLS * ROWS).fill(null);
  [...inside].sort((p, q) => p.wave - q.wave).forEach((c, k) => { out[c.i] = k < 32 ? "not" : k < 84 ? "part" : "ok"; });
  const lit = inside.filter((c) => out[c.i] === "ok").sort((p, q) => Math.hypot(p.x - 18, p.y - 4) - Math.hypot(q.x - 18, q.y - 4))[0];
  out[lit.i] = "lit";
  return out;
})();
const DOT: Record<Booth, string> = {
  ok: "bg-accent",
  part: "bg-accent/35",
  not: "bg-ink/12",
  lit: "bg-leaf ring-2 ring-leaf/35 ring-offset-1 ring-offset-surface"
};

/** The election product: every booth by coverage, the roll by age and gender, a booth staffed, a survey coming in */
export function ElectionScreen({ s, label }: { s: ElectionCopy; label: string }) {
  const icons = [I.ChartLineUp, I.HouseLine, I.Table, I.UserList, I.ClipboardText];
  const top = Math.max(...s.voters.groups.map((g) => g.v));
  const legend = ["bg-accent", "bg-accent/35", "bg-ink/12"];
  return (
    <div role="img" aria-label={label} className="relative px-2 pt-10 pb-20 sm:px-6 lg:pr-0">
      <div aria-hidden className="rise [--i:2]">
        <Window app={s.app} nav={s.nav} icons={icons} active={1}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-[15px] font-semibold">{s.title}</span>
            <span className="text-[11.5px] text-muted">{s.area}</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
                {BOOTHS.map((b, i) => <span key={i} className={`aspect-square rounded-[2px] ${b ? DOT[b] : ""}`} />)}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-muted">
                {s.legend.map((l, i) => (
                  <span key={l.t} className="inline-flex items-center gap-1.5"><span className={`size-2 rounded-[2px] ${legend[i]}`} />{l.t}<b className="font-mono font-semibold text-ink">{l.n}</b></span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-[10.5px] font-medium text-muted">{s.voters.title}</p>
              <p className="mt-0.5 font-mono text-[20px] leading-tight font-semibold tabular-nums">{s.voters.total}</p>
              <div className="mt-3 space-y-2">
                {s.voters.groups.map((g) => (
                  <div key={g.t} className="grid grid-cols-[38px_minmax(0,1fr)_28px] items-center gap-2 text-[10.5px]">
                    <span className="font-mono text-muted">{g.t}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-accent" style={{ width: `${(g.v / top) * 100}%` }} /></span>
                    <span className="text-right font-mono text-muted">{g.v}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex h-1.5 overflow-hidden rounded-full">
                <span className="bg-leaf" style={{ width: `${s.voters.womenShare}%` }} /><span className="flex-1 bg-accent/40" />
              </div>
              <p className="mt-1.5 flex justify-between text-[10px] text-muted"><span>{s.voters.women}</span><span>{s.voters.men}</span></p>
            </div>
          </div>
        </Window>
      </div>

      {/* the lit booth, staffed, off the top right */}
      <div aria-hidden className={`${FLOAT} rise top-0 right-2 w-[206px] p-3.5 [--i:4] sm:right-0 lg:-right-4`}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-leaf"><span className="size-2 rounded-full bg-leaf" />{s.booth.kicker}</p>
        <p className="mt-1.5 text-[14px] leading-snug font-semibold">{s.booth.t}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted"><I.Clock size={12} />{s.booth.d}</p>
      </div>

      {/* new names on the roll, off the bottom right */}
      <div aria-hidden className={`${FLOAT} rise right-6 bottom-2 hidden w-[164px] p-3.5 [--i:5] md:block`}>
        <p className="text-[11px] font-medium text-muted">{s.roll.label}</p>
        <p className="mt-1 font-mono text-[26px] leading-none font-semibold text-accent tabular-nums">+{s.roll.value}</p>
        <p className="mt-1.5 text-[11.5px] leading-snug text-muted">{s.roll.note}</p>
      </div>

      {/* a survey coming in from the field, off the bottom left */}
      <div aria-hidden className="rise absolute bottom-0 left-2 w-[244px] rounded-2xl bg-ink p-3.5 text-bg shadow-[0_28px_60px_-24px_color-mix(in_srgb,var(--ink)_70%,transparent)] [--i:6] sm:left-0 lg:-left-10">
        <p className="flex items-center gap-2 text-[11px] text-bg/65">
          <span className="grid size-5 place-items-center rounded-md bg-leaf text-leaf-ink"><I.ClipboardText size={12} /></span>
          <span className="font-semibold text-bg">{s.survey.kicker}</span>
        </p>
        <p className="mt-2 text-[13px] leading-snug font-medium">{s.survey.t}</p>
        <p className="mt-2 flex items-center gap-2 text-[11.5px] text-bg/70">
          <span className="flex h-1 flex-1 overflow-hidden rounded-full bg-bg/15"><span className="w-[62%] bg-leaf-inverse" /></span>{s.survey.v}
        </p>
      </div>
    </div>
  );
}
