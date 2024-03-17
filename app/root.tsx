import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import styles from "~/tw.css?url";
import { Navigation } from "./components/nav";

export const links = () => {
	return [{ rel: "stylesheet", href: styles }];
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="bg-slate-50 text-slate-950">
				<Navigation links={["login", "playlists", "groups"]} />
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
