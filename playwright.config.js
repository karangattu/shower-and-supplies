const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:41731',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node tests/static-server.js',
    url: 'http://127.0.0.1:41731',
    reuseExistingServer: false,
  },
});
