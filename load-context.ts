import { type PlatformProxy } from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
interface Env {
	SPOTIFY_CLIENT_ID: "73b8fc71d93f4977acb3103bbd69a1b5";
	SPOTIFY_CLIENT_SECRET: "dad43a6e04054abd8905e0cc5683187a";
	REDIRECT_URI: "http://localhost:8788/callback";
	DB: D1Database;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: Cloudflare;
	}
}
