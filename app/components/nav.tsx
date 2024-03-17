import { NavLink } from "@remix-run/react";
import { cap } from "callum-util";

interface NavigationProps {
	links: string[];
}

export function Navigation({ links }: NavigationProps) {
	return (
		<nav className="p-4 flex gap-4">
			{links.map((link) => (
				<NavLink key={link} to={`/${link}`}>
					{cap(link)}
				</NavLink>
			))}
		</nav>
	);
}
