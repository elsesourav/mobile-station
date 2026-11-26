'use client'

import React, { useState } from 'react'
import { Box, CheckCircle2, ChevronDown, ListChecks } from 'lucide-react'
import type { StorefrontProduct } from '@mobile-station/types'
import type { SpecificationRow } from '@/types/storefront'

interface ProductSpecsAccordionProps {
  product: StorefrontProduct
  specificationRows: readonly SpecificationRow[]
}

function AccordionCard({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-md border border-chrome-200 bg-surface-card shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-obsidian-900 text-ink-inverse hover:bg-obsidian-800 transition text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-display font-bold tracking-tight">
          <span className="text-gold-500 shrink-0">{icon}</span>
          <span>{title}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gold-500 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {open && <div className="p-4 sm:p-5">{children}</div>}
    </div>
  )
}

/**
 * Organized collapsible sections for Technical Specifications and Retail Box Contents + Overview.
 */
export function ProductSpecsAccordion({
  product,
  specificationRows,
}: ProductSpecsAccordionProps) {
  return (
    <div className="space-y-4">
      <AccordionCard
        title="Technical Specifications"
        icon={<ListChecks className="w-4 h-4" />}
        defaultOpen
      >
        <div className="divide-y divide-chrome-200 border border-chrome-200 rounded-sm overflow-hidden">
          {specificationRows.map((specRow) => (
            <div
              key={specRow.key}
              className="ms-spec-row grid grid-cols-12 gap-2 px-3 py-2 text-xs items-center"
            >
              <span className="col-span-5 font-mono text-ink-muted break-words">
                {specRow.label}
              </span>
              <span className="col-span-7 font-medium text-ink-primary break-words">
                {specRow.formattedValue}
              </span>
            </div>
          ))}
        </div>
      </AccordionCard>

      <AccordionCard
        title="Overview &amp; What’s in the Retail Box"
        icon={<Box className="w-4 h-4" />}
        defaultOpen
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {product.description}
          </p>

          <div className="border-t border-chrome-200/80 pt-3.5 space-y-2.5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Included in Sealed Retail Box
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-ink-secondary">
              {product.metadata.in_the_box.map((boxItem) => (
                <li
                  key={boxItem}
                  className="flex items-start gap-2 rounded-xs bg-surface-muted/60 px-2.5 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-commerce-savings shrink-0 mt-0.5" />
                  <span>{boxItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionCard>
    </div>
  )
}
