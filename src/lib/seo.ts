/** Standard meta tags (title, description, Open Graph, Twitter card) for a page. */
export function pageMeta({
  title,
  description,
  ogTitle = title,
}: {
  title: string;
  description: string;
  /** Open Graph title, when it should differ from the document title. */
  ogTitle?: string;
}) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
