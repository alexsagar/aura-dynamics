import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`variants_rels\` ADD \`media_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`variants_rels_media_id_idx\` ON \`variants_rels\` (\`media_id\`);`)
  await db.run(sql`ALTER TABLE \`_variants_v_rels\` ADD \`media_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_variants_v_rels_media_id_idx\` ON \`_variants_v_rels\` (\`media_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_variants_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`variant_options_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`variant_options_id\`) REFERENCES \`variant_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_variants_rels\`("id", "order", "parent_id", "path", "variant_options_id") SELECT "id", "order", "parent_id", "path", "variant_options_id" FROM \`variants_rels\`;`)
  await db.run(sql`DROP TABLE \`variants_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_variants_rels\` RENAME TO \`variants_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`variants_rels_order_idx\` ON \`variants_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`variants_rels_parent_idx\` ON \`variants_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`variants_rels_path_idx\` ON \`variants_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`variants_rels_variant_options_id_idx\` ON \`variants_rels\` (\`variant_options_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__variants_v_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`variant_options_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`_variants_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`variant_options_id\`) REFERENCES \`variant_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__variants_v_rels\`("id", "order", "parent_id", "path", "variant_options_id") SELECT "id", "order", "parent_id", "path", "variant_options_id" FROM \`_variants_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_variants_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__variants_v_rels\` RENAME TO \`_variants_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_variants_v_rels_order_idx\` ON \`_variants_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_variants_v_rels_parent_idx\` ON \`_variants_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_variants_v_rels_path_idx\` ON \`_variants_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_variants_v_rels_variant_options_id_idx\` ON \`_variants_v_rels\` (\`variant_options_id\`);`)
}
