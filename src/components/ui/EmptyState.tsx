export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-5 text-muted">
      {children}
    </div>
  );
}
