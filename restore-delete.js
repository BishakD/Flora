const fs = require('fs');

let adminCode = fs.readFileSync('app/admin/page.tsx', 'utf-8');
let receptionCode = fs.readFileSync('app/reception/page.tsx', 'utf-8');

// 1. Extract DeleteBookingModal from admin
const deleteModalMatch = adminCode.match(/function DeleteBookingModal[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/);
const deleteModalStr = deleteModalMatch[0];

// 2. Insert DeleteBookingModal into reception
receptionCode = receptionCode.replace(
  /\/\/ Delete modal removed/,
  deleteModalStr
);

// 3. Extract handleDeleteBooking from admin
const handleDelMatch = adminCode.match(/async function handleDeleteBooking\(\) \{[\s\S]*?\}\n\s*\}\n/);
const handleDelStr = handleDelMatch[0];

// 4. Insert handleDeleteBooking into reception
receptionCode = receptionCode.replace(
  /\/\/ ── Render States ──────────────────────────────────────────────────────────/,
  '  // ── Delete Action ──────────────────────────────────────────────────────────\n  ' + handleDelStr + '\n\n  // ── Render States ──────────────────────────────────────────────────────────'
);

// 5. Add state variables to reception
receptionCode = receptionCode.replace(
  /const \[cancelling, setCancelling\] = useState\(false\);/,
  `const [cancelling, setCancelling] = useState(false);\n\n  const [deleteTarget, setDeleteTarget] = useState<BookingRow | null>(null);\n  const [deleting, setDeleting] = useState(false);`
);

// 6. Add DeleteBookingModal component usage
receptionCode = receptionCode.replace(
  /\{cancelTarget && \([\s\S]*?busy=\{cancelling\}\s*\/>\s*\)\}/,
  `$&
      {deleteTarget && (
        <DeleteBookingModal
          booking={deleteTarget}
          onConfirm={handleDeleteBooking}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}`
);

// 7. Add Delete button in table
const deleteButtonHtml = `
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => setDeleteTarget(b)}
                            className="luxury-button border-flora-terracotta text-flora-terracotta [--button-fill:var(--flora-terracotta)] [--button-ink:var(--flora-ivory-card)] p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={\`Permanently delete booking for \${b.guest_name}\`}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>`;

receptionCode = receptionCode.replace(
  /(\{isCancelled \? "Cancelled" : "Cancel"\}\s*<\/button>)/,
  `$1${deleteButtonHtml}`
);

fs.writeFileSync('app/reception/page.tsx', receptionCode);
console.log("Done");
