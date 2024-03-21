import { relations } from "drizzle-orm";
import { text, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

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
	tracks: many(tracksToGroups),
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

export const tracks = sqliteTable("tracks", {
	id: text("id").notNull().primaryKey(), // spotify id
	name: text("name").notNull(),
	artist: text("artist"),
	album: text("album"),
});

export const tracksRelations = relations(tracks, ({ many }) => ({
	groups: many(tracksToGroups),
}));

export const tracksToGroups = sqliteTable(
	"tracks_to_groups",
	{
		trackId: text("track_id").notNull(),
		groupId: text("group_id").notNull(),
		addedBy: text("added_by").notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.trackId, t.groupId] }),
	}),
);

export const tracksToGroupsRelations = relations(tracksToGroups, ({ one }) => ({
	track: one(tracks, {
		fields: [tracksToGroups.trackId],
		references: [tracks.id],
	}),
	group: one(groups, {
		fields: [tracksToGroups.groupId],
		references: [groups.id],
	}),
	addedBy: one(users, {
		fields: [tracksToGroups.addedBy],
		references: [users.id],
	}),
}));
