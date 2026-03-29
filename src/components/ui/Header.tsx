import Link from "next/link";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-5 border-b border-border">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
        {title}
      </h1>
      {children && (
        <div className="flex gap-2 items-center flex-wrap">{children}</div>
      )}
    </header>
  );
}

export function HeaderLink({
  href,
  children,
  variant = "ghost",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ghost" | "secondary";
}) {
  const styles =
    variant === "secondary"
      ? "px-3.5 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-surface transition-colors"
      : "text-sm text-muted hover:text-gray-900 transition-colors";

  return (
    <Link href={href} className={styles}>
      {children}
    </Link>
  );
}
