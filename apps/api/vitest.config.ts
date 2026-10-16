import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@cuentas/types': fileURLToPath(new URL('../../packages/types/src/index.ts', import.meta.url)),
    },
  },
});
