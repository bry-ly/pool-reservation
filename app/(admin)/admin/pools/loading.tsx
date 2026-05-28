export default function AdminPoolsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-24 bg-muted" />
          <div className="h-3 w-32 bg-muted" />
        </div>
        <div className="h-9 w-28 bg-muted" />
      </div>
      <div className="border p-4 space-y-3">
        <div className="h-8 w-full bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-4 w-8 bg-muted" />
            <div className="h-4 w-32 bg-muted" />
            <div className="h-4 w-16 bg-muted" />
            <div className="h-4 w-8 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
