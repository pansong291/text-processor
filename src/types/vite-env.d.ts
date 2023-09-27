/// <reference types="vite/client.d.ts" />
/// <reference types="utools-api-types" />

import { FMCF } from '@/types/types'

declare global {
  interface Window {
    utools?: UToolsApi
    $global: Record<string, Function>
    $self: Record<string, FMCF>
  }
}
