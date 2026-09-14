import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let ClassicLevel;
try {
  ({ ClassicLevel } = require('classic-level'));
} catch (e) {
  const foundryPaths = [
    'E:/Foundry Virtual Tabletop/resources/app/node_modules/classic-level',
    'C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level',
    'C:/Users/' + (process.env.USERNAME || '') + '/AppData/Local/FoundryVTT/resources/app/node_modules/classic-level'
  ];
  for (const p of foundryPaths) {
    try {
      ({ ClassicLevel } = require(p));
      break;
    } catch (_) {}
  }
}

if (!ClassicLevel) {
  console.error('Error: classic-level could not be loaded.');
  process.exit(1);
}

const PACK_MAPPINGS = [
  { src: 'src/classes', dest: 'packs/sovas-bags-classes', docType: 'items' },
  { src: 'src/subclasses', dest: 'packs/sovas-bags-subclasses', docType: 'items' },
  { src: 'src/features', dest: 'packs/sovas-bags-features', docType: 'items' },
  { src: 'src/items', dest: 'packs/sovas-bags-items', docType: 'items' },
  { src: 'src/spells', dest: 'packs/sovas-bags-spells', docType: 'items' },
  { src: 'src/actors', dest: 'packs/sovas-bags-actors', docType: 'actors' }
];

async function compilePack(sourceDir, destDir, docType) {
  const absSrc = path.resolve(__dirname, sourceDir);
  const absDest = path.resolve(__dirname, destDir);

  if (!fs.existsSync(absSrc)) {
    fs.mkdirSync(absSrc, { recursive: true });
  }

  if (fs.existsSync(absDest)) {
    fs.rmSync(absDest, { recursive: true, force: true });
  }
  fs.mkdirSync(absDest, { recursive: true });

  const db = new ClassicLevel(absDest, { valueEncoding: 'json' });
  await db.open();
  const files = fs.readdirSync(absSrc);

  let docCount = 0;
  let effectCount = 0;

  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const fullPath = path.join(absSrc, f);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    if (f.endsWith('.effect.json')) {
      const parentId = f.split('.')[0];
      const key = `!${docType}.effects!${parentId}.${data._id}`;
      await db.put(key, data);
      effectCount++;
    } else {
      if (Array.isArray(data.effects)) {
        for (const eff of data.effects) {
          if (typeof eff === 'object' && eff !== null && eff._id) {
            const effKey = `!${docType}.effects!${data._id}.${eff._id}`;
            await db.put(effKey, eff);
            effectCount++;
          }
        }
      }

      const key = `!${docType}!${data._id}`;
      if (!data._stats) {
        data._stats = {
          coreVersion: '14.367',
          systemId: 'dnd5e',
          systemVersion: '6.0.1',
          createdTime: Date.now(),
          modifiedTime: Date.now(),
          lastModifiedBy: 'sovasbagsbuilder'
        };
      }
      await db.put(key, data);
      docCount++;
    }
  }

  await db.close();
  console.log(`  ✓ ${path.basename(destDir)}: ${docCount} docs, ${effectCount} effects`);
}

async function buildAll() {
  console.log('=== Building Sova\\\'s Bags Compendiums ===');
  for (const mapping of PACK_MAPPINGS) {
    await compilePack(mapping.src, mapping.dest, mapping.docType);
  }
  console.log('=== Build Complete ===');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
