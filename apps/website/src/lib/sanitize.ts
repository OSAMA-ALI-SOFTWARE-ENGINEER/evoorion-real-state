/**
 * Server-side HTML sanitizer for admin-authored blog content.
 * Removes script/iframe/object/embed elements, event-handler attributes,
 * and javascript:/data: URIs. Admin content is trusted but we still apply
 * defence-in-depth.
 *
 * Production note: replace with `sanitize-html` once network access is available.
 *   npm install sanitize-html @types/sanitize-html
 */

const BLOCK_ELEMENTS_RE =
  /<(script|style|iframe|object|embed|form|base|link|meta|template|svg|math)[\s\S]*?<\/\1\s*>|<(script|style|iframe|object|embed|form|base|link|meta|template|svg|math)(\s[^>]*)?\/?>/gi

const EVENT_ATTRS_RE = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

const DANGEROUS_URIS_RE =
  /(<[^>]+(?:href|src|action|formaction|background|poster)\s*=\s*["']?)(?:javascript|data|vbscript):[^"'>]*/gi

const DANGEROUS_ATTRS_RE =
  /\s+(?:srcdoc|formaction|xmlns|xlink:\w+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

export function sanitizeBlogContent(html: string): string {
  return html
    .replace(BLOCK_ELEMENTS_RE, '')
    .replace(EVENT_ATTRS_RE, '')
    .replace(DANGEROUS_URIS_RE, '$1#')
    .replace(DANGEROUS_ATTRS_RE, '')
}
