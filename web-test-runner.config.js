import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  rootDir: '.',
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: 5000,
    },
  },
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  testRunnerHtml: (testFramework) => `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/src/styles/global.css">
        <link rel="stylesheet" href="/src/styles/tokens.css">
        <link rel="stylesheet" href="/src/styles/themes/light.css">
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
};
