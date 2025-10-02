type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  nonce?: string;
};

export default function StructuredData({ data, nonce }: StructuredDataProps) {
  const items = Array.isArray(data) ? data : [data];
  return items.map((item, index) => (
    <script
      key={index}
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
    />
  ));
}
