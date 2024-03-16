import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";

// add these to something more secure
const redirect_uri = "http://localhost:5173/callback";
const client_id = "73b8fc71d93f4977acb3103bbd69a1b5";
const client_secret = "dad43a6e04054abd8905e0cc5683187a";

interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
      Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
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

  const session = await getSession(request.headers.get("Cookie"))

  if (!session.get("token")) {
    session.set("token", token)
  }
  if (!session.get("userId")) {
    session.set("userId", userId)
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
};

export default function Callback() {
  return (
    <div>
      <h1>The callback page</h1>
      <Link to={"/"}>go to playlists</Link>
    </div>
  );
}
