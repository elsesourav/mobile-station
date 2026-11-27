export type MarkdownInlineNode =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: MarkdownInlineNode[] }
  | { type: 'em'; children: MarkdownInlineNode[] }
  | { type: 'code'; text: string }
  | { type: 'link'; href: string; label: string }

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; id: string; children: MarkdownInlineNode[]; rawText: string }
  | { type: 'paragraph'; children: MarkdownInlineNode[] }
  | { type: 'list'; ordered: boolean; items: MarkdownInlineNode[][] }
  | { type: 'blockquote'; paragraphs: MarkdownInlineNode[][] }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: MarkdownInlineNode[][]; rows: MarkdownInlineNode[][][] }
  | { type: 'hr' }

export interface MarkdownTocItem {
  id: string
  level: 1 | 2 | 3 | 4
  text: string
}

export function slugifyMarkdownHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'section'
  )
}

export function sanitizeMarkdownUrl(rawHref: string): string {
  const trimmed = rawHref.trim()
  if (!trimmed) return '#'
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed
  }
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('mailto:')
  ) {
    return trimmed
  }
  return '#'
}

/**
 * Parses safe inline Markdown formatting (`**bold**`, `*italic*`, `` `code` ``, `[label](url)`)
 * into a structured AST without raw HTML injection.
 */
export function parseMarkdownInline(input: string): MarkdownInlineNode[] {
  const nodes: MarkdownInlineNode[] = []
  let idx = 0

  const pushText = (chunk: string) => {
    if (!chunk) return
    const prev = nodes[nodes.length - 1]
    if (prev && prev.type === 'text') {
      prev.text += chunk
    } else {
      nodes.push({ type: 'text', text: chunk })
    }
  }

  while (idx < input.length) {
    // 1. Inline code span
    if (input[idx] === '`') {
      const endTick = input.indexOf('`', idx + 1)
      if (endTick > idx + 1) {
        nodes.push({ type: 'code', text: input.slice(idx + 1, endTick) })
        idx = endTick + 1
        continue
      }
    }

    // 2. Link [label](url)
    if (input[idx] === '[') {
      const closeBracket = input.indexOf(']', idx + 1)
      if (closeBracket > idx && input[closeBracket + 1] === '(') {
        const closeParen = input.indexOf(')', closeBracket + 2)
        if (closeParen > closeBracket + 2) {
          const label = input.slice(idx + 1, closeBracket)
          const rawHref = input.slice(closeBracket + 2, closeParen)
          nodes.push({
            type: 'link',
            label,
            href: sanitizeMarkdownUrl(rawHref),
          })
          idx = closeParen + 1
          continue
        }
      }
    }

    // 3. Bold (**text**)
    if (input[idx] === '*' && input[idx + 1] === '*') {
      const endBold = input.indexOf('**', idx + 2)
      if (endBold > idx + 2) {
        nodes.push({
          type: 'strong',
          children: parseMarkdownInline(input.slice(idx + 2, endBold)),
        })
        idx = endBold + 2
        continue
      }
    }

    // 4. Italic (*text*)
    if (input[idx] === '*' && input[idx + 1] !== '*') {
      const endEm = input.indexOf('*', idx + 1)
      if (endEm > idx + 1) {
        nodes.push({
          type: 'em',
          children: parseMarkdownInline(input.slice(idx + 1, endEm)),
        })
        idx = endEm + 1
        continue
      }
    }

    pushText(input[idx])
    idx++
  }

  return nodes
}

function splitTableRow(line: string): string[] {
  const normalized = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return normalized.split('|').map((cell) => cell.trim())
}

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.includes('|')) return false
  const cells = splitTableRow(trimmed)
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c))
}

function isBlockStarter(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return true
  if (/^#{1,4}\s+/.test(trimmed)) return true
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) return true
  if (/^```/.test(trimmed)) return true
  if (/^>\s?/.test(trimmed)) return true
  if (/^[-*+]\s+/.test(trimmed)) return true
  if (/^\d+\.\s+/.test(trimmed)) return true
  return false
}

/**
 * Parses clean Markdown documents into typed block AST nodes suitable for SSR React components
 * and live browser editor previews without XSS risks.
 */
export function parseLegalMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: MarkdownBlock[] = []
  const headingSlugCounts = new Map<string, number>()

  let i = 0
  while (i < lines.length) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Fenced code block
    const fenceMatch = trimmed.match(/^```([a-zA-Z0-9_-]*)$/)
    if (fenceMatch) {
      const language = fenceMatch[1] || 'text'
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      blocks.push({ type: 'code', language, code: codeLines.join('\n') })
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Heading h1..h4
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4
      const rawText = headingMatch[2].replace(/\s+#*$/, '').trim()
      const baseSlug = slugifyMarkdownHeading(rawText)
      const count = (headingSlugCounts.get(baseSlug) ?? 0) + 1
      headingSlugCounts.set(baseSlug, count)
      const id = count > 1 ? `${baseSlug}-${count}` : baseSlug

      blocks.push({
        type: 'heading',
        level,
        id,
        rawText,
        children: parseMarkdownInline(rawText),
      })
      i++
      continue
    }

    // Pipe Table
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      isTableSeparatorLine(lines[i + 1])
    ) {
      const headers = splitTableRow(trimmed).map((cell) => parseMarkdownInline(cell))
      i += 2
      const rows: MarkdownInlineNode[][][] = []
      while (i < lines.length && lines[i].trim().includes('|') && !lines[i].trim().startsWith('#')) {
        rows.push(splitTableRow(lines[i]).map((cell) => parseMarkdownInline(cell)))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      const paragraphs = quoteLines
        .join('\n')
        .split(/\n{2,}/)
        .map((chunk) => parseMarkdownInline(chunk.replace(/\n+/g, ' ').trim()))
        .filter((nodes) => nodes.length > 0)
      blocks.push({ type: 'blockquote', paragraphs })
      continue
    }

    // Unordered List
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: MarkdownInlineNode[][] = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(parseMarkdownInline(lines[i].trim().replace(/^[-*+]\s+/, '')))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // Ordered List
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: MarkdownInlineNode[][] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(parseMarkdownInline(lines[i].trim().replace(/^\d+\.\s+/, '')))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // Paragraph (join wrapped continuation lines until blank or next block)
    const paraLines: string[] = [trimmed]
    i++
    while (
      i < lines.length &&
      !isBlockStarter(lines[i]) &&
      !(lines[i].trim().includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1]))
    ) {
      paraLines.push(lines[i].trim())
      i++
    }
    blocks.push({
      type: 'paragraph',
      children: parseMarkdownInline(paraLines.join(' ')),
    })
  }

  return blocks
}

export function extractMarkdownToc(markdown: string): MarkdownTocItem[] {
  return parseLegalMarkdown(markdown)
    .filter(
      (block): block is Extract<MarkdownBlock, { type: 'heading' }> =>
        block.type === 'heading' && block.level >= 2 && block.level <= 3
    )
    .map((h) => ({
      id: h.id,
      level: h.level,
      text: h.rawText,
    }))
}

export function estimateMarkdownReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
