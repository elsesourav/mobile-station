#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const requireFromBackend = createRequire(path.join(repoRoot, 'apps/backend/package.json'))
const { v2: cloudinary } = requireFromBackend('cloudinary')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

loadEnvFile(path.join(repoRoot, '.env'))
loadEnvFile(path.join(repoRoot, 'apps/backend/.env'))

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const rootFolder = process.env.CLOUDINARY_FOLDER || 'mobile-station'

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET in environment.'
  )
  process.exit(1)
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

const STAGING_MANIFEST = '/tmp/ms-image-staging/manifest.json'
const OUTPUT_MAP = path.join(repoRoot, 'data/catalog/cloudinary-image-map.json')

async function uploadOneWithRetry(item, index, total) {
  const parts = item.key.split('/')
  const group = parts[0] // products | categories | banners
  const publicName = parts.slice(1).join('/')
  const folder = `${rootFolder}/${group}`
  const publicId = publicName

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const uploadSource =
        item.filePath && fs.existsSync(item.filePath) ? item.filePath : item.sourceUrl
      const res = await cloudinary.uploader.upload(uploadSource, {
        folder,
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        tags: ['mobile-station', group, publicName],
      })
      console.log(
        `[${index + 1}/${total}] UPLOADED ${folder}/${publicId} -> ${res.secure_url} (${res.width}x${res.height}, ${res.format})`
      )
      return {
        key: item.key,
        group,
        handle: publicName,
        public_id: res.public_id,
        secure_url: res.secure_url,
        width: res.width,
        height: res.height,
        format: res.format,
        bytes: res.bytes,
        source_url: item.sourceUrl.startsWith('/Users/') ? 'local-studio-banner' : item.sourceUrl,
      }
    } catch (err) {
      console.warn(
        `[${index + 1}/${total}] Attempt ${attempt} failed for ${item.key}: ${err.message}`
      )
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 1200 * attempt))
    }
  }
}

async function main() {
  if (!fs.existsSync(STAGING_MANIFEST)) {
    console.error(`Staging manifest not found at ${STAGING_MANIFEST}`)
    process.exit(1)
  }
  const items = JSON.parse(fs.readFileSync(STAGING_MANIFEST, 'utf8'))
  console.log(
    `Starting sequential one-by-one upload of ${items.length} assets to Cloudinary cloud '${cloudName}' under '${rootFolder}/'...`
  )

  const uploaded = {}
  for (let i = 0; i < items.length; i++) {
    const entry = await uploadOneWithRetry(items[i], i, items.length)
    uploaded[entry.key] = entry
    // Polite pacing between sequential uploads
    await new Promise((r) => setTimeout(r, 120))
  }

  const outPayload = {
    version: '1.0.0',
    cloud_name: cloudName,
    root_folder: rootFolder,
    generated_at: new Date().toISOString(),
    total_assets: Object.keys(uploaded).length,
    assets: uploaded,
  }
  fs.mkdirSync(path.dirname(OUTPUT_MAP), { recursive: true })
  fs.writeFileSync(OUTPUT_MAP, JSON.stringify(outPayload, null, 2) + '\n')
  console.log(`\nDONE: Uploaded ${outPayload.total_assets} assets -> ${OUTPUT_MAP}`)
}

main().catch((err) => {
  console.error('Upload aborted:', err)
  process.exit(1)
})
