import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: "v8", // Uses the native V8 engine for fast, accurate coverage
      reporter: ["text"], // Generates terminal output
      include: ["src/**/*.ts"], // Track your actual application code
      exclude: ["**/*.test.ts", "**/*.type.ts", "src/app.ts", "src/modules/users/userRoutes.ts"], // Ignore tests and type definitions
    },
  },
});