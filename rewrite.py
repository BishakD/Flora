import re

with open('app/reception/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove DeleteBookingModal
code = re.sub(r'function DeleteBookingModal.*?</div>\s*</div>\s*\);\s*}', '// Delete Modal removed for reception', code, flags=re.DOTALL)

# Remove delete state
code = re.sub(r'const \[deleteTarget,\s*setDeleteTarget\]\s*=\s*useState<BookingRow \| null>\(null\);\s*const \[deleting,\s*setDeleting\]\s*=\s*useState\(false\);', '', code)

# Remove handleDeleteBooking
code = re.sub(r'async function handleDeleteBooking\(\) \{.*?\}\s*(?=// ─── Render)', '', code, flags=re.DOTALL)

# Remove DeleteModal usage
code = re.sub(r'\{deleteTarget && \(\s*<DeleteBookingModal[^>]+/>\s*\)\}', '', code, flags=re.DOTALL)

# Remove Delete button
code = re.sub(r'<button\s*type="button"\s*disabled=\{deleting\}[^>]+onClick=\{[^}]+\s*setDeleteTarget\(b\)\}[^>]+>.*?</button>', '', code, flags=re.DOTALL)

# Calculate Today's Arrivals and Departures
arrivals_departures = """
  // Compute Today's Arrivals and Departures
  const todayStr = new Date().toISOString().split("T")[0];
  const todayArrivals = bookings.filter(b => b.check_in === todayStr);
  const todayDepartures = bookings.filter(b => b.check_out === todayStr);

  return (
"""
code = code.replace("  return (", arrivals_departures, 1)

# Add Arrivals and Departures UI above the table
# Need to find the header bar and add it below it
header_pattern = r'(<AdminShell title="Reception Dashboard" [^>]*>)\s*(<!-- Header Bar with Search & Live Indicator -->)'
# Wait, let's insert it right after the header bar div ends.
# Actually, I'll just write a custom rendering section.
with open('rewrite.py', 'w') as f:
    pass

with open('app/reception/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
