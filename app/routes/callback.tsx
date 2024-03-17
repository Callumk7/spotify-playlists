import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";
import { Buffer } from "node:buffer";
import { createDrizzle } from "~/db";
import { eq } from "drizzle-orm";
import { users } from "~/db/schema";
import { uuidv4 } from "callum-util";

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
	// const redirect_uri = "http://localhost:5173/callback";
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

	const session = await getSession(request.headers.get("Cookie"));
	// check for an entry in d1
	const db = createDrizzle(context.cloudflare.env.DB);
	const internalUser = await db.query.users.findFirst({
		where: eq(users.spotifyId, userId),
	});

	if (!internalUser) {
		const newId = `user_${uuidv4()}`;
		const newInternalUser = await db
			.insert(users)
			.values({
				id: newId,
				token: token,
				spotifyId: userId,
			})
			.returning();

		if (newInternalUser[0].id !== newId) {
			throw new Error("Error creating user in database");
		}

		session.set("userId", newId);
	}

	session.set("token", token);
	session.set("spotifyId", userId);

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
