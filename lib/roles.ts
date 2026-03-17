export function isAdminRole(role?: string | null) {
  return (role ?? "").toUpperCase() === "ADMIN";
}
