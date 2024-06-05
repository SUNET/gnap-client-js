export const add = (a: number, b: number) => a + b;
export const sub = (a: number, b: number) => a - b;

export { continueGrantRequest } from "./core/continueGrantRequest";
export { fetchGrantResponse } from "./core/fetchGrantResponse";

function sayHi(name = "there") {
  return `Hi ${name}!`;
}

export { sayHi };

export * from "./typescript-client";
export * from "./interact/redirectURI/redirectURIStart";
export * from "./interact/redirectURI/redirectURIFinish";
