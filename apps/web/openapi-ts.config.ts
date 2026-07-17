import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../docs/openapi/api-spec.json',
  output: {
    format: false,
    lint: false,
    path: '../../packages/shared-types/src/api',
  },
  plugins: [
    '@hey-api/client-fetch'
  ],
});
