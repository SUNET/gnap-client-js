export const add = (a: number, b: number) => a + b;
export const sub = (a: number, b: number) => a - b;

export { continueRequest, isHashValid } from "./core/continueRequest";
export { accessRequest } from "./core/accessRequest";

function sayHi(name = "there") {
  return `Hi ${name}!`;
}

export { sayHi };

export * from "./typescript-client";
export * from "./redirect/redirectInteraction";
