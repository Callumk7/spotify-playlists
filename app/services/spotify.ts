import { SpotifyApi } from "@spotify/web-api-ts-sdk";

interface SpotifyAuthResponse {
	access_token: string;
	token_type: string;
	scope: string;
	expires_in: number;
	refresh_token: string;
}

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token";

// TODO: This needs error handling
export const authenticateUserWithSpotify = async (
	clientId: string,
	clientSecret: string,
	authCode: string,
	redirectUri: string,
) => {
	const body = new URLSearchParams({
		code: authCode,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
	});

	const auth = await fetch(SPOTIFY_AUTH_URL, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
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

	return {
		token,
		userId,
	};
};

export const getUserPlaylistsFromSpotify = async (userId: string) => {
	const spotifyResponse = await fetch(`${SPOTIFY_BASE_URL}/users/${userId}//playlists`);
};
