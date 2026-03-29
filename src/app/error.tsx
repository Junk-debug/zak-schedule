"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-lg font-semibold">Coś poszło nie tak</h2>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm border border-border rounded-md hover:bg-gray-50 transition-colors"
      >
        Spróbuj ponownie
      </button>
    </main>
  );
}
