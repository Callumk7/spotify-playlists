import { Dialog } from "@ariakit/react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import Example from "~/components/dialog";
import { createDrizzle } from "~/db";
import { groups } from "~/db/schema";
import { getSession } from "~/sessions";

export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));
	if (!session.get("token")) {
		return redirect("/login");
	}

	const groupId = String(params.groupId);

	const db = createDrizzle(context.cloudflare.env.DB);
	const groupDetails = await db.query.groups.findFirst({
		where: eq(groups.id, groupId),
	});

	return json({ groupDetails });
};

export default function GroupView() {
	const { groupDetails } = useLoaderData<typeof loader>();
	return (
		<main>
			<h1>{groupDetails?.name}</h1>
      <div>
        <Example />
        <form>
          <button type="submit">Add Playlist</button>
        </form>
      </div>
		</main>
	);
}
