import {
  CsvStream,
  CsvStreamOptions,
} from "https://deno.land/std@0.166.0/encoding/csv/stream.ts";

import { kv } from "@/utils/db.ts";

import { createStaffer, Staffer } from "@/utils/db-reps.ts";

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
  const csvPath = "data/reps-2023-08.csv";

  const csvStreamOptions: CsvStreamOptions = {
    separator: ",",
  };

  for await (const row of iterateCsvRows(csvPath, csvStreamOptions)) {
    const staff: Staffer = {
      id: crypto.randomUUID(),
      first_name: row[0],
      last_name: row[1],
      email: row[2],
    };
    createStaffer(staff);
  }
}

if (import.meta.main) main();
