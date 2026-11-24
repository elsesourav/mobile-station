import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import { CloudinaryImageService } from './service'

export default ModuleProvider(Modules.FILE, {
  services: [CloudinaryImageService],
})
