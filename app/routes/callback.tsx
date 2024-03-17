import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";
import { createDrizzle } from "~/db";
import { eq } from "drizzle-orm";
import { users } from "~/db/schema";
import { uuidv4 } from "callum-util";
import { authenticateUserWithSpotify } from "~/services/spotify";

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

	const { token, userId } = await authenticateUserWithSpotify(
		client_id,
		client_secret,
		code,
		redirect_uri,
	);

	// TODO: this should be its own function
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
				token: token.access_token,
				spotifyId: userId,
			})
			.returning();

		if (newInternalUser[0].id !== newId) {
			throw new Error("Error creating user in database");
		}

		session.set("userId", newId);
	} else {
		session.set("userId", internalUser.id);
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
