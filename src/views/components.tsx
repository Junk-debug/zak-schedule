import React from "react";
import type { Lesson } from "../types.js";

// --- Date formatting ---

const WEEKDAYS_FULL: Record<number, string> = {
  0: "Niedziela",
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota",
};

const WEEKDAYS_SHORT: Record<number, string> = {
  0: "Ndz",
  1: "Pon",
  2: "Wt",
  3: "Śr",
  4: "Czw",
  5: "Pt",
  6: "Sob",
};

export function formatDate(d: string): string {
  const [y, m, dd] = d.split("-");
  return `${dd}.${m}.${y}`;
}

export function weekdayFull(d: string): string {
  return WEEKDAYS_FULL[new Date(d).getDay()] ?? "";
}

export function weekdayShort(d: string): string {
  return WEEKDAYS_SHORT[new Date(d).getDay()] ?? "";
}

// --- Grid data ---

export interface TimeSlot {
  lesson: number;
  start: string;
  end: string;
  bySemester: Record<number, { subject: string; room: string }>;
}

export function buildTimeSlots(lessons: Lesson[]): TimeSlot[] {
  const slotMap = new Map<number, TimeSlot>();

  for (const l of lessons) {
    let slot = slotMap.get(l.lesson);
    if (!slot) {
      slot = { lesson: l.lesson, start: l.start, end: l.end, bySemester: {} };
      slotMap.set(l.lesson, slot);
    }
    slot.bySemester[l.semester] = { subject: l.subject, room: l.room };
  }

  return Array.from(slotMap.values()).sort((a, b) => a.lesson - b.lesson);
}

// --- Table components ---

function SubjectCell({ info }: { info?: { subject: string; room: string } }) {
  if (!info) {
    return <td className="cell cell-sem cell-empty">&mdash;</td>;
  }
  return (
    <td className="cell cell-sem">
      <span className="subj-name">{info.subject}</span>
      {info.room && <span className="subj-room">{info.room}</span>}
    </td>
  );
}

export function SingleSemesterTable({ lessons }: { lessons: Lesson[] }) {
  const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="cell cell-num">#</th>
            <th className="cell cell-time">Godzina</th>
            <th className="cell cell-subject">Przedmiot</th>
            <th className="cell cell-room">Sala</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((l) => (
            <tr key={l.lesson}>
              <td className="cell cell-num">{l.lesson}</td>
              <td className="cell cell-time">
                {l.start}&ndash;{l.end}
              </td>
              <td className="cell cell-subject">{l.subject}</td>
              <td className="cell cell-room">{l.room || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GridTable({
  slots,
  semesters,
}: {
  slots: TimeSlot[];
  semesters: number[];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="cell cell-num">#</th>
            <th className="cell cell-time">Godzina</th>
            {semesters.map((s) => (
              <th key={s} className="cell cell-sem-head">
                Sem. {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.lesson}>
              <td className="cell cell-num">{slot.lesson}</td>
              <td className="cell cell-time">
                {slot.start}&ndash;{slot.end}
              </td>
              {semesters.map((s) => (
                <SubjectCell key={s} info={slot.bySemester[s]} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Shared UI ---

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function MetaBar({
  updatedAt,
  pdfUrl,
  icsHref,
}: {
  updatedAt: string;
  pdfUrl: string;
  icsHref?: string;
}) {
  return (
    <div className="meta">
      Zaktualizowano: {new Date(updatedAt).toLocaleString("pl-PL")}
      {" · "}
      <a href={pdfUrl}>Źródłowy PDF</a>
      {icsHref && (
        <>
          {" · "}
          <a href={icsHref} id="ics-link">
            Eksport .ics
          </a>
        </>
      )}
    </div>
  );
}

export function SemesterSelect({
  semesters,
  value,
}: {
  semesters: number[];
  value: number | null;
}) {
  return (
    <select id="sem" defaultValue={value ?? ""}>
      <option value="">Wszystkie semestry</option>
      {semesters.map((s) => (
        <option key={s} value={s}>
          Semestr {s}
        </option>
      ))}
    </select>
  );
}

// --- Client scripts ---

export function RefreshScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
document.getElementById('refresh-btn').addEventListener('click', async function() {
  this.textContent='\u2026'; this.disabled=true;
  try {
    var r=await fetch('/schedule/refresh',{method:'POST'});
    var d=await r.json();
    if(d.error){alert('B\u0142\u0105d: '+d.error);return;}
    location.reload();
  } catch(e){alert('B\u0142\u0105d: '+e.message);}
  finally{this.textContent='Od\u015Bwie\u017C';this.disabled=false;}
});
`,
      }}
    />
  );
}

export function UrlSyncScript({ params }: { params: string[] }) {
  const handlers = params
    .map(
      (p) =>
        `document.getElementById('${p}').addEventListener('change', function() { updateUrl('${p === "sem" ? "semester" : p === "date-picker" ? "date" : p}', this.value); });`
    )
    .join("\n");

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
function updateUrl(key, val) {
  var p = new URLSearchParams(location.search);
  if (val) p.set(key, val); else p.delete(key);
  location.search = p.toString();
}
${handlers}
`,
      }}
    />
  );
}
