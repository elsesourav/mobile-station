import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
} from '@medusajs/medusa/core-flows'
import fs from 'node:fs'
import path from 'node:path'
import type { CategorySeedDataset, ProductSeedDataset, SeedProductDefinition } from '../types/catalog-seed'

export default async function seedElectronicsCatalog({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const repoRoot = path.resolve(process.cwd(), '../..')
  const categoriesJson: CategorySeedDataset = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'data/taxonomy/categories.json'), 'utf8')
  )
  const productsJson: ProductSeedDataset = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'data/catalog/products-seed.json'), 'utf8')
  )

  let cloudinaryMap: Record<string, { secure_url: string }> = {}
  const mapPath = path.join(repoRoot, 'data/catalog/cloudinary-image-map.json')
  if (fs.existsSync(mapPath)) {
    cloudinaryMap = JSON.parse(fs.readFileSync(mapPath, 'utf8')).assets ?? {}
  }

  logger.info('Seeding Mobile Station India Region, Muzaffarpur Hub & 51-Product Electronics Catalog...')

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
  const foundLoc = stockLocations.find((s) => s.name.includes('Muzaffarpur'))
  let mzpLocation: { id: string; name: string } = foundLoc
    ? { id: foundLoc.id, name: foundLoc.name }
    : { id: '', name: 'Mobile Station Muzaffarpur Hub' }
  if (!foundLoc) {
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
    mzpLocation = { id: createdLoc.id, name: createdLoc.name }
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: createdLoc.id, add: [salesChannel.id] },
    })
  }

  // 4. Create & Sync Categories + Inventory Policies from data/taxonomy/categories.json
  const { data: existingCategories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'handle'],
  })
  const catMap = new Map(existingCategories.map((c) => [c.handle, c.id]))

  for (const rootCat of categoriesJson.root_categories) {
    const catMetadata = {
      default_hsn: rootCat.default_hsn,
      gst_rate_percent: rootCat.gst_rate_percent,
      image_url: rootCat.image_url || cloudinaryMap[`categories/${rootCat.handle}`]?.secure_url,
      inventory_policy: rootCat.inventory_policy ?? {},
    }

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
              metadata: catMetadata,
            },
          ],
        },
      })
      catMap.set(rootCat.handle, created.id)
    } else {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: catMap.get(rootCat.handle)! },
          update: {
            name: rootCat.name,
            description: rootCat.description,
            is_active: true,
            metadata: catMetadata,
          },
        },
      })
    }

    const parentId = catMap.get(rootCat.handle)
    for (const sub of rootCat.subcategories) {
      const subMeta = {
        hsn: sub.hsn,
        tracking_mode: sub.tracking_mode ?? 'sku_quantity',
      }
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
                metadata: subMeta,
              },
            ],
          },
        })
        catMap.set(sub.handle, createdSub.id)
      } else if (catMap.has(sub.handle)) {
        await updateProductCategoriesWorkflow(container).run({
          input: {
            selector: { id: catMap.get(sub.handle)! },
            update: {
              name: sub.name,
              is_active: true,
              metadata: subMeta,
            },
          },
        })
      }
    }
  }

  // 5. Create New Products & Sync Images / Metadata / Categories on Existing Products
  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle'],
  })
  const existingByHandle = new Map(existingProducts.map((p) => [p.handle, p.id]))

  const resolveImages = (seedProduct: SeedProductDefinition) => {
    const thumb =
      seedProduct.thumbnail || cloudinaryMap[`products/${seedProduct.handle}`]?.secure_url
    const imgs =
      seedProduct.images && seedProduct.images.length > 0
        ? seedProduct.images
        : thumb
          ? [thumb]
          : []
    return {
      thumbnail: thumb,
      images: imgs.map((url: string) => ({ url })),
    }
  }

  const toCreate = productsJson.products.filter((p) => !existingByHandle.has(p.handle))
  const toUpdate = productsJson.products.filter((p) => existingByHandle.has(p.handle))

  if (toCreate.length > 0) {
    // Batch create in chunks of 12 to keep Supabase / Medusa workflow clean and predictable
    for (let i = 0; i < toCreate.length; i += 12) {
      const batch = toCreate.slice(i, i + 12)
      await createProductsWorkflow(container).run({
        input: {
          products: batch.map((p) => {
            const optionKeys = Object.keys(p.variants[0]?.options || { Variant: 'Default' })
            const categoryIds = [
              catMap.get(p.category_handle),
              catMap.get(p.subcategory_handle),
            ].filter((id): id is string => Boolean(id))
            const media = resolveImages(p)

            return {
              title: p.title,
              handle: p.handle,
              subtitle: p.subtitle,
              description: p.description,
              status: 'published' as const,
              thumbnail: media.thumbnail,
              images: media.images,
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
                  stock_target: v.stock,
                },
              })),
            }
          }),
        },
      })
      logger.info(`Created batch ${Math.floor(i / 12) + 1} (${batch.length} products)`)
    }
  }

  for (const p of toUpdate) {
    const productId = existingByHandle.get(p.handle)!
    const categoryIds = [
      catMap.get(p.category_handle),
      catMap.get(p.subcategory_handle),
    ].filter((id): id is string => Boolean(id))
    const media = resolveImages(p)

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: productId },
        update: {
          title: p.title,
          subtitle: p.subtitle,
          description: p.description,
          status: 'published',
          thumbnail: media.thumbnail,
          images: media.images,
          category_ids: categoryIds,
          sales_channels: [{ id: salesChannel.id }],
          metadata: p.metadata,
        },
      },
    })
  }
  logger.info(`Synced ${toUpdate.length} existing products with Cloudinary imagery & stock policies.`)

  // 6. Ensure Inventory Items, Variant Links & Muzaffarpur Hub Stock Levels for ALL Variants
  const seedVariantStockBySku = new Map<string, { title: string; stock: number }>()
  for (const p of productsJson.products) {
    for (const v of p.variants) {
      seedVariantStockBySku.set(v.sku, {
        title: `${p.title} - ${v.title}`,
        stock: v.stock,
      })
    }
  }

  const { data: allProducts } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'title', 'variants.id', 'variants.sku', 'variants.title'],
  })

  const { data: allInvItems } = await query.graph({
    entity: 'inventory_item',
    fields: ['id', 'sku'],
  })
  const invItemBySku = new Map(
    allInvItems.filter((item) => item.sku).map((item) => [item.sku!, item.id])
  )

  let syncedLevels = 0
  for (const prod of allProducts) {
    for (const variant of prod.variants || []) {
      if (!variant.sku) continue
      const target = seedVariantStockBySku.get(variant.sku)
      const targetStock = target?.stock ?? 10

      let invItemId = invItemBySku.get(variant.sku)
      if (!invItemId) {
        const {
          result: [invItem],
        } = await createInventoryItemsWorkflow(container).run({
          input: {
            items: [
              {
                sku: variant.sku,
                requires_shipping: true,
                title: target?.title || `${prod.title} - ${variant.title}`,
              },
            ],
          },
        })
        invItemId = invItem.id
        invItemBySku.set(variant.sku, invItemId)
      }

      const { data: variantLinks } = await query.graph({
        entity: 'product_variant',
        fields: ['id', 'inventory_items.*'],
        filters: { id: variant.id },
      })
      const isLinked = variantLinks[0]?.inventory_items?.some(
        (l) => l && 'inventory_item_id' in l && l.inventory_item_id === invItemId
      )
      if (!isLinked) {
        await link.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.INVENTORY]: { inventory_item_id: invItemId },
        })
      }

      const { data: existingLevels } = await query.graph({
        entity: 'inventory_level',
        fields: ['id', 'stocked_quantity'],
        filters: {
          inventory_item_id: invItemId,
          location_id: mzpLocation.id,
        },
      })

      if (existingLevels.length > 0) {
        if (existingLevels[0].stocked_quantity !== targetStock) {
          await updateInventoryLevelsWorkflow(container).run({
            input: {
              updates: [
                {
                  inventory_item_id: invItemId,
                  location_id: mzpLocation.id,
                  stocked_quantity: targetStock,
                },
              ],
            },
          })
        }
      } else {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                inventory_item_id: invItemId,
                location_id: mzpLocation.id,
                stocked_quantity: targetStock,
              },
            ],
          },
        })
      }
      syncedLevels++
    }
  }

  // 7. Ensure Default Shipping Profile Links
  const { data: profiles } = await query.graph({
    entity: 'shipping_profile',
    fields: ['id', 'type'],
  })
  const defaultProfile = profiles.find((p) => p.type === 'default') || profiles[0]
  if (defaultProfile) {
    for (const prod of allProducts) {
      try {
        await link.create({
          [Modules.PRODUCT]: { product_id: prod.id },
          [Modules.FULFILLMENT]: { shipping_profile_id: defaultProfile.id },
        })
      } catch {
        // Ignore already-linked shipping profiles safely
      }
    }
  }

  logger.info(
    `Catalog seed complete. Created ${toCreate.length}, synced ${toUpdate.length} existing, and set ${syncedLevels} variant inventory levels at ${mzpLocation.name}.`
  )
}
