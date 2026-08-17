/**
 * Admin section layout — replaces the public Nav chrome with a minimal
 * back-office shell. Sits inside the root layout but overrides the visual
 * structure for every /admin/* route.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      {children}
    </div>
  );
}
