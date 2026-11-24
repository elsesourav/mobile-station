import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from '@medusajs/medusa/core-flows'
import fs from 'node:fs'
import path from 'node:path'

interface CategoryJson {
  root_categories: Array<{
    handle: string
    name: string
    description: string
    default_hsn: string
    gst_rate_percent: number
    subcategories: Array<{
      handle: string
      name: string
      hsn: string
    }>
  }>
}

interface SeedJson {
  products: Array<{
    handle: string
    title: string
    subtitle: string
    category_handle: string
    subcategory_handle: string
    description: string
    metadata: Record<string, unknown>
    variants: Array<{
      title: string
      sku: string
      price_paise: number
      mrp_paise: number
      stock: number
      options: Record<string, string>
    }>
  }>
}

export default async function seedElectronicsCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const repoRoot = path.resolve(process.cwd(), '../..')
  const categoriesJson: CategoryJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'data/taxonomy/categories.json'), 'utf8')
  )
  const productsJson: SeedJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'data/catalog/products-seed.json'), 'utf8')
  )

  logger.info('Seeding Mobile Station India Region, Muzaffarpur Hub & Electronics Catalog...')

  // 1. Ensure India Region (INR)
  const { data: existingRegions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
  })
  if (!existingRegions.some((r) => r.currency_code === 'inr')) {
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: 'India',
            currency_code: 'inr',
            countries: ['in'],
            payment_providers: ['pp_system_default'],
          },
        ],
      },
    })
  }

  // 2. Ensure Default Sales Channel & Publishable API Key
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  let [salesChannel] = await salesChannelService.listSalesChannels({ name: 'Mobile Station Web' })
  if (!salesChannel) {
    const allChannels = await salesChannelService.listSalesChannels({})
    salesChannel =
      allChannels[0] ||
      (await salesChannelService.createSalesChannels({
        name: 'Mobile Station Web',
        description: 'Mobile Station Pan-India Storefront',
      }))
  }

  const { data: apiKeys } = await query.graph({
    entity: 'api_key',
    fields: ['id', 'token', 'type', 'title'],
  })
  const existingPubKey = apiKeys.find((k) => k.type === 'publishable')
  let pubKeyToken = existingPubKey?.token
  if (!existingPubKey) {
    const {
      result: [createdKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title: 'Mobile Station Storefront', type: 'publishable', created_by: 'seed' }],
      },
    })
    pubKeyToken = createdKey.token
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: createdKey.id, add: [salesChannel.id] },
    })
  }
  logger.info(`Publishable Key Ready: ${pubKeyToken ?? ''}`)

  // 3. Ensure Muzaffarpur Stock Location (842001)
  const { data: stockLocations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
  })
  const existingMzpLocation = stockLocations.find((s) => s.name.includes('Muzaffarpur'))
  if (!existingMzpLocation) {
    const {
      result: [createdLoc],
    } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: 'Mobile Station Muzaffarpur Hub',
            address: {
              address_1: 'Shop No. 01, Rama Market, Motijheel Road',
              city: 'Muzaffarpur',
              province: 'Bihar',
              postal_code: '842001',
              country_code: 'IN',
            },
          },
        ],
      },
    })
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: createdLoc.id, add: [salesChannel.id] },
    })
  }

  // 4. Create Categories from data/taxonomy/categories.json
  const { data: existingCategories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'handle'],
  })
  const catMap = new Map(existingCategories.map((c) => [c.handle, c.id]))

  for (const rootCat of categoriesJson.root_categories) {
    if (!catMap.has(rootCat.handle)) {
      const {
        result: [created],
      } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            {
              name: rootCat.name,
              handle: rootCat.handle,
              description: rootCat.description,
              is_active: true,
              metadata: {
                default_hsn: rootCat.default_hsn,
                gst_rate_percent: rootCat.gst_rate_percent,
              },
            },
          ],
        },
      })
      catMap.set(rootCat.handle, created.id)
    }

    const parentId = catMap.get(rootCat.handle)
    for (const sub of rootCat.subcategories) {
      if (!catMap.has(sub.handle) && parentId) {
        const {
          result: [createdSub],
        } = await createProductCategoriesWorkflow(container).run({
          input: {
            product_categories: [
              {
                name: sub.name,
                handle: sub.handle,
                parent_category_id: parentId,
                is_active: true,
                metadata: { hsn: sub.hsn },
              },
            ],
          },
        })
        catMap.set(sub.handle, createdSub.id)
      }
    }
  }

  // 5. Seed Electronics Products from data/catalog/products-seed.json
  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle'],
  })
  const existingHandles = new Set(existingProducts.map((p) => p.handle))

  const toCreate = productsJson.products.filter((p) => !existingHandles.has(p.handle))
  if (toCreate.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: toCreate.map((p) => {
          const optionKeys = Object.keys(p.variants[0]?.options || { Variant: 'Default' })
          const categoryIds = [
            catMap.get(p.category_handle),
            catMap.get(p.subcategory_handle),
          ].filter((id): id is string => Boolean(id))

          return {
            title: p.title,
            handle: p.handle,
            subtitle: p.subtitle,
            description: p.description,
            status: 'published' as const,
            category_ids: categoryIds,
            sales_channels: [{ id: salesChannel.id }],
            metadata: p.metadata,
            options: optionKeys.map((key) => ({
              title: key,
              values: Array.from(
                new Set(p.variants.map((v) => v.options[key] || 'Default'))
              ),
            })),
            variants: p.variants.map((v) => ({
              title: v.title,
              sku: v.sku,
              manage_inventory: true,
              options: v.options,
              prices: [
                {
                  currency_code: 'inr',
                  amount: Math.round(v.price_paise / 100),
                },
              ],
              metadata: {
                price_paise: v.price_paise,
                mrp_paise: v.mrp_paise,
              },
            })),
          }
        }),
      },
    })
  }

  logger.info(`Catalog seed complete. Created ${toCreate.length} new products.`)
}
