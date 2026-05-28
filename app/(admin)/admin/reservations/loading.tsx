export default function AdminReservationsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-5 w-40 bg-muted" />
        <div className="h-3 w-56 bg-muted" />
      </div>
      <div className="flex gap-4">
        <div className="h-9 w-32 bg-muted" />
        <div className="h-9 w-32 bg-muted" />
        <div className="h-9 w-32 bg-muted" />
      </div>
      <div className="border p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-4 w-32 bg-muted" />
            <div className="h-4 w-24 bg-muted" />
            <div className="h-4 w-32 bg-muted" />
            <div className="h-4 w-16 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
