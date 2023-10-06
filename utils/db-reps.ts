// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertNotEquals } from "std/testing/asserts.ts";
import { chunk } from "std/collections/chunk.ts";

const KV_PATH_KEY = "KV_PATH";
let path = undefined;
if (
  (await Deno.permissions.query({ name: "env", variable: KV_PATH_KEY }))
    .state === "granted"
) {
  path = Deno.env.get(KV_PATH_KEY);
}
export const kv = await Deno.openKv();

// Helpers
async function getValue<T>(
  key: Deno.KvKey,
  options?: { consistency?: Deno.KvConsistencyLevel },
) {
  const res = await kv.get<T>(key, options);
  return res.value;
}

async function getValues<T>(
  selector: Deno.KvListSelector,
  options?: Deno.KvListOptions,
) {
  const values = [];
  const iter = kv.list<T>(selector, options);
  for await (const entry of iter) values.push(entry.value);
  return values;
}

/**
 * Gets many values from KV. Uses batched requests to get values in chunks of 10.
 */
async function getManyValues<T>(
  keys: Deno.KvKey[],
): Promise<(T | null)[]> {
  const promises = [];
  for (const batch of chunk(keys, 10)) {
    promises.push(kv.getMany<T[]>(batch));
  }
  return (await Promise.all(promises))
    .flat()
    .map((entry) => entry?.value);
}

export function assertIsEntry<T>(
  entry: Deno.KvEntryMaybe<T>,
): asserts entry is Deno.KvEntry<T> {
  assertNotEquals(entry.value, null, `KV entry not found: ${entry.key}`);
}

/** Gets all dates since a given number of milliseconds ago */
export function getDatesSince(msAgo: number) {
  const dates = [];
  const now = Date.now();
  const start = new Date(now - msAgo);

  while (+start < now) {
    start.setDate(start.getDate() + 1);
    dates.push(formatDate(new Date(start)));
  }

  return dates;
}

export async function collectValues<T>(iter: Deno.KvListIterator<T>) {
  const values = [];
  for await (const { value } of iter) values.push(value);
  return values;
}

/** Converts `Date` to ISO format that is zero UTC offset */
export function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

// School
export interface School {
  deptID: number;
  shortName: string;
  rep: string;
  organizer: string;
}

/**
 * Creates a new school in KV. Throws if the school already exists in one of the indexes.
 *
 * @example New school creation
 * ```ts
 * import { newSchoolProps, createSchool } from "@/utils/db.ts";
 *
 * const school: School = {
 *   userLogin: "example-user-login",
 *   title: "example-title",
 *   url: "https://example.com"
 *   ..newSchoolProps(),
 * };
 *
 * await createSchool(school);
 * ```
 */
export async function createSchool(school: School) {
  const schoolsKey = ["schools", school.deptID];

  const res = await kv.atomic()
    .check({ key: schoolsKey, versionstamp: null })
    .set(schoolsKey, school)
    .commit();

  // if (!res.ok) throw new Error(`Failed to create school: school}`);
}

export async function deleteSchool(school: School) {
  const schoolsKey = ["schools", school.id];

  const res = await kv.atomic()
    .delete(schoolsKey)
    .commit();

  if (!res.ok) throw new Error(`Failed to delete school: ${school}`);
}

export async function getSchool(id: string) {
  return await getValue<School>(["schools", deptID]);
}

// Staffer
export interface Staffer {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
export async function createStaffer(staffer: Staffer) {
  const staffersKey = ["staffers", staffer.email];

  const res = await kv.atomic()
    .check({ key: staffersKey, versionstamp: null })
    .set(staffersKey, staffer)
    .commit();

  if (!res.ok) {
    console.log("Duplicate found: " + staffer.email);
  }
}

export async function deleteStaffer(email: string) {
  const staffersKey = ["staffers", email];

  const res = await kv.atomic()
    .delete(staffersKey)
    .commit();

  if (!res.ok) {
    console.log("Staffer with email " + email + " not found.");
  }
}

export async function getStaffer(email: string) {
  return await getValue<Staffer>(["staffers", email]);
}

export async function listStaffers() {
  return await getValues<Staffer>({ prefix: ["staffers"] });
}
