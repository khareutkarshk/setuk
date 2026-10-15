import { RoleRoute, roleMetadata } from "@/components/pages/roles/role-route";

export const metadata = roleMetadata("en", "consultants");

export default function Page() {
  return <RoleRoute locale="en" role="consultants" />;
}
