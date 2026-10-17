import { ProductRoute, productMetadata } from "@/components/pages/products/product-route";

export const metadata = productMetadata("hi", "office");

export default function Page() {
  return <ProductRoute locale="hi" product="office" />;
}
