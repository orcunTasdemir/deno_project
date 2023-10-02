import { Handlers } from "$fresh/server.ts";
import { collectValues, listStaffByName } from "@/utils/db.ts";
import { getCursor } from "@/utils/pagination.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const iter = listStaffByName({
      cursor: getCursor(url),
      limit: 100,
    });
    const staffs = await collectValues(iter);
    return Response.json({ staffs, cursor: iter.cursor });
  },
};
