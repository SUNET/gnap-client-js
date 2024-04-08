export const add = (a: number, b: number) => a + b;
export const sub = (a: number, b: number) => a - b;

export { continueRequest } from "./core/continueRequest";
export { transactionRequest } from "./core/transactionRequest";

function sayHi(name = "there") {
  return `Hi ${name}!`;
}

export { sayHi };

export * from "./typescript-client";
export * from "./redirect/interactionStart";
export * from "./redirect/interactionCallback";
