import { relations } from "drizzle-orm";
import { text, integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").notNull().primaryKey(), // internal user id
	spotifyId: text("spotify_id").unique(),
	token: text("token"),
	name: text("name"),
});

export const usersRelations = relations(users, ({ many }) => ({
	groups: many(usersToGroups),
}));

export const groups = sqliteTable("groups", {
	id: text("id").notNull().primaryKey(),
	name: text("name").notNull(),
});

export const groupsRelations = relations(groups, ({ many }) => ({
	users: many(usersToGroups),
}));

export const usersToGroups = sqliteTable(
	"users_to_groups",
	{
		userId: text("user_id").notNull(),
		groupId: text("group_id").notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.groupId] }),
	}),
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
	user: one(users, {
		fields: [usersToGroups.userId],
		references: [users.id],
	}),
	group: one(groups, {
		fields: [usersToGroups.groupId],
		references: [groups.id],
	}),
}));
