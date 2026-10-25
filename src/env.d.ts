/// <reference types="vite/client" />

declare const __BUILD_DATE__: string

declare module 'virtual:evidence' {
  /** Byte size of every publishable file in /evidence, keyed by "evidence/<name>". */
  export const sizes: Record<string, number>
}

interface Window {
  __appReady?: boolean
}
