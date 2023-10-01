import StaffTable from "@/islands/StaffTable.tsx";
import { RouteContext } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";

// deno-lint-ignore require-await
export default async function index(_req: Request, ctx: RouteContext) {
  return (
    <>
      <Head title="Staff" href={ctx.url.href} />
      <main>
        <StaffTable />
      </main>
    </>
  );
}
