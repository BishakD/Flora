const fs = require('fs');

let adminCode = fs.readFileSync('app/admin/page.tsx', 'utf-8');
let receptionCode = fs.readFileSync('app/reception/page.tsx', 'utf-8');

// Extract DeleteBookingModal from admin
const deleteModalMatch = adminCode.match(/function DeleteBookingModal[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/);
const deleteModalStr = deleteModalMatch[0];

// Insert it into reception page
receptionCode = receptionCode.replace(
  /\/\/ ─── Main Admin Dashboard Component/,
  deleteModalStr + '\n\n// ─── Main Admin Dashboard Component'
);

fs.writeFileSync('app/reception/page.tsx', receptionCode);
console.log("Done");
