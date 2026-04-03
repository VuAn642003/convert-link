const fs = require('node:fs/promises');
const path = require('node:path');

const { buildSite } = require('./generate');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const configPath = path.join(rootDir, 'links.json');
  const raw = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(raw);

  await buildSite({
    siteUrl: config.siteUrl,
    outputDir: path.join(rootDir, 'dist'),
    links: config.links,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
