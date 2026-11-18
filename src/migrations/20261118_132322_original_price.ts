import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`variants\` ADD \`original_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`_variants_v\` ADD \`version_original_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`spool_original_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`refill_original_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_spool_original_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_refill_original_price_in_n_p_r\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`variants\` DROP COLUMN \`original_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`_variants_v\` DROP COLUMN \`version_original_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`spool_original_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`refill_original_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_spool_original_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_refill_original_price_in_n_p_r\`;`)
}
