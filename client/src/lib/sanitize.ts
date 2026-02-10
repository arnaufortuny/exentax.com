import DOMPurify from "dompurify";

const purifyConfig = {
  ALLOWED_TAGS: ["span", "br", "strong", "em", "b", "i", "u", "mark", "sub", "sup"],
  ALLOWED_ATTR: ["class", "style"],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
};

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, purifyConfig) as string;
}

export function createSafeHtml(dirty: string): { __html: string } {
  return { __html: sanitizeHtml(dirty) };
}
