const fs = require('fs');

let code = fs.readFileSync('app/reception/page.tsx', 'utf-8');

// 1. Remove residual DeleteBookingModal if any
code = code.replace(/function DeleteBookingModal\([\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/, '// Delete modal removed');
// Also remove the extra lingering closing tags from the botched replacement
code = code.replace(/          >\s*\{\s*busy \? "Deleting…" : "Delete Permanently"\}\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, '');

// 2. Remove state
code = code.replace(/const \[deleteTarget, setDeleteTarget\] = useState<BookingRow \| null>\(null\);/g, '');
code = code.replace(/const \[deleting, setDeleting\] = useState\(false\);/g, '');

// 3. Remove handleDeleteBooking
code = code.replace(/async function handleDeleteBooking\(\) \{[\s\S]*?\}  \/\/ ─── Render/g, '// ─── Render');

// 4. Remove DeleteBookingModal usage
code = code.replace(/\{deleteTarget && \([\s\S]*? busy=\{deleting\}\s*\/>\s*\)\}/, '');

// 5. Remove Delete button from table
code = code.replace(/<button\s+type="button"\s+disabled=\{deleting\}[\s\S]*?Delete Permanently[\s\S]*?<\/button>/, '');
code = code.replace(/<button\s+type="button"\s+disabled=\{deleting\}[\s\S]*?svg[\s\S]*?<\/button>/, '');


// 6. Compute Arrivals and Departures
const computation = `
  const trimmedQuery = searchQuery.trim().toUpperCase();
  const filteredBookings = trimmedQuery
    ? bookings.filter((b) =>
        ((b as any).booking_reference as string | null)
          ?.toUpperCase()
          .includes(trimmedQuery)
      )
    : bookings;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayArrivals = bookings.filter(b => b.check_in === todayStr);
  const todayDepartures = bookings.filter(b => b.check_out === todayStr);
`;
code = code.replace(/const trimmedQuery = searchQuery\.trim\(\)\.toUpperCase\(\);[\s\S]*?: bookings;/, computation);

// 7. Inject Arrivals and Departures UI above the table
// Let's find: {/* Bookings Table */}
const tableUI = `
        {/* Today's Arrivals and Departures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Arrivals */}
          <div className="rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-soft">
            <h3 className="font-sans text-sm uppercase tracking-widest text-flora-gold mb-4 border-b border-flora-line pb-2">Today's Arrivals</h3>
            {todayArrivals.length === 0 ? (
              <p className="text-flora-grey font-sans text-xs">No arrivals today.</p>
            ) : (
              <ul className="space-y-3">
                {todayArrivals.map(b => (
                  <li key={b.id} className="flex justify-between items-center bg-white p-3 rounded border border-flora-line/50">
                    <div>
                      <p className="text-flora-navy font-medium text-sm">{b.guest_name}</p>
                      <p className="text-flora-grey text-xs">{b.room_types?.name} · {b.adults} Adults {b.children > 0 ? \`, \${b.children} Children\` : ''}</p>
                    </div>
                    <span className="text-xs font-mono text-flora-gold">{(b as any).booking_reference ?? b.id.toUpperCase().slice(0,6)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Departures */}
          <div className="rounded-lg border border-flora-line bg-flora-ivory p-6 shadow-soft">
            <h3 className="font-sans text-sm uppercase tracking-widest text-flora-gold mb-4 border-b border-flora-line pb-2">Today's Departures</h3>
            {todayDepartures.length === 0 ? (
              <p className="text-flora-grey font-sans text-xs">No departures today.</p>
            ) : (
              <ul className="space-y-3">
                {todayDepartures.map(b => (
                  <li key={b.id} className="flex justify-between items-center bg-white p-3 rounded border border-flora-line/50">
                    <div>
                      <p className="text-flora-navy font-medium text-sm">{b.guest_name}</p>
                      <p className="text-flora-grey text-xs">{b.room_types?.name}</p>
                    </div>
                    <span className="text-xs font-mono text-flora-gold">{(b as any).booking_reference ?? b.id.toUpperCase().slice(0,6)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bookings Table */}
`;
code = code.replace(/\{\/\*\s*Bookings Table\s*\*\/\}/, tableUI);

fs.writeFileSync('app/reception/page.tsx', code);
console.log("Done");
