"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus, IconUpload } from "@tabler/icons-react";

export function CreatePoolDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [defaultMaxDuration, setDefaultMaxDuration] = useState(240);
  const [defaultMinAdvance, setDefaultMinAdvance] = useState(2);
  const [defaultCancelWindow, setDefaultCancelWindow] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [type, setType] = useState("adult");
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

    let imageUrl: string | null = null;

    if (imageFile) {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      setImageUploading(false);

      if (!uploadRes.ok) {
        setError("Failed to upload image");
        setLoading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch("/api/admin/pools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        address,
        imageUrl,
        isActive,
        type,
        defaultMaxDuration,
        defaultMinAdvance,
        defaultCancelWindow,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create pool");
      setLoading(false);
      return;
    }

    toast.success("Pool created");
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button nativeButton={true} size="sm" className="text-[10px] font-bold uppercase tracking-widest"><IconPlus className="size-3" />Add New</Button>} />
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Pool</SheetTitle>
          <SheetDescription>Add a new swimming pool</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-6">
          {error && (
            <div className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="dialog-name">Name</label>
            <Input id="dialog-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="dialog-description">Description</label>
            <Input id="dialog-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="dialog-address">Address</label>
            <Input id="dialog-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="dialog-type">Pool Type</label>
            <select
              id="dialog-type"
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
              ) : (
                <span className="flex items-center gap-2">
                  <IconUpload className="size-4" />
                  Upload image
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleImageSelect} className="sr-only" />
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium">Rules</legend>
            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="dialog-max-duration">Max Duration (min)</label>
              <Input id="dialog-max-duration" type="number" min={1} value={defaultMaxDuration} onChange={(e) => setDefaultMaxDuration(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="dialog-min-advance">Min Advance (hrs)</label>
              <Input id="dialog-min-advance" type="number" min={0} value={defaultMinAdvance} onChange={(e) => setDefaultMinAdvance(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="dialog-cancel-window">Cancel Window (hrs)</label>
              <Input id="dialog-cancel-window" type="number" min={0} value={defaultCancelWindow} onChange={(e) => setDefaultCancelWindow(Number(e.target.value))} />
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-xs font-medium">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4" />
            Active
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading || imageUploading}>
              {loading ? "Creating..." : "Create Pool"}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
