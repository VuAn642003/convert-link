const fs = require('node:fs/promises');
const { addLinkToConfig } = require('./link-utils');

async function addLink({ linksPath, input }) {
  const raw = await fs.readFile(linksPath, 'utf8');
  const parsed = JSON.parse(raw);
  const { config, link } = addLinkToConfig(parsed, input);
  await fs.writeFile(linksPath, JSON.stringify(config, null, 2) + '\n', 'utf8');

  return link;
}

module.exports = {
  addLink,
};
