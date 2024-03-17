import { Artist, Track } from "@spotify/web-api-ts-sdk";

export interface Festival {
	id: string;
	name: string;
	artists: Artist[];
}

export interface Group {
	id: string;
	name: string;
	members: string[];
	tracks: Track[];
}
