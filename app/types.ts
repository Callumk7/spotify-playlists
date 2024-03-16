import { Artist } from "@spotify/web-api-ts-sdk";

export interface Festival {
	id: string;
	name: string;
	artists: Artist[];
}
