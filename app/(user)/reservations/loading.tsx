export default function ReservationsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-5 w-40 bg-muted" />
        <div className="h-3 w-56 bg-muted" />
      </div>
      <div className="flex gap-1 border-b">
        {["Upcoming", "Past", "Cancelled"].map((t) => (
          <div key={t} className="px-3 py-2">
            <div className="h-3 w-16 bg-muted" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border p-4">
            <div className="size-10 bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted" />
              <div className="h-3 w-48 bg-muted" />
              <div className="h-5 w-16 bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
