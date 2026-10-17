import { ProductRoute, productMetadata } from "@/components/pages/products/product-route";

export const metadata = productMetadata("en", "office");

export default function Page() {
  return <ProductRoute locale="en" product="office" />;
}
