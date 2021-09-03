import { config } from 'dotenv';

let configed = false;

export default function () {
  let gotConfiged = false;
  if (!configed) {
    config();
    configed = true;
    gotConfiged = true;
  }
  return gotConfiged;
}
