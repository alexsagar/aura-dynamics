import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`hp_shades\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`name\` text,
    \`hex\` text,
    \`image_id\` integer,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_shades_order_idx\` ON \`hp_shades\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_shades_parent_id_idx\` ON \`hp_shades\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`hp_shades_image_idx\` ON \`hp_shades\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_shades_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`name\` text,
    \`hex\` text,
    \`image_id\` integer,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_shades_v_order_idx\` ON \`_hp_shades_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_shades_v_parent_id_idx\` ON \`_hp_shades_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_hp_shades_v_image_idx\` ON \`_hp_shades_v\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`shade_showcase_availability_note\` text;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_shade_showcase_availability_note\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`hp_shades\`;`)
  await db.run(sql`DROP TABLE \`_hp_shades_v\`;`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`shade_showcase_availability_note\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_shade_showcase_availability_note\`;`)
}
