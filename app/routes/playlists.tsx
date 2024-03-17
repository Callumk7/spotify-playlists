///
/// LOADER

import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Playlist } from "@spotify/web-api-ts-sdk";
import { getSession } from "~/sessions";

///
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));

	if (session.get("token")) {
		const token = session.get("token")!;
		const spotifyId = session.get("spotifyId")!;

		const res = await fetch(`https://api.spotify.com/v1/users/${spotifyId}/playlists`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const resJson = (await res.json()) as { items: Playlist[] };
		console.log(resJson);

		return json({ resJson });
	}

	return json({ resJson: { items: [] } });
};

export default function PlaylistsRoute() {
	const { resJson } = useLoaderData<typeof loader>();
	return (
		<div>
			<h1>This is the playlist route</h1>
			<div className="space-y-7">
				{resJson.items.map((pl) => (
					<div key={pl.id} className="border rounded-md shadow-red-50 p-6 shadow-xl">
						<p>{pl.name}</p>
					</div>
				))}
			</div>
		</div>
	);
}
