import React from 'react'
import Link from 'next/link'
import {
  parseLegalMarkdown,
  type MarkdownInlineNode,
} from '@mobile-station/types'

function renderInlineNodes(nodes: MarkdownInlineNode[], keyPrefix: string): React.ReactNode {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    if (node.type === 'text') {
      return <React.Fragment key={key}>{node.text}</React.Fragment>
    }
    if (node.type === 'strong') {
      return (
        <strong key={key} className="font-semibold text-ink-primary">
          {renderInlineNodes(node.children, key)}
        </strong>
      )
    }
    if (node.type === 'em') {
      return (
        <em key={key} className="italic">
          {renderInlineNodes(node.children, key)}
        </em>
      )
    }
    if (node.type === 'code') {
      return (
        <code
          key={key}
          className="rounded-xs bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-ink-primary border border-chrome-200"
        >
          {node.text}
        </code>
      )
    }

    if (node.href.startsWith('/')) {
      return (
        <Link
          key={key}
          href={node.href}
          className="font-medium text-gold-700 underline underline-offset-2 hover:text-ink-primary transition-colors"
        >
          {node.label}
        </Link>
      )
    }

    return (
      <a
        key={key}
        href={node.href}
        target={node.href.startsWith('http') ? '_blank' : undefined}
        rel={node.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="font-medium text-gold-700 underline underline-offset-2 hover:text-ink-primary transition-colors"
      >
        {node.label}
      </a>
    )
  })
}

/**
 * XSS-safe Markdown renderer driven by @mobile-station/types AST blocks and semantic tokens.
 */
export function MarkdownArticle({ markdown }: { markdown: string }) {
  const blocks = parseLegalMarkdown(markdown)

  return (
    <div className="space-y-4 text-sm sm:text-[15px] text-ink-secondary leading-relaxed">
      {blocks.map((block, index) => {
        const key = `md-block-${index}`

        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h2
                key={key}
                id={block.id}
                className="scroll-mt-28 font-display text-xl sm:text-2xl font-bold text-ink-primary pt-3"
              >
                {renderInlineNodes(block.children, key)}
              </h2>
            )
          }
          if (block.level === 2) {
            return (
              <h2
                key={key}
                id={block.id}
                className="scroll-mt-28 font-display text-lg sm:text-xl font-bold text-ink-primary pt-4 pb-1.5 border-b border-chrome-200"
              >
                {renderInlineNodes(block.children, key)}
              </h2>
            )
          }
          if (block.level === 3) {
            return (
              <h3
                key={key}
                id={block.id}
                className="scroll-mt-28 font-display text-base sm:text-lg font-bold text-ink-primary pt-3"
              >
                {renderInlineNodes(block.children, key)}
              </h3>
            )
          }
          return (
            <h4
              key={key}
              id={block.id}
              className="scroll-mt-28 font-display text-sm font-bold uppercase tracking-wider text-gold-700 pt-2"
            >
              {renderInlineNodes(block.children, key)}
            </h4>
          )
        }

        if (block.type === 'paragraph') {
          return <p key={key}>{renderInlineNodes(block.children, key)}</p>
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'
          return (
            <ListTag
              key={key}
              className={`pl-5 space-y-2 ${
                block.ordered ? 'list-decimal marker:font-mono marker:font-semibold marker:text-gold-700' : 'list-disc marker:text-gold-700'
              }`}
            >
              {block.items.map((itemNodes, itemIdx) => (
                <li key={`${key}-li-${itemIdx}`} className="pl-1">
                  {renderInlineNodes(itemNodes, `${key}-li-${itemIdx}`)}
                </li>
              ))}
            </ListTag>
          )
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={key}
              className="rounded-r-md border-l-4 border-gold-500 bg-surface-muted px-4 py-3 text-xs sm:text-sm text-ink-primary space-y-2"
            >
              {block.paragraphs.map((pNodes, pIdx) => (
                <p key={`${key}-bq-${pIdx}`}>{renderInlineNodes(pNodes, `${key}-bq-${pIdx}`)}</p>
              ))}
            </blockquote>
          )
        }

        if (block.type === 'code') {
          return (
            <pre
              key={key}
              className="rounded-md border border-chrome-200 bg-obsidian-950 text-ink-inverse p-3.5 font-mono text-xs overflow-x-auto"
            >
              <code>{block.code}</code>
            </pre>
          )
        }

        if (block.type === 'table') {
          return (
            <div key={key} className="overflow-x-auto rounded-md border border-chrome-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-surface-muted border-b border-chrome-200 text-ink-primary">
                  <tr>
                    {block.headers.map((headerNodes, hIdx) => (
                      <th
                        key={`${key}-th-${hIdx}`}
                        className="px-3.5 py-2.5 font-display font-bold whitespace-nowrap"
                      >
                        {renderInlineNodes(headerNodes, `${key}-th-${hIdx}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-chrome-200 bg-surface-card">
                  {block.rows.map((row, rIdx) => (
                    <tr key={`${key}-tr-${rIdx}`}>
                      {row.map((cellNodes, cIdx) => (
                        <td key={`${key}-td-${rIdx}-${cIdx}`} className="px-3.5 py-2.5 align-top">
                          {renderInlineNodes(cellNodes, `${key}-td-${rIdx}-${cIdx}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        return <hr key={key} className="border-chrome-200 my-4" />
      })}
    </div>
  )
}
