import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { eq } from "drizzle-orm";
import { MainContainer } from "~/components/main-container";
import { createDrizzle } from "~/db";
import { groups } from "~/db/schema";
import { getSession } from "~/sessions";

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

	// We need to load a user's playlists from spotify to see if they want to add them to
	// this group.
	const spotify = SpotifyApi.withAccessToken(client_id, token);
	const allPlaylists = await spotify.playlists.getUsersPlaylists(userId, 50);

	return json({ groupDetails, allPlaylists });
};

export default function GroupView() {
	const { groupDetails, allPlaylists } = useLoaderData<typeof loader>();
	return (
		<MainContainer>
			<h1>{groupDetails?.name}</h1>
			<div className="grid grid-cols-2 gap-3">
				{allPlaylists.items.map((pl) => (
					<div key={pl.id} className="bg-slate-200 rounded-md p-3">
						<h1>{pl.name}</h1>
						<p>tracks: {pl.tracks.total}</p>
						<p>{pl.description}</p>
					</div>
				))}
			</div>
		</MainContainer>
	);
}
