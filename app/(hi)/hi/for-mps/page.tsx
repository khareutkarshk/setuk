import { RoleRoute, roleMetadata } from "@/components/pages/roles/role-route";

export const metadata = roleMetadata("hi", "mps");

export default function Page() {
  return <RoleRoute locale="hi" role="mps" />;
}
