import SortButton from "@/components/sortButton.tsx";
import { sortBy } from "https://deno.land/std@0.203.0/collections/sort_by.ts";
import { Staff } from "@/utils/db.ts";
import { useEffect, useMemo, useState } from "preact/hooks";
import SearchBar from "@/components/SearchBar.tsx";
import { useSignal } from "@preact/signals";

async function fetchStaffs(cursor: string) {
  let url = "api/staffs";
  if (cursor !== "") url += "?cursor=" + cursor;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Request failed: GET ${url}`);
  }
  return (await resp.json()) as { staffs: Staff[]; cursor: string };
}

// Define the props interface for StaffRow
interface StaffRowProps {
  index: number;
  staff: Staff;
}

function StaffRow({ index, staff }: StaffRowProps) {
  return (
    <tr class={TR_STYLES}>
      <td class={INDEX_STYLES}>{index}</td>
      <td class={TD_STYLES}>
        {/* if you are okay with having the names upper-cased in the database you can avoid this long statement */}
        {staff.first_name.charAt(0).toUpperCase() + staff.first_name.slice(1)}
      </td>
      <td class={TD_STYLES}>
        {staff.last_name.charAt(0).toUpperCase() + staff.last_name.slice(1)}
      </td>
      <td class={TD_STYLES}>{staff.email}</td>
    </tr>
  );
}

const INDEX_STYLES =
  "px-4 sm:px-1/2 max-w-fit flex-wrap mr-0 pr-1 border-solid border-white fill-current";
const TR_STYLES = "max-w-fit hover:bg-denoColorLight";
const TH_STYLES = "py-4 px-4 sm:px-1/2 text-left max-w-fit";
const TD_STYLES = "py-4 px-4 sm:px-1/2 max-w-fit flex-nowrap";

interface Props {
  staffs: Staff[];
}

export default function StaffTable() {
  const staffsSig = useSignal<Staff[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal(false);

  async function loadMoreStaff() {
    isLoadingSig.value = true;
    try {
      const { staffs, cursor } = await fetchStaffs(cursorSig.value);
      staffsSig.value = [...staffsSig.value, ...staffs];
      cursorSig.value = cursor;
    } catch (error) {
      console.log(error.message);
    } finally {
      isLoadingSig.value = false;
    }
  }

  useEffect(() => {
    loadMoreStaff();
  }, []);

  console.log("Sig value: ", staffsSig.value);

  //State for staffs
  const [staffs, setStaffs] = useState<Staff[]>([]);

  console.log("staffs: ", staffs);

  //State for the search text
  const [searchText, setSearchText] = useState("");

  //Memoized version of the initial staff list
  const fullStaffList = useMemo(() => staffsSig.value, [staffsSig.value]);

  //initially all orders from KV are desc so we set all initials to asc
  const initSortOrders: { [key: string]: "asc" | "desc" } = {
    first_name: "asc",
    last_name: "asc",
    email: "asc",
  };
  const [sortOrder, setSortOrder] = useState<{ [key: string]: "asc" | "desc" }>(
    initSortOrders
  );

  //Handling search input changes
  const handleSearchChange = (value: string) => {
    setSearchText(value.toLowerCase());
    staffFilter();
  };

  // Function to filter staff based on the searchText value
  const staffFilter = () => {
    const newStaffs = fullStaffList.filter(
      (staff) =>
        staff.first_name.toLowerCase().includes(searchText) ||
        staff.last_name.toLowerCase().includes(searchText) ||
        staff.email.toLowerCase().includes(searchText)
    );
    setStaffs(newStaffs);
  };

  function sortedByStringFields(staffList: Staff[], field: keyof Staff) {
    const currentSortOrder = sortOrder[field];
    const newSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    setSortOrder({ [field]: newSortOrder });
    // Set the updated sort order first
    setStaffs(
      sortBy(staffList, (el) => el[field], {
        order: newSortOrder,
      })
    );
  }

  // Effect to update filtered staffs whenever searchText changes
  useEffect(() => {
    staffFilter();
  }, [searchText]);

  useEffect(() => {
    setStaffs(staffsSig.value);
  }, [staffsSig.value]);

  return (
    <>
      <main>
        <div class="w-full rounded-lg shadow border-1 border-gray-300 overflow-x-auto">
          <table class="table-auto border-collapse w-full">
            <thead class="border-b border-gray-300">
              <tr class="">
                <th class={INDEX_STYLES}># </th>
                <th class={TH_STYLES}>
                  First Name{" "}
                  <SortButton
                    onClick={() => {
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
                <th class={TH_STYLES}>
                  <SearchBar
                    value={searchText}
                    onInputChange={handleSearchChange}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff, index) => (
                <StaffRow index={index} staff={staff} key={staff.id} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
