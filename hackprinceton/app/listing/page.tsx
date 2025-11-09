"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Listing {
  id: number;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  description: string;
  images: string[] | string | null;
  property_type?: string;
  guests?: number;
  amenities?: string[];
  pet_friendly?: boolean;
  party_friendly?: boolean;
}

export default function ListingPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/fetch_listings");
        const data = await res.json();
        
        if (!data.ok) {
          throw new Error(data.error || "Failed to fetch listings");
        }
        
        setListings(data.listings || []);
      } catch (err) {
        setError((err as Error).message || "Failed to load listings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const getImageUrl = (images: string[] | string | null): string | null => {
    if (!images) return null;
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        return parsed;
      } catch {
        return images;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">All Listings 🏡</h1>
        
        {listings.length === 0 ? (
          <p className="text-lg text-muted-foreground">No listings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const imageUrl = getImageUrl(listing.images);
              return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {imageUrl && (
                  <div className="w-full h-48 overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{listing.title}</CardTitle>
                    <div className="text-lg font-bold text-primary">
                      ${listing.price}
                      <span className="text-sm font-normal text-muted-foreground">/night</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{listing.location}</p>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-foreground mb-4">
                    {truncateDescription(listing.description)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>🛏️ {listing.beds} bed{listing.beds !== 1 ? 's' : ''}</span>
                    <span>🚿 {listing.baths} bath{listing.baths !== 1 ? 's' : ''}</span>
                    {listing.guests && (
                      <span>👥 {listing.guests} guest{listing.guests !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  
                  {listing.property_type && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {listing.property_type}
                    </p>
                  )}
                </CardContent>
                
                <CardFooter className="flex gap-2 flex-wrap">
                  {listing.pet_friendly && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      🐾 Pet Friendly
                    </span>
                  )}
                  {listing.party_friendly && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      🎉 Party Friendly
                    </span>
                  )}
                </CardFooter>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

