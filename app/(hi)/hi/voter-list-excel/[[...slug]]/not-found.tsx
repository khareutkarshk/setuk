import { NotFoundPage } from "@/components/pages/not-found";

/* notFound() for an unknown address here. Kept in the segment rather than the root layout, which would
   put this page into every page's payload */
export default function NotFound() {
  return <NotFoundPage locale="hi" />;
}
