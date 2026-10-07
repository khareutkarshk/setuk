import type { CSSProperties, ReactNode } from "react";
import type { Dictionary, Locale } from "@/content";
import * as I from "@/components/icons";
import type { Icon } from "@/components/icons";
import { CornerPattern, Lotus, Pattern, type PatternKind } from "@/components/site/pattern";
import { ProofStrip } from "./proof-strip";
import styles from "./story.module.css";

/* Chapter cards for the scroll story, rendered on the server. Each one pairs with a camera stop in
   lib/sadan/engine.ts (STOPS), in the same order. */

const ICONS = {
  tiers: [I.Bank, I.Buildings, I.HouseLine, I.FlagBanner, I.UserCirclePlus],
  problem: [I.Notebook, I.FileXls, I.WhatsappLogo, I.Brain],
  solution: [I.CursorClick, I.CloudCheck, I.UsersThree, I.BellRinging, I.BookOpenText],
  products: [
    [I.CalendarCheck, I.CalendarDots, I.EnvelopeSimpleOpen, I.Train, I.UsersThree, I.DeviceMobile, I.DoorOpen],
    [I.CheckSquareOffset, I.ListChecks, I.UserList, I.Star, I.ClipboardText]
  ],
  productHead: [I.Briefcase, I.FlagBanner],
  steps: [I.ChatsCircle, I.CompassTool, I.ChalkboardTeacher, I.ChartLineUp]
} satisfies Record<string, Icon[] | Icon[][]>;

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

function Chapter({ step, side, id, className, children }: { step: number; side: "left" | "right"; id?: string; className?: string; children: ReactNode }) {
  return (
    <article className={`${styles.step} ${className ?? ""}`} data-step={step} data-side={side} id={id} data-active={step === 0 ? "" : undefined}>
      {children}
    </article>
  );
}

const DEVA = "०१२३४५६७८९";
const devanagari = (n: number) => String(n).padStart(2, "0").replace(/\d/g, (d) => DEVA[Number(d)]);

/** A chapter card: a temple-border top edge, a corner ornament (a pattern, or the lotus) and the
    chapter number as a Devanagari numeral watermark */
function Card({ n, ornament, wide, children }: { n: number; ornament: PatternKind | "lotus"; wide?: boolean; children: ReactNode }) {
  return (
    <div className={styles.inner}>
      <div className={`${styles.card} ${wide ? styles.wide : ""}`}>
        <Pattern kind="temple" className={styles.band} />
        {ornament === "lotus" ? <Lotus className={styles.lotus} /> : <CornerPattern kind={ornament} className={styles.corner} radius={230} />}
        <span aria-hidden="true" className={styles.numeral}>{devanagari(n)}</span>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

function Eyebrow({ n, children }: { n: number; children: ReactNode }) {
  return (
    <p className={styles.eyebrow}>
      <span className={styles.num}>{String(n).padStart(2, "0")}</span>
      {children}
    </p>
  );
}

export function HeroChapter({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <Chapter step={0} side="left" className={styles.hero}>
      <div className={`${styles.inner} flex-col justify-end pt-24 pb-8 md:justify-center md:pb-[168px]`}>
        <div className="max-w-[640px]">
          <p className="rise flex max-w-[46ch] items-start gap-2 text-[13px] text-muted" style={stagger(0)}>
            <I.UsersThree className="mt-px shrink-0 text-accent" size={16} aria-hidden />
            <span>{t.hero.eyebrow}</span>
          </p>
          <h1 className="font-display-tight mt-4 text-[40px] leading-[0.98] sm:text-[56px] md:mt-5 lg:text-[68px]">
            <span className="rise block" style={stagger(1)}>{t.hero.titleA}</span>
            <span className="rise block text-accent" style={stagger(2)}>{t.hero.titleB}</span>
          </h1>
          <p className="rise mt-5 max-w-[44ch] text-[17px] leading-relaxed text-muted md:mt-6 md:text-xl" style={stagger(3)}>{t.hero.sub}</p>
          <div className="rise mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-9" style={stagger(4)}>
            <a href="#contact" className="press inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
              {t.hero.primary}
              <I.ArrowRight weight="bold" aria-hidden />
            </a>
            <a href="#how" className="inline-flex items-center gap-2 whitespace-nowrap font-medium hover:text-accent">
              {t.hero.secondary}
              <I.ArrowDown aria-hidden />
            </a>
          </div>
        </div>
        {/* Proof strip [placeholder figures, see content/site.ts] */}
        <div className="rise mt-8 max-w-[880px] md:absolute md:right-20 md:bottom-8 md:left-8 md:mt-0 lg:left-[max(32px,calc((100vw-1280px)/2+32px))]" style={stagger(5)}>
          <div className="mb-2 flex items-center gap-3">
            <p className="shrink-0 text-[12px] font-semibold uppercase tracking-[.08em] text-muted">{t.proof.label}</p>
            <Pattern kind="temple" className="h-[10px] flex-1 text-accent opacity-40 [mask-size:17px_10px]" />
          </div>
          <ProofStrip locale={locale} items={t.proof.items} />
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
            <I.Info aria-hidden />
            {t.proof.note}
          </p>
        </div>
      </div>
    </Chapter>
  );
}

export function ServeChapter({ t }: { t: Dictionary }) {
  const tier = (x: Dictionary["serve"]["tiers"][number], i: number) => {
    const Ico = ICONS.tiers[i];
    return (
      <div key={x.t} className={styles.tier} style={stagger(i)}>
        <span className={styles.ico}><Ico size={17} aria-hidden /></span>
        <span>
          <b className="block text-[15px] font-semibold leading-tight">{x.t}</b>
          <small className="block text-[13px] leading-snug text-muted">{x.d}</small>
        </span>
        <em className="whitespace-nowrap font-mono text-[13px] not-italic">{x.n}</em>
      </div>
    );
  };
  return (
    <Chapter step={1} side="left" id="serve">
      <Card n={2} ornament="jaali">
        <Eyebrow n={2}>{t.serve.eyebrow}</Eyebrow>
        <h2 className={styles.h2}>{t.serve.title}</h2>
        <p className={`${styles.body} ${styles.hideSm}`}>{t.serve.body}</p>
        <div className={styles.group}>
          <p className={styles.groupLabel}>{t.serve.reps}</p>
          <div className={`${styles.list} mt-1`}>{t.serve.tiers.slice(0, 3).map((x, i) => tier(x, i))}</div>
        </div>
        <div className={styles.group}>
          <p className={styles.groupLabel}>{t.serve.pols}</p>
          <div className={`${styles.list} mt-1`}>{t.serve.tiers.slice(3).map((x, i) => tier(x, i + 3))}</div>
        </div>
      </Card>
    </Chapter>
  );
}

export function ProblemChapter({ t }: { t: Dictionary }) {
  return (
    <Chapter step={2} side="right" id="problem">
      <Card n={3} ornament="lehar">
        <Eyebrow n={3}>{t.problem.eyebrow}</Eyebrow>
        <h2 className={`${styles.h2} ${styles.h2sm}`}>{t.problem.title}</h2>
        <p className={styles.body}>{t.problem.body}</p>
        <ul className="mt-5 space-y-3">
          {t.problem.items.map((m, i) => {
            const Ico = ICONS.problem[i];
            return (
              <li key={m.t} className="flex gap-3">
                <Ico className="mt-0.5 shrink-0 text-muted" size={18} aria-hidden />
                <span>
                  <span className={`${styles.strike} font-semibold`} style={stagger(i)}>{m.t}</span>
                  <span className={`${styles.hideSm} mt-0.5 block text-[14px] leading-snug text-muted`}>{m.d}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </Chapter>
  );
}

export function SolutionChapter({ t }: { t: Dictionary }) {
  return (
    <Chapter step={3} side="left" id="solution">
      <Card n={4} ornament="kolam">
        <Eyebrow n={4}><span className="font-semibold text-accent">{t.solution.eyebrow}</span></Eyebrow>
        <h2 className={`${styles.h2} ${styles.h2sm}`}>{t.solution.title}</h2>
        <p className={`${styles.body} ${styles.hideSm}`}>{t.solution.body}</p>
        <ul className={`${styles.list} mt-5 space-y-3`}>
          {t.solution.items.map((m, i) => {
            const Ico = ICONS.solution[i];
            return (
              <li key={m.t} className="flex gap-3" style={stagger(i)}>
                <span className={`${styles.ico} !h-7 !w-7`}><Ico size={15} aria-hidden /></span>
                <span>
                  <b className="font-semibold">{m.t}</b>
                  <span className="mt-0.5 block text-[14px] leading-snug text-muted">{m.d}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </Chapter>
  );
}

export function ProductsChapter({ t }: { t: Dictionary }) {
  return (
    <Chapter step={4} side="left" id="products">
      <Card n={5} ornament="buti" wide>
        <Eyebrow n={5}>{t.products.eyebrow}</Eyebrow>
        <h2 className={styles.h2}>{t.products.title}</h2>
        <div className="mt-5">
          {t.products.items.map((p, k) => {
            const Head = ICONS.productHead[k];
            return (
              <div key={p.t} className={styles.prod}>
                <div className="flex items-start gap-3">
                  <span className={styles.ico}><Head size={17} aria-hidden /></span>
                  <div>
                    <h3 className="text-[17px] font-semibold leading-snug">{p.t}</h3>
                    <p className="mt-0.5 text-[14px] text-muted">{p.d}</p>
                  </div>
                </div>
                <div className={`${styles.list} mt-3 flex flex-wrap gap-1.5`}>
                  {p.mods.map((m, i) => {
                    const Ico = ICONS.products[k][i];
                    return (
                      <span key={m.t} className={`${styles.chip} ${m.soon ? styles.soon : ""}`} style={stagger(i + k * 4)}>
                        <Ico size={14} aria-hidden />
                        {m.t}
                        {m.soon && <small className="text-[11px] font-semibold uppercase tracking-wide">{t.products.soon}</small>}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Chapter>
  );
}

/* The four steps of "How we work": the table in the well, the plan view, the Speaker's view, the whole House */
export function HowChapters({ t }: { t: Dictionary }) {
  return t.how.steps.map((s, i) => {
    const Ico = ICONS.steps[i];
    return (
      <Chapter key={s.t} step={5 + i} side={i % 2 ? "left" : "right"} id={i === 0 ? "how" : undefined} className={styles.how}>
        <Card n={6 + i} ornament="lotus">
          <Eyebrow n={6 + i}>{t.how.eyebrow} · {i + 1}/4</Eyebrow>
          {i === 0 && <p className="mt-3 text-[15px] font-medium">{t.how.title}</p>}
          <div className={styles.progress} aria-hidden>
            {[0, 1, 2, 3].map((k) => <span key={k} data-on={k <= i ? "" : undefined} />)}
          </div>
          <h2 className={`${styles.h2} flex items-center gap-3`}>
            <Ico className="shrink-0 text-accent" size="0.8em" aria-hidden />
            <span>{s.t}</span>
          </h2>
          <p className={styles.time}><I.Clock aria-hidden />{s.time}</p>
          <p className={styles.body}>{s.d}</p>
          <div className={styles.get}>
            <span className={styles.getSeal} aria-hidden><I.SealCheck weight="fill" /></span>
            <p>
              <span className={styles.getLabel}>{t.how.get}</span>
              <span className={styles.getText}>{s.get}</span>
            </p>
          </div>
        </Card>
      </Chapter>
    );
  });
}
