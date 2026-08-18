import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260817_160001_aura_catalog_v1 from './20260817_160001_aura_catalog_v1';
import * as migration_20260818_084119_cms_foundation from './20260818_084119_cms_foundation';
import * as migration_20260818_093747_homepage_shade_showcase from './20260818_093747_homepage_shade_showcase';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260817_160001_aura_catalog_v1.up,
    down: migration_20260817_160001_aura_catalog_v1.down,
    name: '20260817_160001_aura_catalog_v1',
  },
  {
    up: migration_20260818_084119_cms_foundation.up,
    down: migration_20260818_084119_cms_foundation.down,
    name: '20260818_084119_cms_foundation',
  },
  {
    up: migration_20260818_093747_homepage_shade_showcase.up,
    down: migration_20260818_093747_homepage_shade_showcase.down,
    name: '20260818_093747_homepage_shade_showcase'
  },
];
