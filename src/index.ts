import {queryPerformer} from "./worker";

async function init() {
  const result = await queryPerformer("The White");
  document.body.textContent = result.join("\n");
}

init();
