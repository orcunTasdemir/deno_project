import { Handlers, Status } from "$fresh/server.ts";
import { getStaffByEmail } from "@/utils/db.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const baseAddress = "@ctulocal1.org";
    const staff = await getStaffByEmail(
      ctx.params.id.toLowerCase().concat(baseAddress),
    );
    if (staff === null) return new Response(null, { status: Status.NotFound });
    return Response.json(staff);
  },
};
