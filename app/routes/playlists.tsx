import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const client_id = context.cloudflare.env.SPOTIFY_CLIENT_ID;

	const session = await getSession(request.headers.get("Cookie"));

	if (session.get("token")) {
		const token = session.get("token")!;
		const spotifyId = session.get("spotifyId")!;

		const spotify = SpotifyApi.withAccessToken(client_id, token);
		const playlists = await spotify.playlists.getUsersPlaylists(spotifyId, 5);

		return json({ playlists });
	}

	return redirect("/");
};

export default function PlaylistsRoute() {
	const { playlists } = useLoaderData<typeof loader>();
	return (
		<div>
			<h1>This is the playlist route</h1>
			<div className="space-y-7">
				{playlists.items.map((pl) => (
					<div key={pl.id} className="border rounded-md shadow-red-50 p-6 shadow-xl">
						<p>{pl.name}</p>
					</div>
				))}
			</div>
		</div>
	);
}
