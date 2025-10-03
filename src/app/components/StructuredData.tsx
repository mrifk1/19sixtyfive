"use client";

import { useEffect, useState } from "react";

type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  nonce?: string;
};

export default function StructuredData({ data, nonce }: StructuredDataProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering on client-side only
  if (!mounted) {
    return null;
  }

  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          nonce={nonce || ""}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
