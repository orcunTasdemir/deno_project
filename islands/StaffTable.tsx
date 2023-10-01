import SortButton from "@/islands/sortButton.tsx";
import { sortBy } from "https://deno.land/std@0.203.0/collections/sort_by.ts";
import { Staff } from "@/utils/db.ts";
import { useEffect, useState } from "preact/hooks";

function StaffRow(props: Staff) {
  return (
    <tr>
      <td class={TD_STYLES}>{props.first_name}</td>
      <td class={TD_STYLES}>{props.last_name}</td>
      <td class={TD_STYLES}>{props.email}</td>
    </tr>
  );
}

const TH_STYLES = "p-4 text-left";
const TD_STYLES = "p-4";

interface Props {
  staffs: Staff[];
}

export default function StaffTable(props: Props) {
  // States for set staff
  const [staffs, setStaffs] = useState<Staff[]>([]);
  //initially all orders from KV are desc so we set all initials to asc
  //so the first click does not just do nothing and feel off
  const initSortOrders: { [key: string]: "asc" | "desc" } = {
    first_name: "asc",
    last_name: "asc",
    email: "asc",
  };
  const [sortOrder, setSortOrder] = useState<{ [key: string]: "asc" | "desc" }>(
    initSortOrders
  );

  // Initialize staffs with props.staffs when the component mounts
  useEffect(() => {
    setStaffs(props.staffs);
  }, [props.staffs]);

  function sortedByStringFields(staffList: Staff[], field: keyof Staff) {
    const currentSortOrder = sortOrder[field];
    const newSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    setSortOrder({ [field]: newSortOrder }); // Set the updated sort order first
    setStaffs(
      sortBy(staffList, (el) => el[field], {
        order: newSortOrder,
      })
    );
  }

  // Log the updated staffs whenever it changes
  useEffect(() => {
    console.log("reordered: ", staffs);
  }, [staffs]);

  return (
    <>
      <main>
        <div class="w-full rounded-lg shadow border-1 border-gray-300 overflow-x-auto">
          <table class="table-auto border-collapse w-full">
            <thead class="border-b border-gray-300">
              <tr>
                <th class={TH_STYLES}>
                  First Name{" "}
                  <SortButton
                    onClick={() => {
                      console.log("clicked");
                      sortedByStringFields(staffs, "first_name");
                    }}
                  />
                </th>
                <th class={TH_STYLES}>
                  Last Name{" "}
                  <SortButton
                    onClick={() => sortedByStringFields(staffs, "last_name")}
                  />
                </th>
                <th class={TH_STYLES}>
                  Email{" "}
                  <SortButton
                    onClick={() => sortedByStringFields(staffs, "email")}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff) => (
                <StaffRow {...staff} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
