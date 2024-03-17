import * as schema from "./schema";
import { drizzle } from "drizzle-orm/d1";

export const createDrizzle = (client: D1Database) => {
	return drizzle(client, { schema });
};
