import { RoleRoute, roleMetadata } from "@/components/pages/roles/role-route";

export const metadata = roleMetadata("en", "mayors");

export default function Page() {
  return <RoleRoute locale="en" role="mayors" />;
}
