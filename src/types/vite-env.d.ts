/// <reference types="vite/client.d.ts" />
/// <reference types="utools-api-types" />

import { FMCF } from '@/types/base'

declare global {
  interface Window {
    utools?: UToolsApi
    $global: Record<string, Function>
    $self: Record<string, FMCF>
    _preload: {
      writeTo: (str: string, path: string) => void
      readFrom: (path: string) => string
    }
  }
}
