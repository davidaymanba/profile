"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveProfileMedia } from "@/app/admin/actions";

export function CvUpload({
  currentUrl,
  onUploaded,
  galleryUrls = [],
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
  galleryUrls?: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  async function handleUpload(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    setError("");
    setSavedMsg("");
    const supabase = createClient();
    const path = `cv/david-ayman-cv.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, {
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    const nextUrl = `${data.publicUrl}?v=${Date.now()}`;

    try {
      await saveProfileMedia({ galleryUrls, cvUrl: nextUrl });
      onUploaded(nextUrl);
      setSavedMsg("CV saved.");
      setTimeout(() => setSavedMsg(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save CV");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] p-4">
      <div>
        <p className="text-sm font-medium text-navy-deep">CV / Resume (PDF)</p>
        <p className="mt-1 text-xs text-ink-muted">
          Upload a PDF. It is saved automatically after upload.
        </p>
      </div>

      {currentUrl ? (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-accent hover:underline"
        >
          View current CV
        </a>
      ) : (
        <p className="text-sm text-ink-muted">No CV uploaded yet.</p>
      )}

      <input
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
        className="block w-full text-sm text-ink-muted"
      />
      {uploading ? <p className="text-sm text-accent">Uploading...</p> : null}
      {savedMsg ? <p className="text-sm text-accent">{savedMsg}</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
