const fs = require('fs');

const files = [
  'app/admin/rate-plans/page.tsx',
  'app/admin/room-types/page.tsx',
  'app/admin/page.tsx',
  'app/reception/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf-8');

  // Fix table headers
  code = code.replace(
    /className="whitespace-nowrap px-4 py-3 font-sans text-\[0\.62rem\] font-medium uppercase tracking-\[0\.14em\] text-flora-grey"/g,
    'className={`whitespace-nowrap px-4 py-3 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em] text-flora-grey ${col === "Actions" ? "text-right" : ""}`}'
  );
  
  // Fix Actions column (body)
  code = code.replace(
    /<td className="px-4 py-3( whitespace-nowrap)?">\s*<div className="flex items-center gap-2">/g,
    '<td className="px-4 py-3$1 text-right">\n                        <div className="flex items-center justify-end gap-2">'
  );

  fs.writeFileSync(file, code);
}

// Let's also check staff page separately, it has no `Actions` column but has a blank column at the end.
const staffFile = 'app/admin/staff/page.tsx';
if (fs.existsSync(staffFile)) {
  let staffCode = fs.readFileSync(staffFile, 'utf-8');
  // the blank th for actions
  // <th className="pb-2"></th>
  // the td for actions
  // <td className="py-3 text-right">
  // These are already correct in staff page!
}

console.log("Done");
