// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { getAllStaff } from "@/utils/db.ts";

import StaffTable from "@/islands/StaffTable.tsx";

const MAIN_STYLES = "max-[500px]:text-sm";

export default function StaffPage() {
  return (
    <>
      {" "}
      <main class={MAIN_STYLES}>
        <StaffTable />
      </main>
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
