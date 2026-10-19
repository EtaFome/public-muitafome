import { defineConfig, devices } from "@playwright/test";

// Site estático servido como em produção; testado no celular e no desktop.
const PORT = 8096;

export default defineConfig({
  testDir: "./e2e",
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, locale: "pt-BR" },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: { command: `node e2e/serve.mjs . ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: false },
});
