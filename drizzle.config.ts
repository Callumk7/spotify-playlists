import type { Config } from "drizzle-kit";

export default {
	schema: "./app/db/schema.ts",
	out: "./drizzle",
	driver: "d1",
	dbCredentials: {
		wranglerConfigPath: "./wrangler.toml",
		dbName: "spotify-d1-prod",
	},
} satisfies Config;
