// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { getAllStaff } from "@/utils/db.ts";

import StaffTable from "@/islands/StaffTable.tsx";

async function fetchStaff() {
  console.log("is being called");
  return await getAllStaff();
}

export default async function StaffPage() {
  const staffs = await getAllStaff();
  return (
    <>
      <StaffTable staffs={staffs} />
    </>
  );
}

// import StaffTable from "@/components/StaffTable.tsx";
// import { RouteContext } from "$fresh/server.ts";
// import Head from "@/components/Head.tsx";

// // deno-lint-ignore require-await
// export default async function index(_req: Request, ctx: RouteContext) {
//   return (
//     <>
//       <Head title="Staff" href={ctx.url.href} />
//       <main>
//         {console.log("staff table index page!")}
//         <StaffTable />
//       </main>
//     </>
//   );
// }
