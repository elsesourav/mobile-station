import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Badge, Button, Container, Heading, Input, Label, Select, Switch, Text } from '@medusajs/ui'
import { useEffect, useState } from 'react'

interface ProductSettingsDetail {
  id: string
  title?: string
}

interface ElectronicsSettingsPayload {
  gst_invoice_available: boolean
  b2b_gst_available: boolean
  gst_rate_percent: number
  hsn_code: string
  color_images: Record<string, string[]>
  detected_colors: string[]
}

function getAuthHeaders(): Headers {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('medusa_auth_token') : null
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

const ProductElectronicsSettingsWidget = ({ data }: { data: ProductSettingsDetail }) => {
  const [gstAvailable, setGstAvailable] = useState(false)
  const [b2bGstAvailable, setB2bGstAvailable] = useState(false)
  const [gstRate, setGstRate] = useState('18')
  const [hsnCode, setHsnCode] = useState('')
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({})
  const [detectedColors, setDetectedColors] = useState<string[]>([])
  const [customColorName, setCustomColorName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingColor, setUploadingColor] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!data?.id) return
    fetch(`/admin/products/${data.id}/electronics`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    })
      .then((res) => (res.ok ? (res.json() as Promise<ElectronicsSettingsPayload>) : null))
      .then((payload) => {
        if (!payload) return
        setGstAvailable(payload.gst_invoice_available)
        setB2bGstAvailable(payload.b2b_gst_available)
        setGstRate(String(payload.gst_rate_percent || 18))
        setHsnCode(payload.hsn_code || '')
        setColorImages(payload.color_images || {})
        setDetectedColors(payload.detected_colors || [])
      })
      .catch(() => {})
  }, [data?.id])

  const allColors = Array.from(new Set([...detectedColors, ...Object.keys(colorImages)]))

  const handleSaveSettings = async () => {
    setSaving(true)
    setStatusMessage(null)
    try {
      const response = await fetch(`/admin/products/${data.id}/electronics`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          gst_invoice_available: gstAvailable,
          b2b_gst_available: gstAvailable ? b2bGstAvailable : false,
          gst_rate_percent: Number(gstRate) as 5 | 12 | 18 | 28,
          ...(hsnCode.trim() ? { hsn_code: hsnCode.trim() } : {}),
          color_images: colorImages,
        }),
      })
      setStatusMessage(
        response.ok ? 'Saved GST & finish gallery settings.' : 'Failed to save settings.'
      )
    } catch {
      setStatusMessage('Network error while saving settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadColorFile = async (colorName: string, file: File | null) => {
    if (!file) return
    setUploadingColor(colorName)
    setStatusMessage(null)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      const response = await fetch(`/admin/products/${data.id}/electronics`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          upload_color_image: {
            color_name: colorName,
            filename: file.name,
            mime_type: file.type,
            content_base64: base64,
          },
        }),
      })
      if (response.ok) {
        const payload = (await response.json()) as ElectronicsSettingsPayload
        setColorImages(payload.color_images || {})
        setStatusMessage(`Uploaded image for ${colorName}.`)
      } else {
        setStatusMessage(`Upload failed for ${colorName}.`)
      }
    } catch {
      setStatusMessage(`Upload error for ${colorName}.`)
    } finally {
      setUploadingColor(null)
    }
  }

  const handleAddColorBucket = () => {
    const clean = customColorName.trim()
    if (!clean) return
    setColorImages((prev) => ({ ...prev, [clean]: prev[clean] ?? [] }))
    setCustomColorName('')
  }

  const handleRemoveImage = (colorName: string, urlToRemove: string) => {
    setColorImages((prev) => ({
      ...prev,
      [colorName]: (prev[colorName] ?? []).filter((u) => u !== urlToRemove),
    }))
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div>
          <Heading level="h2">Storefront GST &amp; Color Variant Media</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Control whether GST &amp; B2B invoice details appear on storefront, and upload separate photos per finish/color.
          </Text>
        </div>
        <Button size="small" isLoading={saving} onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>

      <div className="px-6 py-4 space-y-5">
        {statusMessage && (
          <Badge size="small" color={statusMessage.includes('Failed') || statusMessage.includes('error') ? 'red' : 'green'}>
            {statusMessage}
          </Badge>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label>GST Invoice Available</Label>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Show GST invoice availability for this product
              </Text>
            </div>
            <Switch checked={gstAvailable} onCheckedChange={setGstAvailable} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label>Show B2B GST Split on PDP</Label>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Allow buyers to inspect CGST/SGST/IGST breakdown
              </Text>
            </div>
            <Switch
              checked={gstAvailable && b2bGstAvailable}
              disabled={!gstAvailable}
              onCheckedChange={setB2bGstAvailable}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>GST Tax Rate (%)</Label>
            <Select value={gstRate} onValueChange={setGstRate} disabled={!gstAvailable}>
              <Select.Trigger>
                <Select.Value placeholder="Select GST rate" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="18">18% GST (Electronics Standard)</Select.Item>
                <Select.Item value="12">12% GST</Select.Item>
                <Select.Item value="28">28% GST</Select.Item>
                <Select.Item value="5">5% GST</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>HSN Code</Label>
            <Input
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g. 8517"
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label>Color / Finish Variant Images</Label>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Upload distinct photos per color. Storage/RAM variants share their selected color’s gallery automatically.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Add finish/color name"
                className="w-44"
              />
              <Button size="small" variant="secondary" type="button" onClick={handleAddColorBucket}>
                Add Finish
              </Button>
            </div>
          </div>

          {allColors.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No Color/Finish options detected on variants yet. Add a finish above or define Color options on variants.
            </Text>
          ) : (
            <div className="space-y-3">
              {allColors.map((colorName) => {
                const urls = colorImages[colorName] ?? []
                return (
                  <div key={colorName} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Text size="small" weight="plus">
                        {colorName} ({urls.length} images)
                      </Text>
                      <label className="text-xs font-semibold underline cursor-pointer">
                        {uploadingColor === colorName ? 'Uploading...' : 'Upload Color Photo'}
                        <input
                          type="file"
                          accept="image/webp,image/jpeg,image/png,image/avif"
                          className="sr-only"
                          disabled={uploadingColor === colorName}
                          onChange={(e) =>
                            handleUploadColorFile(colorName, e.target.files?.[0] ?? null)
                          }
                        />
                      </label>
                    </div>
                    {urls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {urls.map((url) => (
                          <div key={url} className="relative w-14 h-14 rounded border overflow-hidden">
                            <img src={url} alt={colorName} className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(colorName, url)}
                              aria-label={`Remove ${colorName} image`}
                              className="absolute top-0 right-0 bg-black/70 text-white text-[10px] px-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'product.details.after',
})

export default ProductElectronicsSettingsWidget
