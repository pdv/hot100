import {queryPerformer} from "./worker";

async function init() {
  const result = await queryPerformer("The White Stripes");
  document.body.textContent = result.join("\n");
}

init();
