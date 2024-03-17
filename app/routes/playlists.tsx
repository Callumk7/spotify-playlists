import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Playlist } from "@spotify/web-api-ts-sdk";
import { getSession } from "~/sessions";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));

	const client_id = context.cloudflare.env.SPOTIFY_CLIENT_ID;
	const redirect_uri = context.cloudflare.env.REDIRECT_URI;
	const scope =
		"user-top-read playlist-read-private playlist-read-collaborative user-read-email";
  
	const spotify = SpotifyApi.withUserAuthorization(
		client_id,
		redirect_uri,
		scope.split(" "),
	);

  console.log("playlists route, we got past creating a spotify instance")

	if (session.get("token")) {
    console.log("we have a token")
		const token = session.get("token")!;
		const spotifyId = session.get("spotifyId")!;

		const playlists = await spotify.playlists.getUsersPlaylists(spotifyId, 5);

		// const res = await fetch(`https://api.spotify.com/v1/users/${spotifyId}/playlists`, {
		// 	headers: {
		// 		Authorization: `Bearer ${token}`,
		// 	},
		// });
		// const resJson = (await res.json()) as { items: Playlist[] };
		// console.log(resJson);

		console.log(playlists);

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
