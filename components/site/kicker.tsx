import type { ReactNode } from "react";
import { Pattern } from "./pattern";

/* Section eyebrows follow the story's: a blue temple ornament and a leaf label. Shared by the
   homepage sections and the inner pages, so every page opens its sections the same way. */
export function Kicker({ children, className = "text-leaf", ornament = "text-accent", as: Tag = "p", id }: { children: ReactNode; className?: string; ornament?: string; as?: "p" | "h2"; id?: string }) {
  return (
    <Tag id={id} className={`flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[.08em] ${className}`}>
      <Pattern kind="temple" className={`w-[24px] shrink-0 ${ornament}`} />
      {children}
    </Tag>
  );
}
