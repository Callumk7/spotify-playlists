import { redirect } from "@remix-run/cloudflare";
import { randomString } from "~/util/random-string";

export const action = async () => {
	const client_id = "73b8fc71d93f4977acb3103bbd69a1b5";
	const redirect_uri = "http://localhost:5173/callback";

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
		<div>
			<div>This is the spotify auth page</div>
			<form method="POST">
				<button type="submit">test</button>
			</form>
		</div>
	);
}
