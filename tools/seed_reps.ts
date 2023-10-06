import { parse, stringify } from "https://deno.land/std@0.194.0/csv/mod.ts";
import {
  createSchool,
  createStaffer,
  type School,
  Staffer,
} from "../utils/db-reps.ts";

let text = await Deno.readTextFile("./data/reps-schools-2023-08.csv");

let schools = parse(text, {
  skipFirstRow: true,
  strip: true,
});

//console.log (schools[schools.length - 1]);

for (const skool of schools) {
  //console.log("Skool:",skool)
  const school: School = {
    deptID: Number.parseInt(skool.DeptID),
    shortName: skool.SchoolShortName,
    rep: skool.rep,
    organizer: skool.organizer,
  };
  //console.log("School:",school)
  createSchool(school);
}

text = await Deno.readTextFile("./data/reps-role.csv");

let staffers = parse(text, {
  skipFirstRow: true,
  strip: true,
});

// let values = staffers.values();
//console.log(values);
for (const staff of staffers) {
  const staffer: Staffer = {
    firstName: staff.first_name,
    lastName: staff.last_name,
    email: staff.email,
    role: staff.role,
  };
  createStaffer(staffer);
}
