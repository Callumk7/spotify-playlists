import {
	ActionFunctionArgs,
	json,
	redirect,
	type LoaderFunctionArgs,
	type MetaFunction,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { uuidv4 } from "callum-util";
import { eq } from "drizzle-orm";
import { createDrizzle } from "~/db";
import { groups, users, usersToGroups } from "~/db/schema";
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

	if (!session.get("token")) {
		return redirect("/login");
	}

	const userId = session.get("userId");
	const token = session.get("token");

	const db = createDrizzle(context.cloudflare.env.DB);
	const userGroups = await db.query.usersToGroups.findMany({
		where: eq(usersToGroups.userId, userId!),
		with: {
			group: true,
		},
	});

	return json({ userGroups });
};

export default function Index() {
	const { userGroups } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	return (
		<main className="w-4/5 mx-auto">
			<h1>Groups</h1>
			<div>
				{userGroups.map((group) => (
					<div key={group.groupId}>{group.group.name}</div>
				))}
			</div>
			<div>
				<fetcher.Form method="POST" action="/groups">
					<input type="text" name="group_name" />
					<button type="submit">create new group</button>
				</fetcher.Form>
			</div>
		</main>
	);
}
