
///
/// LOADER

import { LoaderFunctionArgs, json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";

///
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSession(
    request.headers.get("Cookie")
  );

  let token = "";
  let userId = "";

  if (session.get("token")) {
    token = session.get("token")!;
    userId = session.get("userId")!;
  }

  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const resJson = await res.json();

  return json({resJson})
}


export default function PlaylistsRoute() {
  const {resJson} = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>This is the playlist route</h1>
      <p style={{
        whiteSpace: "pre-wrap"
      }}>{JSON.stringify(resJson, null, "\t")}</p>
    </div>
  )
}
