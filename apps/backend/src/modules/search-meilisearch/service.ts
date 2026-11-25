import type {
  MeilisearchIndexSettingsPayload,
  MeilisearchIndexSyncResult,
} from '../../types/media'

interface MeilisearchIndexLike {
  updateSettings(settings: MeilisearchIndexSettingsPayload): Promise<unknown>
  addDocuments(docs: SearchableElectronicsDocument[], options?: { primaryKey?: string }): Promise<unknown>
}

interface MeilisearchClient {
  index(uid: string): MeilisearchIndexLike
  health(): Promise<{ status: string }>
}

export interface SearchableElectronicsDocument {
  id: string
  handle: string
  title: string
  subtitle?: string | null
  brand: string
  category_handle: string
  subcategory_handle?: string
  price_paise: number
  mrp_paise: number
  in_stock: boolean
  warranty_months: number
  emi_eligible: boolean
  ram_gb?: number
  storage_gb?: number
  ssd_gb?: number
  output_wattage?: number
  switch_type?: string
  anc?: boolean
}

export class ElectronicsSearchService {
  private readonly host: string
  private readonly apiKey: string
  private readonly indexName: string
  private clientPromise?: Promise<MeilisearchClient>

  constructor() {
    this.host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
    this.apiKey = process.env.MEILISEARCH_API_KEY || ''
    const prefix = process.env.MEILISEARCH_INDEX_PREFIX || 'mobile_station_'
    this.indexName = `${prefix}products`
  }

  private async getClient(): Promise<MeilisearchClient> {
    if (!this.clientPromise) {
      this.clientPromise = import('meilisearch').then(
        ({ Meilisearch }) => new Meilisearch({ host: this.host, apiKey: this.apiKey })
      )
    }
    return this.clientPromise
  }

  async ensureIndexSettings(): Promise<MeilisearchIndexSyncResult> {
    const client = await this.getClient()
    const index = client.index(this.indexName)
    await index.updateSettings({
      searchableAttributes: ['title', 'subtitle', 'brand', 'category_handle', 'subcategory_handle'],
      filterableAttributes: [
        'brand',
        'category_handle',
        'subcategory_handle',
        'price_paise',
        'in_stock',
        'emi_eligible',
        'ram_gb',
        'storage_gb',
        'ssd_gb',
        'output_wattage',
        'switch_type',
        'anc',
      ],
      sortableAttributes: ['price_paise', 'warranty_months'],
    })
    return { indexName: this.indexName, status: 'configured' }
  }

  async indexProducts(docs: SearchableElectronicsDocument[]): Promise<MeilisearchIndexSyncResult> {
    await this.ensureIndexSettings()
    const client = await this.getClient()
    await client.index(this.indexName).addDocuments(docs, { primaryKey: 'id' })
    return { indexName: this.indexName, status: 'indexed', count: docs.length }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const client = await this.getClient()
      const status = await client.health()
      return status.status === 'available'
    } catch {
      return false
    }
  }
}
