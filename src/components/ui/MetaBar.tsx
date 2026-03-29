interface MetaBarProps {
  updatedAt: string;
  pdfUrl: string;
  onExportICS?: () => void;
}

export function MetaBar({ updatedAt, pdfUrl, onExportICS }: MetaBarProps) {
  const linkClass = "text-gray-500 underline underline-offset-2 hover:text-gray-900";

  return (
    <div className="text-xs text-muted mb-5">
      Zaktualizowano: {new Date(updatedAt).toLocaleString("pl-PL")}
      {" · "}
      <a href={pdfUrl} className={linkClass}>
        Źródłowy PDF
      </a>
      {onExportICS && (
        <>
          {" · "}
          <button onClick={onExportICS} className={`${linkClass} cursor-pointer`}>
            Eksport .ics
          </button>
        </>
      )}
    </div>
  );
}
