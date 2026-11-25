import { describe, expect, it } from 'vitest'
import {
  AllTechIcon,
  AudioIcon,
  CasesWatchIcon,
  KeyboardsMiceIcon,
  LaptopsIcon,
  PowerGaNIcon,
  SmartphonesIcon,
  TabletsIcon,
  resolveCategoryIcon,
} from '../components/icons/CategoryIcons'
import { DEFAULT_SHOW_ANNOUNCEMENT_BAR } from '../context/HeaderScrollContext'
import categoriesData from '../../../../data/taxonomy/categories.json'

describe('Custom category SVG icon resolution by name and handle', () => {
  it('resolves distinct custom SVG icons from category display names', () => {
    expect(resolveCategoryIcon({ name: 'All Tech' })).toBe(AllTechIcon)
    expect(resolveCategoryIcon({ name: 'Smartphones' })).toBe(SmartphonesIcon)
    expect(resolveCategoryIcon({ name: 'Tablets' })).toBe(TabletsIcon)
    expect(resolveCategoryIcon({ name: 'Laptops' })).toBe(LaptopsIcon)
    expect(resolveCategoryIcon({ name: 'Audio & TWS' })).toBe(AudioIcon)
    expect(resolveCategoryIcon({ name: 'Keyboards & Mice' })).toBe(KeyboardsMiceIcon)
    expect(resolveCategoryIcon({ name: 'Power & GaN' })).toBe(PowerGaNIcon)
    expect(resolveCategoryIcon({ name: 'Cases & Watch' })).toBe(CasesWatchIcon)
  })

  it('maps every root category in taxonomy JSON to a custom SVG icon', () => {
    const resolvedIcons = new Set(
      categoriesData.root_categories.map((cat) =>
        resolveCategoryIcon({ name: cat.name, handle: cat.handle, iconKey: cat.icon })
      )
    )
    expect(resolvedIcons.size).toBe(categoriesData.root_categories.length)
  })

  it('keeps the top moving announcement bar off by default', () => {
    expect(DEFAULT_SHOW_ANNOUNCEMENT_BAR).toBe(false)
  })
})
