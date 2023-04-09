// mocks/browser.js
import { setupWorker } from "msw";
import { handlers } from "./handler";

export const worker = setupWorker(...handlers);
