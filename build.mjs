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
  let itemCount = 0;

  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const fullPath = path.join(absSrc, f);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    // Sidecar files
    if (f.endsWith('.effect.json')) {
      const parentId = f.split('.')[0];
      const key = `!${docType}.effects!${parentId}.${data._id}`;
      await db.put(key, data);
      effectCount++;
      continue;
    }
    if (f.endsWith('.item.json')) {
      const parentId = f.split('.')[0];
      const key = `!${docType}.items!${parentId}.${data._id}`;
      await db.put(key, data);
      itemCount++;
      continue;
    }

    // Embedded effects
    if (Array.isArray(data.effects)) {
      const effectIds = [];
      for (const eff of data.effects) {
        if (typeof eff === 'object' && eff !== null && eff._id) {
          const effKey = `!${docType}.effects!${data._id}.${eff._id}`;
          await db.put(effKey, eff);
          effectCount++;
          effectIds.push(eff._id);
        } else if (typeof eff === 'string') {
          effectIds.push(eff);
        }
      }
      data.effects = effectIds;
    }

    // Embedded items (for actors)
    if (Array.isArray(data.items)) {
      const itemIds = [];
      for (const it of data.items) {
        if (typeof it === 'object' && it !== null && it._id) {
          const itKey = `!${docType}.items!${data._id}.${it._id}`;
          await db.put(itKey, it);
          itemCount++;
          itemIds.push(it._id);
        } else if (typeof it === 'string') {
          itemIds.push(it);
        }
      }
      data.items = itemIds;
    }

    const key = `!${docType}!${data._id}`;
    if (!data._stats) {
      data._stats = {
        coreVersion: '14.367',
        systemId: 'dnd5e',
        systemVersion: '6.0.1',
        createdTime: 1726320000000,
        modifiedTime: 1726320000000,
        lastModifiedBy: 'sovasbagsbuilder'
      };
    }
    await db.put(key, data);
    docCount++;
  }

  // Force compaction so all memtables/logs are written into .ldb SSTable files
  const k1 = db.keys({ limit: 1, fillCache: false });
  const firstKey = await k1.next();
  await k1.close();
  const k2 = db.keys({ limit: 1, reverse: true, fillCache: false });
  const lastKey = await k2.next();
  await k2.close();
  if (firstKey && lastKey) {
    await db.compactRange(firstKey, lastKey, { keyEncoding: 'utf8' });
  }

  await db.close();

  // Clean up transient runtime files (LOG, LOCK, empty .log) to keep git commits clean
  const outFiles = fs.readdirSync(absDest);
  for (const f of outFiles) {
    if (f === 'LOG' || f === 'LOG.old' || f === 'LOCK' || f.endsWith('.log')) {
      const fp = path.join(absDest, f);
      try {
        if (f.endsWith('.log')) {
          if (fs.statSync(fp).size === 0) fs.unlinkSync(fp);
        } else {
          fs.unlinkSync(fp);
        }
      } catch (_) {}
    }
  }

  const subInfo = [
    effectCount ? `${effectCount} effects` : null,
    itemCount ? `${itemCount} items` : null
  ].filter(Boolean).join(', ');
  console.log(`  ✓ ${path.basename(destDir)}: ${docCount} docs${subInfo ? ' (' + subInfo + ')' : ''}`);
}

async function buildAll() {
  console.log("=== Building Sova's Bags Compendiums ===");
  for (const mapping of PACK_MAPPINGS) {
    await compilePack(mapping.src, mapping.dest, mapping.docType);
  }
  console.log('=== Build Complete ===');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
