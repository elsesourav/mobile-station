'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Check, Copy, Send, X } from 'lucide-react'
import { MOBILE_STATION_BRAND } from '@mobile-station/brand'

interface SupportTopic {
  id: string
  label: string
  template: string
}

const SUPPORT_TOPICS: readonly SupportTopic[] = [
  {
    id: 'order',
    label: 'Order / Delivery',
    template: 'I need help with an order or delivery status.',
  },
  {
    id: 'product',
    label: 'Product & Stock',
    template: 'I want to check availability, specs, or price for a product.',
  },
  {
    id: 'warranty',
    label: 'Warranty / Open-Box',
    template: 'I have a question regarding warranty or Open-Box Delivery.',
  },
  {
    id: 'gst',
    label: '18% GST Invoice',
    template: 'I need assistance with a B2B GSTIN tax invoice.',
  },
  {
    id: 'pickup',
    label: 'Muzaffarpur Pickup',
    template: 'I want to inquire about pickup at Motijheel / Club Road hub.',
  },
] as const

export function WhatsAppLogoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.08c-.24.68-1.42 1.3-1.95 1.38-.5.08-1.14.11-1.84-.11-.42-.14-.97-.32-1.67-.62-2.94-1.27-4.86-4.24-5.01-4.44-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.49.22.56.34.07.12.07.7-.17 1.38Z" />
    </svg>
  )
}

export function buildWhatsAppChatUrl(rawNumber: string, message: string): string {
  const digitsOnly = rawNumber.replace(/\D/g, '')
  const trimmed = message.trim()
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(trimmed)}`
}

export function formatWhatsAppSupportMessage({
  topicLabel,
  customerRef,
  messageBody,
  pagePath,
}: {
  topicLabel: string
  customerRef: string
  messageBody: string
  pagePath: string
}): string {
  const lines = [
    `Hello ${MOBILE_STATION_BRAND.name} Support,`,
    `Topic: ${topicLabel}`,
  ]
  if (customerRef.trim()) {
    lines.push(`Name / Order Ref: ${customerRef.trim()}`)
  }
  if (messageBody.trim()) {
    lines.push(`Message: ${messageBody.trim()}`)
  }
  if (pagePath && pagePath !== '/') {
    lines.push(`Page: ${pagePath}`)
  }
  return lines.join('\n')
}

/**
 * Compact floating WhatsApp support widget and interactive message builder.
 */
export function WhatsAppSupportWidget() {
  const pathname = usePathname() || '/'
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(SUPPORT_TOPICS[0].id)
  const [customerRef, setCustomerRef] = useState('')
  const [messageBody, setMessageBody] = useState(SUPPORT_TOPICS[0].template)
  const [copied, setCopied] = useState(false)

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || MOBILE_STATION_BRAND.support.whatsappNumber

  const activeTopic = useMemo(
    () => SUPPORT_TOPICS.find((topic) => topic.id === selectedTopicId) ?? SUPPORT_TOPICS[0],
    [selectedTopicId]
  )

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const composedMessage = useMemo(
    () =>
      formatWhatsAppSupportMessage({
        topicLabel: activeTopic.label,
        customerRef,
        messageBody,
        pagePath: pathname,
      }),
    [activeTopic.label, customerRef, messageBody, pathname]
  )

  const whatsappUrl = useMemo(
    () => buildWhatsAppChatUrl(whatsappNumber, composedMessage),
    [whatsappNumber, composedMessage]
  )

  const handleSelectTopic = (topic: SupportTopic) => {
    setSelectedTopicId(topic.id)
    setMessageBody(topic.template)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(composedMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed right-4 sm:right-6 bottom-[72px] lg:bottom-6 z-40 flex flex-col items-end gap-2.5">
      {isOpen && (
        <section
          role="dialog"
          aria-label="WhatsApp Support Composer"
          className="w-[calc(100vw-2rem)] max-w-[344px] rounded-lg border border-chrome-200 bg-surface-card shadow-modal overflow-hidden"
        >
          <div className="bg-obsidian-900 text-ink-inverse px-4 py-3 flex items-center justify-between gap-2 border-b border-obsidian-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-commerce-whatsapp text-ink-inverse flex items-center justify-center shrink-0">
                <WhatsAppLogoIcon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xs font-bold text-ink-inverse truncate">
                  {MOBILE_STATION_BRAND.name} WhatsApp Help
                </p>
                <p className="text-[10.5px] text-chrome-300 truncate">
                  Direct Hub Desk · {MOBILE_STATION_BRAND.support.hours}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp support chat"
              className="w-8 h-8 rounded-full flex items-center justify-center text-chrome-300 hover:bg-obsidian-800 hover:text-gold-500 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-3 bg-surface-card">
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Select Issue or Topic
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORT_TOPICS.map((topic) => {
                  const active = topic.id === selectedTopicId
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                        active
                          ? 'border-obsidian-900 bg-obsidian-900 text-gold-500'
                          : 'border-chrome-200 bg-surface-canvas text-ink-secondary hover:border-gold-500'
                      }`}
                    >
                      {topic.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
                placeholder="Your name or Order ID (optional)"
                aria-label="Your name or Order ID"
                className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-xs text-ink-primary placeholder:text-ink-muted focus:border-gold-500 focus:outline-none"
              />
              <textarea
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Describe your question or issue..."
                aria-label="WhatsApp message"
                className="w-full rounded-sm border border-chrome-300 bg-surface-canvas px-3 py-2 text-xs text-ink-primary placeholder:text-ink-muted focus:border-gold-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-sm bg-commerce-whatsapp hover:bg-commerce-whatsappDark px-3.5 py-2 text-xs font-bold text-ink-inverse transition shadow-card"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Send on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy message"
                aria-label="Copy WhatsApp message"
                className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-sm border border-chrome-300 bg-surface-canvas px-2.5 text-ink-secondary hover:border-gold-500 hover:text-gold-700 transition"
              >
                {copied ? <Check className="w-4 h-4 text-commerce-savings" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close WhatsApp support' : 'Chat on WhatsApp for help'}
        aria-expanded={isOpen}
        title="Need help? Chat on WhatsApp"
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-commerce-whatsapp hover:bg-commerce-whatsappDark text-ink-inverse shadow-modal ring-2 ring-surface-card active:scale-95 transition flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <WhatsAppLogoIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>
    </div>
  )
}
