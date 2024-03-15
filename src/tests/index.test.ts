import { add, sub } from "../index";

describe("Utility | Main", () => {
  it("add - should add the given two numbers", async () => {
    expect(add(4, 2)).toEqual(6);
  });

  it("sub - should subtract the given two numbers", async () => {
    expect(sub(4, 2)).toEqual(2);
  });
});

import { sayHi } from "../index";

test("Returns a greeting as a string", function () {
  // Test some stuff...
  expect(typeof sayHi()).toBe("string");
  expect(sayHi().includes("there")).toBe(true);
  expect(sayHi("Merlin").includes("Merlin")).toBe(true);
  expect(sayHi("Merlin")).toContain("Merlin");
  expect(sayHi()).toBeTruthy();
  expect(sayHi()).not.toHaveLength(0);
});
