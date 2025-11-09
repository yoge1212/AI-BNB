// app/createListing/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function CreateListingPage() {
  const supabase = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return createClient();
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local preview URLs for selected files
  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  function handleClear() {
    // Revoke all preview URLs to prevent memory leaks
    previews.forEach((url) => URL.revokeObjectURL(url));
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clear all state
    setImages([]);
    setListing(null);
    setError(null);
  }

  async function uploadImages() {
    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }

    const urls: string[] = [];
    for (const file of images) {
      const path = `host_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from("listingImages").upload(path, file);
      if (error) {
        console.error("upload error", error);
        continue;
      }
      const { data: publicUrl } = supabase.storage.from("listingImages").getPublicUrl(data.path);
      urls.push(publicUrl.publicUrl);
    }
    return urls;
  }

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const urls = await uploadImages();

      const res = await fetch(`/api/create_listing_details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: urls }),
      });
      const data = await res.json();

      // `app/api/listing/route.ts` returns { listing: <backendResponse> }
      const backendWrapper = data?.listing;
      if (!backendWrapper) throw new Error(data?.error || "No listing returned");

      // Flask backend returns { ok: true, listing: "<json string>" }
      let parsed: Record<string, unknown> | string = {};
      if (backendWrapper != null) {
        if (typeof backendWrapper === "object") parsed = backendWrapper as Record<string, unknown>;
        else parsed = String(backendWrapper);
      }

      // If backendWrapper has ok/listing fields
      if (backendWrapper?.ok === true && typeof backendWrapper.listing === "string") {
        // try to parse the JSON string returned by the agent
        try {
          parsed = JSON.parse(backendWrapper.listing);
        } catch {
          // not JSON — keep as string
          parsed = { raw: backendWrapper.listing };
        }
      } else if (typeof backendWrapper === "string") {
        // sometimes the route may return the raw JSON string
        try {
          parsed = JSON.parse(backendWrapper);
        } catch {
          parsed = { raw: backendWrapper };
        }
      }

      // Attach the image urls we uploaded so the UI can show them
      if (Array.isArray(parsed)) {
        // if the agent returned an array, wrap it
        parsed = { results: parsed };
      }
      if (typeof parsed === "object" && parsed !== null) {
        (parsed as Record<string, unknown>).images = (parsed as Record<string, unknown>).images || urls;
        const finalListing = parsed as Record<string, unknown>;
        setListing(finalListing);
      } else {
        // parsed is a string (raw), wrap into an object so the UI can render consistently
        const finalListing = { raw: parsed, images: urls };
        setListing(finalListing);
      }
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error)?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
 
    try {
      const res = await fetch("/api/publish_listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
  
      // Check if request succeeded
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish listing");
      }
  
      // Parse JSON response
      const data = await res.json();
      console.log("Response:", data);
  
      alert("Listing published successfully!");
      return data; // <-- This lets you use it elsewhere if needed
  
    } catch (e) {
      alert("Publish failed: " + (e as Error).message);
      console.error(e);
      return null; // optional
    }
  }
  

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold">Create your listing 🏡</h1>

      <div className="border-2 border-dashed rounded-xl p-6">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {previews.map((p, i) => (
              // use regular img for arbitrary URLs to avoid remotePattern requirements
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={p} alt={`preview-${i}`} className="w-full h-40 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleGenerate} disabled={loading || !images.length}>
          {loading ? "Generating..." : "Generate Listing with AI"}
        </Button>
        <Button onClick={handleClear}>Clear</Button>
      </div>

      {error && <div className="text-red-600">Error: {error}</div>}

      {listing && (
        <div className="mt-8 border rounded-xl p-4 shadow">
          {(() => {
            const data = listing as Record<string, unknown>;
            const title = typeof data["title"] === "string" ? (data["title"] as string) : typeof data["name"] === "string" ? (data["name"] as string) : "AI-generated listing";
            const desc = typeof data["description"] === "string" ? (data["description"] as string) : undefined;
            const imagesArr = Array.isArray(data["image_urls"]) ? (data["image_urls"] as string[]) : [];
            const beds = typeof data["num_beds"] === "number" ? data["num_beds"] : data["beds"];
            const baths = typeof data["num_baths"] === "number" ? data["num_baths"] : data["baths"];
            const propertyType = typeof data["property_type"] === "string" ? (data["property_type"] as string) : undefined;
            const amenities = Array.isArray(data["amenities"]) ? (data["amenities"] as string[]) : undefined;
            const highlights = Array.isArray(data["highlights"]) ? (data["highlights"] as string[]) : undefined;
            const tags = Array.isArray(data["ai_tags"]) ? (data["ai_tags"] as string[]) : undefined;


            return (
              <>
                <h2 className="text-2xl font-semibold">{title}</h2>
                {desc && <p className="text-gray-600 mt-2">{desc}</p>}

                <div className="grid grid-cols-3 gap-2 my-3">
                  {imagesArr.map((url: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt={`listing-${i}`} className="w-full h-40 object-cover rounded-lg" />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Beds:</strong> {beds != null ? String(beds) : "N/A"}</p>
                    <p><strong>Baths:</strong> {baths != null ? String(baths) : "N/A"}</p>
                    <p><strong>Property type:</strong> {propertyType ?? "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>Amenities:</strong> {amenities ? amenities.join(", ") : "—"}</p>
                    <p><strong>Highlights:</strong> {highlights ? highlights.join(", ") : "—"}</p>
                    <p><strong>Tags:</strong> {tags ? tags.join(", ") : "—"}</p>
                  </div>
                </div>
              </>
            );
          })()}

          <div className="mt-4 flex gap-3">
            <Button onClick={handlePublish}>Publish Listing</Button>
          </div>
        </div>
      )}
    </div>
  );
}
