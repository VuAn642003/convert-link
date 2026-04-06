const fs = require('node:fs/promises');
const path = require('node:path');

const { buildSite } = require('./generate');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const configPath = path.join(rootDir, 'links.json');
  const adminSourceDir = path.join(rootDir, 'admin');
  const distDir = path.join(rootDir, 'dist');
  const raw = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(raw);

  await buildSite({
    siteUrl: config.siteUrl,
    outputDir: distDir,
    links: config.links,
  });

  try {
    await fs.cp(adminSourceDir, path.join(distDir, 'admin'), { recursive: true });
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
