import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Dziś" },
  { href: "/all", label: "Cały plan" },
  { href: "/archive", label: "Archiwum" },
];

interface HeaderProps {
  active: "/" | "/all" | "/archive";
  semester?: number | null;
}

export function Header({ active, semester }: HeaderProps) {
  function buildHref(href: string): string {
    if (semester) return `${href}?semester=${semester}`;
    return href;
  }

  return (
    <header className="mb-6 pb-5 border-b border-border">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-4">
        Plan zajęć ZAK Gdańsk
      </h1>
      <nav className="flex gap-1">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={buildHref(href)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              active === href
                ? "bg-gray-900 text-white"
                : "border border-border text-gray-600 hover:bg-surface hover:text-gray-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
