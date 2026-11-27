import React from 'react'
import {
  estimateMarkdownReadingMinutes,
  parseLegalMarkdown,
  type MarkdownInlineNode,
} from '@mobile-station/types'
import { Badge, Text } from '@medusajs/ui'

function renderInlineNodes(nodes: MarkdownInlineNode[], keyPrefix: string): React.ReactNode {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    if (node.type === 'text') return <React.Fragment key={key}>{node.text}</React.Fragment>
    if (node.type === 'strong') {
      return (
        <strong key={key} className="font-semibold text-ui-fg-base">
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
          className="rounded bg-ui-bg-subtle px-1.5 py-0.5 font-mono text-[11px] text-ui-fg-base border border-ui-border-base"
        >
          {node.text}
        </code>
      )
    }
    return (
      <a
        key={key}
        href={node.href}
        target={node.href.startsWith('http') ? '_blank' : undefined}
        rel={node.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="underline text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
      >
        {node.label}
      </a>
    )
  })
}

export function LegalMarkdownPreview({
  title,
  badge,
  summary,
  markdown,
}: {
  title: string
  badge: string
  summary: string
  markdown: string
}) {
  const blocks = parseLegalMarkdown(markdown)
  const readingMins = estimateMarkdownReadingMinutes(markdown)
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col h-full bg-ui-bg-base">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-ui-border-base bg-ui-bg-subtle">
        <span className="text-xs font-medium text-ui-fg-subtle">Live Storefront Preview</span>
        <span className="text-[11px] font-mono text-ui-fg-muted">
          {wordCount} words · {readingMins} min read
        </span>
      </div>

      <div className="p-5 overflow-y-auto max-h-[540px] space-y-4">
        <div className="pb-4 border-b border-ui-border-base space-y-2">
          <Badge size="small" color="orange">
            {badge || 'LEGAL & POLICY'}
          </Badge>
          <h2 className="text-xl font-semibold text-ui-fg-base leading-snug">
            {title || 'Untitled Legal Policy'}
          </h2>
          {summary && (
            <Text size="small" className="text-ui-fg-subtle leading-relaxed">
              {summary}
            </Text>
          )}
        </div>

        {blocks.length === 0 ? (
          <Text size="small" className="text-ui-fg-muted italic">
            Start typing Markdown on the left to preview headings, bullet lists, callouts, and GST/privacy tables.
          </Text>
        ) : (
          <div className="space-y-3 text-sm text-ui-fg-subtle leading-relaxed">
            {blocks.map((block, idx) => {
              const key = `blk-${idx}`
              if (block.type === 'heading') {
                if (block.level === 1) {
                  return (
                    <h1 key={key} className="text-lg font-bold text-ui-fg-base pt-2">
                      {renderInlineNodes(block.children, key)}
                    </h1>
                  )
                }
                if (block.level === 2) {
                  return (
                    <h2
                      key={key}
                      className="text-base font-semibold text-ui-fg-base pt-3 pb-1 border-b border-ui-border-base"
                    >
                      {renderInlineNodes(block.children, key)}
                    </h2>
                  )
                }
                return (
                  <h3 key={key} className="text-sm font-semibold text-ui-fg-base pt-2">
                    {renderInlineNodes(block.children, key)}
                  </h3>
                )
              }

              if (block.type === 'paragraph') {
                return <p key={key}>{renderInlineNodes(block.children, key)}</p>
              }

              if (block.type === 'list') {
                const Tag = block.ordered ? 'ol' : 'ul'
                return (
                  <Tag
                    key={key}
                    className={`pl-5 space-y-1.5 ${
                      block.ordered ? 'list-decimal' : 'list-disc'
                    }`}
                  >
                    {block.items.map((itemNodes, itemIdx) => (
                      <li key={`${key}-li-${itemIdx}`}>
                        {renderInlineNodes(itemNodes, `${key}-li-${itemIdx}`)}
                      </li>
                    ))}
                  </Tag>
                )
              }

              if (block.type === 'blockquote') {
                return (
                  <blockquote
                    key={key}
                    className="border-l-2 border-ui-border-strong bg-ui-bg-subtle px-3.5 py-2.5 rounded-r text-xs text-ui-fg-base space-y-1.5"
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
                    className="rounded border border-ui-border-base bg-ui-bg-subtle p-3 font-mono text-xs overflow-x-auto text-ui-fg-base"
                  >
                    <code>{block.code}</code>
                  </pre>
                )
              }

              if (block.type === 'table') {
                return (
                  <div key={key} className="overflow-x-auto border border-ui-border-base rounded">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-ui-bg-subtle border-b border-ui-border-base text-ui-fg-base">
                        <tr>
                          {block.headers.map((headerNodes, hIdx) => (
                            <th key={`${key}-th-${hIdx}`} className="px-3 py-2 font-semibold">
                              {renderInlineNodes(headerNodes, `${key}-th-${hIdx}`)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ui-border-base">
                        {block.rows.map((row, rIdx) => (
                          <tr key={`${key}-tr-${rIdx}`}>
                            {row.map((cellNodes, cIdx) => (
                              <td key={`${key}-td-${rIdx}-${cIdx}`} className="px-3 py-2">
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

              return <hr key={key} className="border-ui-border-base my-3" />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
