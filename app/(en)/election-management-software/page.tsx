import { ProductRoute, productMetadata } from "@/components/pages/products/product-route";

export const metadata = productMetadata("en", "election");

export default function Page() {
  return <ProductRoute locale="en" product="election" />;
}
