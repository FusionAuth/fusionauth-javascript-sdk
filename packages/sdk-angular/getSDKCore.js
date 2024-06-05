/**
 * This file is responsible for copying @fusionauth-sdk/core into this Angular package without transpiling it.
 * This is to allow Angular's library builder to bundle the core code into dist.
 * Further details here: https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/84
 */

const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });

  const srcDirContents = await fs.readdir(src, { withFileTypes: true });

  for (const item of srcDirContents) {
    if (item.isFile() && item.name.endsWith('.test.ts')) {
      continue;
    }

    const itemSrc = path.resolve(src, item.name);
    const itemDest = path.resolve(dest, item.name);

    if (item.isDirectory()) {
      await copyDirectory(itemSrc, itemDest);
    } else if (item.isFile()) {
      await fs.copyFile(itemSrc, itemDest);
    }
  }
}

async function pruneDirectory(dir) {
  if (!existsSync(dir)) {
    // check if directory can be accessed before reading from it
    return;
  }

  try {
    const directoryContents = await fs.readdir(dir, {
      withFileTypes: true,
    });

    await Promise.all(
      directoryContents.map(async item => {
        const itemPath = path.resolve(dir, item.name);

        if (item.isDirectory()) {
          await pruneDirectory(itemPath);
        } else {
          await fs.unlink(itemPath);
        }
      }),
    );
  } catch (err) {
    throw err;
  }
}

(async () => {
  const coreSrc = '../core/src';
  const coreDest = 'projects/fusionauth-angular-sdk/src/sdkcore';

  await pruneDirectory(coreDest);
  await copyDirectory(coreSrc, coreDest)
    .then(() =>
      console.log(`Successfully copied @fusionauth-sdk/core into ${coreDest}`),
    )
    .catch(err =>
      console.error('Error copying core src directory for angular:', err),
    );
})();
