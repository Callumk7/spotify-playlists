import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { randomString } from "~/util/random-string";

export const action = async ({ context }: ActionFunctionArgs) => {
	const client_id = context.cloudflare.env.SPOTIFY_CLIENT_ID;
	const redirect_uri = context.cloudflare.env.REDIRECT_URI;

	const state = randomString(16);
	const scope =
		"user-top-read playlist-read-private playlist-read-collaborative user-read-email";
	const queryString = new URLSearchParams({
		response_type: "code",
		client_id: client_id,
		scope: scope,
		redirect_uri: redirect_uri,
		state: state,
		show_dialog: "true",
	});

	return redirect(`https://accounts.spotify.com/authorize?${queryString.toString()}`);
};

export default function SpotifyAuthPage() {
	return (
		<main className="w-1/2 mx-auto">
			<div className="space-y-9">
				<h1 className="text-center">This is the spotify auth page</h1>
				<div className="bg-slate-800 p-7 rounded-lg w-11/12 mx-auto min-h-40 text-slate-100 flex flex-col justify-between h-full">
					<h2>Login with Spotify</h2>
					<form method="POST">
						<button
							className="bg-lime-300 text-slate-950 rounded-sm p-2 hover:bg-lime-400"
							type="submit"
						>
							Login
						</button>
					</form>
				</div>
			</div>
		</main>
	);
}
