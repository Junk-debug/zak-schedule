"use client";

interface ExportButtonProps {
  onClick: () => void;
}

export function ExportButton({ onClick }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Pobierz plik .ics — otworzy się w Google Calendar, Apple Calendar lub Outlook"
      className="px-3 py-2 rounded-md border border-border bg-white text-sm font-medium text-gray-900 cursor-pointer transition-colors hover:bg-surface"
    >
      📅 Dodaj do kalendarza
    </button>
  );
}
