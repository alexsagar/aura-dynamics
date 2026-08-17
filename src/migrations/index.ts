import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260817_160001_aura_catalog_v1 from './20260817_160001_aura_catalog_v1';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260817_160001_aura_catalog_v1.up,
    down: migration_20260817_160001_aura_catalog_v1.down,
    name: '20260817_160001_aura_catalog_v1'
  },
];
