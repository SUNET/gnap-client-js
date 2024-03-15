export const add = (a: number, b: number) => a + b;
export const sub = (a: number, b: number) => a - b;

export { continueRequest } from "./continueRequest";
export { requestAccess } from "./requestAccess";

function sayHi(name = "there") {
  return `Hi ${name}!`;
}

export { sayHi };
