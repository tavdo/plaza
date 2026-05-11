/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same-origin NanoBanana path; Vite proxies to api.nanobananaapi.ai in dev when .env.local has NANO_BANANA_API_KEY */
  readonly VITE_NANO_BANANA_API_BASE?: string
  /** Admin console — SPA-only; expose only for internal demos until backend auth replaces this surface. */
  readonly VITE_MERGE_ADMIN_OWNER_EMAIL?: string
  readonly VITE_MERGE_ADMIN_OWNER_PASS?: string
  readonly VITE_MERGE_ADMIN_MANAGER_EMAIL?: string
  readonly VITE_MERGE_ADMIN_MANAGER_PASS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
