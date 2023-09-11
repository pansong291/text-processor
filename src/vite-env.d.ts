/// <reference types="vite/client.d.ts" />
/// <reference types="utools-api-types" />

declare global {
  interface Window {
    utools: UToolsApi
  }
}
