"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconUpload } from "@tabler/icons-react";

type PoolData = {
  id?: string;
  name: string;
  description: string;
  address: string;
  imageUrl?: string | null;
  isActive: boolean;
  type: string;
  defaultMaxDuration: number;
  defaultMinAdvance: number;
  defaultCancelWindow: number;
};

export function PoolForm({ pool }: { pool?: PoolData }) {
  const router = useRouter();
  const isEditing = !!pool?.id;
  const [name, setName] = useState(pool?.name ?? "");
  const [description, setDescription] = useState(pool?.description ?? "");
  const [address, setAddress] = useState(pool?.address ?? "");
  const [imageUrl, setImageUrl] = useState(pool?.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [isActive, setIsActive] = useState(pool?.isActive ?? true);
  const [type, setType] = useState(pool?.type ?? "adult");
  const [defaultMaxDuration, setDefaultMaxDuration] = useState(pool?.defaultMaxDuration ?? 240);
  const [defaultMinAdvance, setDefaultMinAdvance] = useState(pool?.defaultMinAdvance ?? 2);
  const [defaultCancelWindow, setDefaultCancelWindow] = useState(pool?.defaultCancelWindow ?? 1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let finalImageUrl = imageUrl;

    if (imageFile) {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      setImageUploading(false);

      if (!uploadRes.ok) {
        const uploadError = await uploadRes.json().catch(() => ({ error: "Failed to upload image" }));
        setError(uploadError.error || "Failed to upload image");
        setLoading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      finalImageUrl = uploadData.url;
    }

    const url = isEditing ? `/api/admin/pools/${pool!.id}` : "/api/admin/pools";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        address,
        imageUrl: finalImageUrl,
        isActive,
        type,
        defaultMaxDuration,
        defaultMinAdvance,
        defaultCancelWindow,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save pool");
      setLoading(false);
      return;
    }

    toast.success(isEditing ? "Pool updated" : "Pool created");
    router.push("/admin/pools");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="name">Name</label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="description">Description</label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="address">Address</label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="type">Pool Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-9 w-full rounded-none border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="adult">Adult Pool</option>
            <option value="kids">Kids Pool</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Image</label>
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-none border border-dashed border-input text-xs text-muted-foreground hover:border-ring transition-colors">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full object-cover" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="Current" className="h-full object-cover" />
            ) : (
              <span className="flex items-center gap-2">
                <IconUpload className="size-4" />
                Upload image
              </span>
            )}
            <input type="file" accept="image/*" onChange={handleImageSelect} className="sr-only" />
          </label>
        </div>
      </div>
      <fieldset className="space-y-4">
        <legend className="text-xs font-medium">Rules</legend>
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="defaultMaxDuration">Max Duration (minutes)</label>
          <Input id="defaultMaxDuration" type="number" min={1} value={defaultMaxDuration} onChange={(e) => setDefaultMaxDuration(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="defaultMinAdvance">Min Advance (hours)</label>
          <Input id="defaultMinAdvance" type="number" min={0} value={defaultMinAdvance} onChange={(e) => setDefaultMinAdvance(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium" htmlFor="defaultCancelWindow">Cancel Window (hours before start)</label>
          <Input id="defaultCancelWindow" type="number" min={0} value={defaultCancelWindow} onChange={(e) => setDefaultCancelWindow(Number(e.target.value))} />
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4" />
          Active
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading || imageUploading}>
          {loading ? "Saving..." : isEditing ? "Update Pool" : "Create Pool"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/pools")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
