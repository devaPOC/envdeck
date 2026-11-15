import { resolve, join, isAbsolute } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': resolve('src/preload')
      }
    }
  },
  renderer: {
    root: resolve('src/renderer'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [
      react(),
      monacoEditorPlugin({
        languageWorkers: ['editorWorkerService'],
        // electron-vite resolves `build.outDir` to an absolute path (unlike a
        // plain Vite app, where it's relative to `root`); the plugin's default
        // `path.join(root, outDir, ...)` assumes the relative case and ends up
        // joining two absolute paths into a bogus nested one. Compute it
        // ourselves instead of relying on the (already-absolute) outDir being
        // relative to root.
        customDistPath: (root, outDir, base) =>
          join(isAbsolute(outDir) ? outDir : join(root, outDir), base, 'monacoeditorwork')
      })
    ],
    build: {
      rollupOptions: {
        input: resolve('src/renderer/index.html')
      }
    }
  }
})
