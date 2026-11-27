import React, { useRef, useState } from 'react'
import { Button, Tabs } from '@medusajs/ui'
import { LegalMarkdownPreview } from './LegalMarkdownPreview'

type EditorViewMode = 'split' | 'write' | 'preview'

interface LegalMarkdownEditorProps {
  title: string
  badge: string
  summary: string
  value: string
  onChange: (nextMarkdown: string) => void
  onSaveShortcut?: () => void
}

interface ToolbarAction {
  label: string
  title: string
  type: 'wrap' | 'line' | 'snippet'
  before: string
  after?: string
  placeholder: string
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: 'H2', title: 'Section Heading', type: 'line', before: '## ', placeholder: 'Section Heading' },
  { label: 'H3', title: 'Sub-heading', type: 'line', before: '### ', placeholder: 'Sub-heading' },
  { label: 'B', title: 'Bold (**text**)', type: 'wrap', before: '**', after: '**', placeholder: 'bold text' },
  { label: 'I', title: 'Italic (*text*)', type: 'wrap', before: '*', after: '*', placeholder: 'italic text' },
  { label: 'Code', title: 'Inline code', type: 'wrap', before: '`', after: '`', placeholder: 'code' },
  { label: '• List', title: 'Bullet list item', type: 'line', before: '- ', placeholder: 'Policy bullet point' },
  { label: '1. List', title: 'Numbered step', type: 'line', before: '1. ', placeholder: 'Step description' },
  { label: 'Quote', title: 'Important callout blockquote', type: 'line', before: '> ', placeholder: 'Important customer notice' },
  {
    label: 'Link',
    title: 'Insert Markdown link',
    type: 'wrap',
    before: '[',
    after: '](/policies/warranty)',
    placeholder: 'link label',
  },
  {
    label: 'Table',
    title: 'Insert Markdown table',
    type: 'snippet',
    before: '\n| Column A | Column B |\n| --- | --- |\n| Detail 1 | Detail 2 |\n',
    placeholder: '',
  },
  {
    label: '---',
    title: 'Horizontal divider',
    type: 'snippet',
    before: '\n---\n',
    placeholder: '',
  },
]

/**
 * Interactive Markdown editor with cursor-aware formatting buttons and live storefront AST preview.
 */
export function LegalMarkdownEditor({
  title,
  badge,
  summary,
  value,
  onChange,
  onSaveShortcut,
}: LegalMarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<EditorViewMode>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyToolbarAction = (action: ToolbarAction) => {
    const el = textareaRef.current
    if (!el) {
      onChange(`${value}${action.type === 'snippet' ? action.before : `\n${action.before}${action.placeholder}${action.after ?? ''}`}`)
      return
    }

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    let inserted = ''
    let nextCursorStart = start
    let nextCursorEnd = end

    if (action.type === 'snippet') {
      inserted = action.before
      nextCursorStart = start + inserted.length
      nextCursorEnd = nextCursorStart
    } else if (action.type === 'line') {
      const needsLeadingNewline = start > 0 && value[start - 1] !== '\n' ? '\n' : ''
      const content = selected || action.placeholder
      inserted = `${needsLeadingNewline}${action.before}${content}`
      nextCursorStart = start + needsLeadingNewline.length + action.before.length
      nextCursorEnd = nextCursorStart + content.length
    } else {
      const content = selected || action.placeholder
      const suffix = action.after ?? ''
      inserted = `${action.before}${content}${suffix}`
      nextCursorStart = start + action.before.length
      nextCursorEnd = nextCursorStart + content.length
    }

    const nextValue = value.slice(0, start) + inserted + value.slice(end)
    onChange(nextValue)

    window.requestAnimationFrame(() => {
      const target = textareaRef.current
      if (!target) return
      target.focus()
      target.setSelectionRange(nextCursorStart, nextCursorEnd)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      onSaveShortcut?.()
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = `${value.slice(0, start)}  ${value.slice(end)}`
      onChange(next)
      window.requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(start + 2, start + 2)
      })
    }
  }

  return (
    <div className="rounded-lg border border-ui-border-base overflow-hidden bg-ui-bg-base">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="flex flex-wrap items-center gap-1">
          {TOOLBAR_ACTIONS.map((action) => (
            <Button
              key={action.label}
              type="button"
              size="small"
              variant="secondary"
              title={action.title}
              disabled={viewMode === 'preview'}
              onClick={() => applyToolbarAction(action)}
            >
              <span className="font-mono text-[11px]">{action.label}</span>
            </Button>
          ))}
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as EditorViewMode)}
        >
          <Tabs.List>
            <Tabs.Trigger value="split">Split</Tabs.Trigger>
            <Tabs.Trigger value="write">Markdown</Tabs.Trigger>
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </div>

      <div
        className={`grid ${
          viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-ui-border-base' : 'grid-cols-1'
        }`}
      >
        {viewMode !== 'preview' && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-ui-border-base bg-ui-bg-subtle/60">
              <span className="text-xs font-medium text-ui-fg-subtle">
                Markdown Source (.md)
              </span>
              <span className="text-[11px] font-mono text-ui-fg-muted">
                {value.length.toLocaleString()} chars · Cmd/Ctrl+S to save
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck
              placeholder="## Section Title&#10;&#10;Write your Mobile Station privacy policy, terms, or legal terms in clean Markdown..."
              className="w-full min-h-[460px] max-h-[540px] p-4 font-mono text-xs leading-relaxed text-ui-fg-base bg-ui-bg-base focus:outline-none resize-y"
            />
          </div>
        )}

        {viewMode !== 'write' && (
          <LegalMarkdownPreview
            title={title}
            badge={badge}
            summary={summary}
            markdown={value}
          />
        )}
      </div>
    </div>
  )
}
