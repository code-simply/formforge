import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'production'

  return {
    plugins: [
      react(),
      isLibrary && dts({
        insertTypesEntry: true,
        include: ['src'],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: isLibrary
      ? {
          lib: {
            entry: {
              index: resolve(__dirname, 'src/index.ts'),
              'core/index': resolve(__dirname, 'src/core/index.ts'),
              'renderer/index': resolve(__dirname, 'src/renderer/index.ts'),
              'editor/index': resolve(__dirname, 'src/editor/index.ts'),
            },
            name: 'ShadcnFormBuilder',
            formats: ['es', 'cjs'],
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              'react/jsx-dev-runtime',
            ],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
            },
          },
          sourcemap: true,
          cssCodeSplit: false,
        }
      : undefined,
  }
})
