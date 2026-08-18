import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`shade_showcase_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`shade_showcase_heading\` text;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`shade_showcase_description\` text;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`shade_showcase_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`shade_showcase_cta_url\` text;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_shade_showcase_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_shade_showcase_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_shade_showcase_description\` text;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_shade_showcase_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_shade_showcase_cta_url\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`shade_showcase_enabled\`;`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`shade_showcase_heading\`;`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`shade_showcase_description\`;`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`shade_showcase_cta_label\`;`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`shade_showcase_cta_url\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_shade_showcase_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_shade_showcase_heading\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_shade_showcase_description\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_shade_showcase_cta_label\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_shade_showcase_cta_url\`;`)
}
