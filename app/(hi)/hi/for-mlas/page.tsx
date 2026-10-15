import { RoleRoute, roleMetadata } from "@/components/pages/roles/role-route";

export const metadata = roleMetadata("hi", "mlas");

export default function Page() {
  return <RoleRoute locale="hi" role="mlas" />;
}
