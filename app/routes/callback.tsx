import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";
import { Buffer } from "node:buffer";

// add these to something more secure

interface SpotifyAuthResponse {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	console.log("We have got here");
	const client_id = context.cloudflare.env.SPOTIFY_CLIENT_ID;
	const redirect_uri = context.cloudflare.env.REDIRECT_URI;
	const client_secret = context.cloudflare.env.SPOTIFY_CLIENT_SECRET;

	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const code = searchParams.get("code") || null;
	const state = searchParams.get("state") || null;

	if (state === null) {
		return redirect("/"); // add a query string with error information
	}

	if (code === null) {
		return redirect("/");
	}

	const body = new URLSearchParams({
		code: code,
		redirect_uri: redirect_uri,
		grant_type: "authorization_code",
	});

	const auth = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString(
				"base64",
			)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: body,
	});

	const jsonResponse = (await auth.json()) as SpotifyAuthResponse;

	const token = jsonResponse.access_token;

	// lets get the user ID
	const res = await fetch("https://api.spotify.com/v1/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const userResponse = (await res.json()) as { id: string };
	const userId = userResponse.id;
	console.log(userId);

	const session = await getSession(request.headers.get("Cookie"));

	session.set("token", token);
	session.set("userId", userId);

	return redirect("/", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};

export default function Callback() {
	return (
		<div>
			<h1>The callback page</h1>
			<Link to={"/"}>go to playlists</Link>
		</div>
	);
}
