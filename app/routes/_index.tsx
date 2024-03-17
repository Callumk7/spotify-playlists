import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createDrizzle } from "~/db";
import { users } from "~/db/schema";
import { getSession } from "~/sessions";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{
			name: "description",
			content: "Welcome to Remix! Using Vite and Cloudflare!",
		},
	];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));

	if (session.get("token")) {
		console.log(session.get("token"));
		console.log(session.get("userId"));
	}

	const db = createDrizzle(context.cloudflare.env.DB);
	const firstUser = await db
		.insert(users)
		.values({
			name: "First user",
		})
		.returning()
		.onConflictDoNothing();

	return json({ firstUser });
};

export default function Index() {
	const { firstUser } = useLoaderData<typeof loader>();
	console.log(firstUser);
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
			<h1>Welcome to Remix (with Vite and Cloudflare)</h1>
			<ul>
				<li>
					<a
						target="_blank"
						href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
						rel="noreferrer"
					>
						Cloudflare Pages Docs - Remix guide
					</a>
				</li>
				<li>
					<a target="_blank" href="https://remix.run/docs" rel="noreferrer">
						Remix Docs
					</a>
				</li>
			</ul>
		</div>
	);
}
