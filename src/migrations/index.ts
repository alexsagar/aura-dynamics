import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260817_160001_aura_catalog_v1 from './20260817_160001_aura_catalog_v1';
import * as migration_20260818_084119_cms_foundation from './20260818_084119_cms_foundation';
import * as migration_20260818_093747_homepage_shade_showcase from './20260818_093747_homepage_shade_showcase';
import * as migration_20261004_172006_variant_images from './20261004_172006_variant_images';
import * as migration_20261005_175000_order_esewa_qr from './20261005_175000_order_esewa_qr';
import * as migration_20261005_190000_checkout_hardening from './20261005_190000_checkout_hardening';
import * as migration_20261007_101456_page_content from './20261007_101456_page_content';
import * as migration_20261029_102429_page_content_completion from './20261029_102429_page_content_completion';
import * as migration_20261029_104832_about_materials_globals from './20261029_104832_about_materials_globals';
import * as migration_20261029_105745_homepage_shades from './20261029_105745_homepage_shades';

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
    name: '20260818_093747_homepage_shade_showcase',
  },
  {
    up: migration_20261004_172006_variant_images.up,
    down: migration_20261004_172006_variant_images.down,
    name: '20261004_172006_variant_images',
  },
  {
    up: migration_20261005_175000_order_esewa_qr.up,
    down: migration_20261005_175000_order_esewa_qr.down,
    name: '20261005_175000_order_esewa_qr',
  },
  {
    up: migration_20261005_190000_checkout_hardening.up,
    down: migration_20261005_190000_checkout_hardening.down,
    name: '20261005_190000_checkout_hardening',
  },
  {
    up: migration_20261007_101456_page_content.up,
    down: migration_20261007_101456_page_content.down,
    name: '20261007_101456_page_content',
  },
  {
    up: migration_20261029_102429_page_content_completion.up,
    down: migration_20261029_102429_page_content_completion.down,
    name: '20261029_102429_page_content_completion',
  },
  {
    up: migration_20261029_104832_about_materials_globals.up,
    down: migration_20261029_104832_about_materials_globals.down,
    name: '20261029_104832_about_materials_globals',
  },
  {
    up: migration_20261029_105745_homepage_shades.up,
    down: migration_20261029_105745_homepage_shades.down,
    name: '20261029_105745_homepage_shades'
  },
];
