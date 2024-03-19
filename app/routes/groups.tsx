import { ActionFunctionArgs, redirect, json } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { square } from "callum-typescript-test";
import { uuidv4 } from "callum-util";
import { createDrizzle } from "~/db";
import { groups, usersToGroups } from "~/db/schema";
import { getSession } from "~/sessions";

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const db = createDrizzle(context.cloudflare.env.DB);
	const session = await getSession(request.headers.get("Cookie"));

	if (!session.get("token")) {
		return redirect("/login");
	}

	const userId = session.get("userId")!;

  const x = square(35);
  console.log(x);

	const form = await request.formData();
	const groupName = form.get("group_name");

	const newGroup = await db
		.insert(groups)
		.values({
			id: `group_${uuidv4()}`,
			name: String(groupName),
		})
		.returning();

	if (newGroup[0].id) {
		await db.insert(usersToGroups).values({
			groupId: newGroup[0].id,
			userId: userId,
		});
	}

	return json({ newGroup });
};

export default function GroupsRoute() {
	return (
		<main>
			<p>Groups Route</p>
			<Outlet />
		</main>
	);
}
