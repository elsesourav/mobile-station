import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createLegalDocumentSchema,
  estimateMarkdownReadingMinutes,
  extractMarkdownToc,
  parseLegalMarkdown,
  sanitizeMarkdownUrl,
} from '@mobile-station/types'
import { getSeedLegalDocuments } from '@/lib/legal'

describe('Legal & Privacy Markdown CMS system', () => {
  it('parses headings, lists, blockquotes, tables, and inline formatting safely into AST blocks', () => {
    const sampleMd = [
      '## 1. Privacy Notice',
      '',
      'Mobile Station protects your **IMEI** and *GSTIN* via `AES` storage. See [Warranty](/policies/warranty).',
      '',
      '| Layer | Role |',
      '| --- | --- |',
      '| Postgres | Order records |',
      '',
      '- Bullet one',
      '- Bullet two',
      '',
      '> Official grievance contact: support@mobilestation.in',
    ].join('\n')

    const blocks = parseLegalMarkdown(sampleMd)
    expect(blocks[0]?.type).toBe('heading')
    expect(blocks.some((b) => b.type === 'paragraph')).toBe(true)
    expect(blocks.some((b) => b.type === 'table')).toBe(true)
    expect(blocks.some((b) => b.type === 'list')).toBe(true)
    expect(blocks.some((b) => b.type === 'blockquote')).toBe(true)

    const toc = extractMarkdownToc(sampleMd)
    expect(toc).toEqual([{ id: '1-privacy-notice', level: 2, text: '1. Privacy Notice' }])
    expect(estimateMarkdownReadingMinutes(sampleMd)).toBeGreaterThanOrEqual(1)
  })

  it('neutralizes unsafe XSS link protocols and enforces slug normalization', () => {
    expect(sanitizeMarkdownUrl('javascript:alert(1)')).toBe('#')
    expect(sanitizeMarkdownUrl('data:text/html,<script>1</script>')).toBe('#')
    expect(sanitizeMarkdownUrl('https://mobilestation.in/legal')).toBe('https://mobilestation.in/legal')
    expect(sanitizeMarkdownUrl('/policies/privacy-policy')).toBe('/policies/privacy-policy')

    const parsed = createLegalDocumentSchema.parse({
      slug: 'Cookie Policy 2026!',
      title: 'Cookie & Tracking Policy',
      category: 'privacy',
      summary: 'How local cart and analytics storage cookies operate across Mobile Station.',
      content_markdown: '## Cookies Overview\n\nWe use lightweight local storage keys for cart continuity.',
    })
    expect(parsed.slug).toBe('cookie-policy-2026')
    expect(parsed.status).toBe('published')
  })

  it('includes all core legal policies in seed dataset and links Privacy & Terms in Footer and Menu', () => {
    const docs = getSeedLegalDocuments()
    const slugs = docs.map((d) => d.slug)
    expect(slugs).toContain('privacy-policy')
    expect(slugs).toContain('terms-and-conditions')
    expect(slugs).toContain('warranty')
    expect(slugs).toContain('open-box-delivery')
    expect(slugs).toContain('gst-invoicing')
    expect(slugs).toContain('returns-and-refunds')

    const footerSrc = readFileSync(
      path.resolve(__dirname, '../components/layout/Footer.tsx'),
      'utf8'
    )
    const menuSrc = readFileSync(
      path.resolve(__dirname, '../components/menu/MenuHubClient.tsx'),
      'utf8'
    )
    expect(footerSrc).toContain('/policies/privacy-policy')
    expect(footerSrc).toContain('/policies/terms-and-conditions')
    expect(footerSrc).toContain('/policies/returns-and-refunds')
    expect(menuSrc).toContain('/policies/privacy-policy')
    expect(menuSrc).toContain('/policies/terms-and-conditions')
  })
})
