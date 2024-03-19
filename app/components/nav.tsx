import { NavLink } from "@remix-run/react";
import { cap } from "callum-util";
import { SessionData } from "~/sessions";

interface NavigationProps {
	links: string[];
  session?: SessionData;
}

export function Navigation({ links, session }: NavigationProps) {
	return (
		<nav className="p-4 flex gap-4">
			<NavLink to={"/"}>Home</NavLink>
			{links.map((link) => (
				<NavLink key={link} to={`/${link}`}>
					{cap(link)}
				</NavLink>
			))}
      <p>{session?.spotifyId}</p>
		</nav>
	);
}
