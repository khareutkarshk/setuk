import type { Dictionary } from "@/content";
import { Kicker } from "@/components/site/kicker";
import { CornerPattern, Pattern } from "@/components/site/pattern";
import { TryItJourney } from "./try-it-journey";

/**
 * "Try it", straight after the story: the visitor sends a request of their own and watches a Setuk
 * office take it from logged to closed (try-it-journey.tsx). It sits outside the story, so the
 * chapters and the camera's stops stay paired.
 */
export function TryIt({ t }: { t: Dictionary }) {
  return (
    <section id="try-it" aria-labelledby="try-it-title" className="relative z-10 overflow-clip border-t border-line bg-bg">
      <Pattern kind="temple" className="absolute inset-x-0 top-0 -scale-y-100 text-accent opacity-[.14]" />
      <CornerPattern kind="kolam" fx={0} fy={100} radius={520} className="inset-0 text-accent opacity-[.1]" />
      <div className="relative mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-[720px]">
          <Kicker>{t.tryIt.kicker}</Kicker>
          <h2 id="try-it-title" className="font-display-tight mt-3 text-balance text-[clamp(32px,4.2vw,52px)] leading-[1.04]">{t.tryIt.title}</h2>
          <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-muted md:text-[19px]">{t.tryIt.sub}</p>
        </div>
        <div className="mt-12">
          <TryItJourney c={t.tryIt} />
        </div>
      </div>
    </section>
  );
}
