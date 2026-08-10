/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script injection with escaped `<` per Next.js guidance. */

type JsonLdValue = Record<string, unknown>

function getJsonLdKey(item: JsonLdValue, index: number): string {
  const type = item['@type']
  if (typeof type === 'string') {
    return `${type}-${index}`
  }
  return `json-ld-${index}`
}

function serializeJsonLd(item: JsonLdValue): string {
  return JSON.stringify(item).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  const items = Array.isArray(data) ? data : [data]

  return (
    <>
      {items.map((item, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
          key={getJsonLdKey(item, index)}
          type="application/ld+json"
        />
      ))}
    </>
  )
}
