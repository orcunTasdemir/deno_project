import Head from "@/components/Head.tsx";
import type { RouteContext } from "$fresh/server.ts";
import { getAllStaff, listStaff, Staff } from "@/utils/db.ts";

function StaffRow(staff: Staff) {
  return (
    <tr>
      <td class={TD_STYLES}>{staff.first_name}</td>
      <td class={TD_STYLES}>{staff.last_name}</td>
      <td class={TD_STYLES}>{staff.email}</td>
    </tr>
  );
}

const TH_STYLES = "p-4 text-left";
const TD_STYLES = "p-4";

export default async function StaffsPage(_req: Request, ctx: RouteContext) {
  const staffs = await getAllStaff();
  return (
    <>
      <Head title="Staff" href={ctx.url.href} />
      <main>
        <div class="w-full rounded-lg shadow border-1 border-gray-300 overflow-x-auto">
          <table class="table-auto border-collapse w-full">
            <thead class="border-b border-gray-300">
              <tr>
                <th class={TH_STYLES}>First Name</th>
                <th class={TH_STYLES}>Last Name</th>
                <th class={TH_STYLES}>Email</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff) => <StaffRow {...staff} />)}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
