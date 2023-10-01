// const first_staff: Staff = {
//     id: "4",
//     first_name: "fake",
//     last_name: "fake",
//     email: "fake",
//   };
//   console.log(first_staff);

// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { sortBy } from "https://deno.land/std@0.203.0/collections/sort_by.ts";
import { getAllStaff, listStaff, Staff } from "@/utils/db.ts";
import { useEffect, useState } from "preact/hooks";
import Head from "@/components/Head.tsx";
import { RouteContext } from "$fresh/server.ts";
import SortButton from "@/components/sortButton.tsx";
import { useSignal } from "@preact/signals";

const TH_STYLES = "p-4 text-left";
const TD_STYLES = "p-4";

async function fetchStaff() {
  console.log("is being called");
  return await getAllStaff();
}

function StaffRow(props: Staff) {
  return (
    <tr>
      <td class={TD_STYLES}>{props.first_name}</td>
      <td class={TD_STYLES}>{props.last_name}</td>
      <td class={TD_STYLES}>{props.email}</td>
    </tr>
  );
}

function sortedByStringFields(staffList: Staff[], field: keyof Staff) {
  sortBy(staffList, (el) => el[field]);
}

export default function StaffsTable() {
  const staffsSig = useSignal<Staff[]>([]);
  const isLoadingSig = useSignal(false);

  async function loadStaff() {
    console.log("load staff!");
    isLoadingSig.value = true;
    try {
      const staffs = await fetchStaff();
      staffsSig.value = [...staffsSig.value, ...staffs];
    } catch (error) {
      console.log(error.message);
    } finally {
      isLoadingSig.value = false;
    }
  }
  useEffect(() => {
    console.log("use effect is called!");
    loadStaff();
  }, []);

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
                    onClick={() =>
                      sortedByStringFields(staffsSig.value, "first_name")
                    }
                  />
                </th>
                <th class={TH_STYLES}>
                  Last Name{" "}
                  <SortButton
                    onClick={() =>
                      sortedByStringFields(staffsSig.value, "last_name")
                    }
                  />
                </th>
                <th class={TH_STYLES}>
                  Email{" "}
                  <SortButton
                    onClick={() =>
                      sortedByStringFields(staffsSig.value, "email")
                    }
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {staffsSig.value.map((staff) => (
                <StaffRow {...staff} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
