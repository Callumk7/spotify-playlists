import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { SpotifyApi, Track } from "@spotify/web-api-ts-sdk";
import { eq } from "drizzle-orm";
import { MainContainer } from "~/components/main-container";
import { createDrizzle } from "~/db";
import { groups, tracks, tracksToGroups } from "~/db/schema";
import { getSession } from "~/sessions";
import { chunkArray } from "callum-util";

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));
	const token = session.get("token");
	if (!token) {
		return redirect("/login");
	}

	const userId = session.get("spotifyId")!;
	const client_id = context.cloudflare.env.SPOTIFY_CLIENT_ID;

	const groupId = String(params.groupId);

	const db = createDrizzle(context.cloudflare.env.DB);
	const groupDetails = await db.query.groups.findFirst({
		where: eq(groups.id, groupId),
	});

	const groupTracks = await db.query.tracksToGroups.findMany({
		where: eq(tracksToGroups.groupId, groupId),
		with: {
			track: true,
		},
	});

	// We need to load a user's playlists from spotify to see if they want to add them to
	// this group.
	const spotify = SpotifyApi.withAccessToken(client_id, token);
	const allPlaylists = await spotify.playlists.getUsersPlaylists(userId, 50);

	return json({ groupDetails, allPlaylists, groupTracks });
};

export const action = async ({ request, context, params }: ActionFunctionArgs) => {
	// get all the tracks and save them to the group
	const session = await getSession(request.headers.get("Cookie"));
	const token = session.get("token");
	if (!token) {
		return redirect("/login");
	}

	const form = await request.formData();
	const playlist_id = String(form.get("playlist_id"));

	const client_id = context.cloudflare.env.SPOTIFY_CLIENT_ID;
	const spotify = SpotifyApi.withAccessToken(client_id, token);

	const allTracks = await spotify.playlists.getPlaylistItems(playlist_id);

	// save these tracks to database
	const db = createDrizzle(context.cloudflare.env.DB);

	const trackInserts = allTracks.items.map((track) => ({
		id: track.track.id,
		name: track.track.name,
		artist: track.track.artists[0].name,
		album: track.track.album.name,
	}));

	const userId = session.get("spotifyId")!;
	const groupId = params.groupId;

	const tracksToGroupsInserts = trackInserts.map((track) => ({
		trackId: track.id,
		groupId: groupId!,
		addedBy: userId,
	}));

	const chunkedTrackInserts = chunkArray(trackInserts, 20);
	const chunkedTrackToGroupInserts = chunkArray(tracksToGroupsInserts, 20);

	for (const tChunk of chunkedTrackInserts) {
		await db.insert(tracks).values(tChunk).onConflictDoNothing();
	}

	for (const tgChunk of chunkedTrackToGroupInserts) {
		await db.insert(tracksToGroups).values(tgChunk).onConflictDoNothing();
	}

	return json({ allTracks });
};

export default function GroupView() {
	const { groupDetails, allPlaylists, groupTracks } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();
	return (
		<MainContainer>
			<h1>{groupDetails?.name}</h1>
			<div className="space-y-5">
				{allPlaylists.items.map((pl) => (
					<div key={pl.id} className="bg-slate-200 rounded-md p-3 flex justify-between">
						<h2 className="font-bold">{pl.name}</h2>
						<fetcher.Form method="POST">
							<input type="hidden" value={pl.id} name="playlist_id" />
							<button
								type="submit"
								className="p-1 rounded-sm shadow-slate-400/50 shadow-lg bg-slate-100"
							>
								Add Tracks
							</button>
						</fetcher.Form>
					</div>
				))}
			</div>
			<div className="bg-blue-50">
				{groupTracks.map((item) => (
					<p key={item.trackId}>{item.track.name}</p>
				))}
			</div>
			{fetcher.data && (
				<div className="bg-red-50">
					{fetcher.data.allTracks.items.map((item, i) => (
						<p key={i}>{item.track.name}</p>
					))}
				</div>
			)}
		</MainContainer>
	);
}
