import {queryPerformer} from "./worker";

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const performer = urlParams.get("performer");
  if (performer) {
    const result = await queryPerformer(performer);
    document.getElementById("content")!.innerText = result.join("\n");
  }
}

init();
