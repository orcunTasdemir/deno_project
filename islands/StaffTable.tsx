import SortButton from "@/components/sortButton.tsx";
import { sortBy } from "https://deno.land/std@0.203.0/collections/sort_by.ts";
import { Staff } from "@/utils/db.ts";
import { useEffect, useMemo, useState } from "preact/hooks";
import SearchBar from "@/components/SearchBar.tsx";
import { useSignal } from "@preact/signals";

// Define the props for StaffRow as interface
interface StaffRowProps {
  index: number;
  staff: Staff;
}
//styling for the table
const INDEX_STYLES =
  "px-4 sm:px-1/2 max-w-fit flex-wrap mr-0 pr-1 border-solid border-white fill-current";
const TR_STYLES = "max-w-fit hover:bg-denoColorLight";
const TH_STYLES = "py-4 px-4 sm:px-1/2 text-left max-w-fit";
const TD_STYLES = "py-4 px-4 sm:px-1/2 max-w-fit flex-nowrap";

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

export default function StaffTable() {
  //Signals for the api fetcher
  const staffsSig = useSignal<Staff[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal(false);
  //States for local state management
  const [searchText, setSearchText] = useState("");
  const [staffs, setStaffs] = useState<Staff[]>([]);
  //Memoized fullStaffList fetched from api so we can reset the search filters when we want to
  const fullStaffList = useMemo(() => staffsSig.value, [staffsSig.value]);

  //Function to fetch staff from "api/staffs" see file
  async function fetchStaffs(cursor: string) {
    let url = "api/staffs";
    if (cursor !== "") url += "?cursor=" + cursor;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Request failed: GET ${url}`);
    }
    return (await resp.json()) as { staffs: Staff[]; cursor: string };
  }
  //function to load staff
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
  //useEffect to call loadMoreStaff to initialzie our staffsSig signal
  useEffect(() => {
    loadMoreStaff();
  }, []);

  //sort field as a state that can hold first_name, last_name, and email
  const [sortField, setSortField] = useState<keyof Staff>("first_name");
  //Initialize the correct sort order so the first click is meaningfull
  //all orders from KV are desc so we set all initials to asc
  const initSortOrders: { [sortField: string]: "asc" | "desc" } = {
    first_name: "asc",
    last_name: "asc",
    email: "asc",
  };
  //setting up sortOrder state
  const [sortOrder, setSortOrder] = useState<{
    [sortField: string]: "asc" | "desc";
  }>(initSortOrders);

  //Set search text everytime the input field has a different input
  const handleSearchChange = (value: string) => {
    setSearchText(value.toLowerCase());
  };

  //Function to filter staff based on the searchText value
  const staffFilter = () => {
    const newStaffs = fullStaffList.filter(
      (staff) =>
        staff.first_name.toLowerCase().includes(searchText) ||
        staff.last_name.toLowerCase().includes(searchText) ||
        staff.email.toLowerCase().includes(searchText)
    );
    setStaffs(newStaffs);
  };

  //Sort by name, last name, or email
  function sortedByStringFields(field: keyof Staff) {
    const currentOrder = sortOrder[field];
    const newOrder = currentOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder({ ...initSortOrders, [field]: newOrder });
  }

  useEffect(() => {
    const sortedStaffs = sortBy(staffs, (el) => el[sortField], {
      order: sortOrder[sortField],
    });
    setStaffs(sortedStaffs);
  }, [sortOrder]);

  // Effect to call filter function whenever searchText changes
  useEffect(() => {
    staffFilter();
  }, [searchText]);

  // Effect to set staffs at first from the staffs signal
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
                      sortedByStringFields("first_name");
                    }}
                  />
                </th>
                <th class={TH_STYLES}>
                  Last Name{" "}
                  <SortButton
                    onClick={() => sortedByStringFields("last_name")}
                  />
                </th>
                <th class={TH_STYLES}>
                  Email{" "}
                  <SortButton onClick={() => sortedByStringFields("email")} />
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
                <StaffRow index={index + 1} staff={staff} key={staff.id} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
