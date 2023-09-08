// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import {
  CsvStream,
  type CsvStreamOptions,
} from "https://deno.land/std@0.166.0/encoding/csv/stream.ts";

import { createStaff, type Staff } from "@/utils/db.ts";
/**
 * A helper async generator function which yields the parsed CSV rows
 */
async function* iterateCsvRows(
  filePath: string,
  options?: CsvStreamOptions,
): AsyncGenerator<string[], void> {
  // Open the file to get a handle:
  const file = await Deno.open(filePath);

  // Pipe the file's ReadableStream (Uint8Array chunks)
  // through a TextDecoderStream, then pipe those string chunks
  // through the CsvStream:
  const readable = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new CsvStream(options));

  // Yield the resulting parsed string arrays:
  for await (const stringArray of readable) yield stringArray;

  // The file auto-closes after the ReadableStream finishes and closes
}

async function main() {
  const csvPath = "data/reps-no-role.csv";

  const csvStreamOptions: CsvStreamOptions = {
    separator: ",",
  };

  const iterator = iterateCsvRows(csvPath, csvStreamOptions);
  iterator.next();
  for await (const row of iterator) {
    const staff: Staff = {
      id: crypto.randomUUID(),
      first_name: row[0],
      last_name: row[1],
      email: row[2],
    };
    console.log(staff);
    createStaff(staff);
  }
}

if (import.meta.main) main();
