import { PoolForm } from "@/components/pool/pool-form";

export default function NewPoolPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium">New Pool</h1>
        <p className="text-xs text-muted-foreground">Add a new swimming pool</p>
      </div>
      <PoolForm />
    </div>
  );
}
