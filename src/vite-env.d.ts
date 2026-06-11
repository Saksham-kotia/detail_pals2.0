/// <reference types="vite/client" />

// Allow CSS imports
declare module '*.css' {
  const css: string
  export default css
}
