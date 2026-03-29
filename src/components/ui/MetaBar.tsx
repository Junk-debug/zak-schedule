interface MetaBarProps {
  updatedAt: string;
  pdfUrl: string;
}

export function MetaBar({ updatedAt, pdfUrl }: MetaBarProps) {
  return (
    <div className="text-xs text-muted mb-5">
      Zaktualizowano: {new Date(updatedAt).toLocaleString("pl-PL")}
      {" · "}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 underline underline-offset-2 hover:text-gray-900"
      >
        Źródłowy PDF
      </a>
    </div>
  );
}
