type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export default function StructuredData({ data }: StructuredDataProps) {
  const items = Array.isArray(data) ? data : [data];
  return items.map((item, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
    />
  ));
}
