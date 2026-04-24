import { Window } from "happy-dom";

const win = new Window();
Object.defineProperty(globalThis, "localStorage", {
  value: win.localStorage,
  writable: true,
  configurable: true,
});
