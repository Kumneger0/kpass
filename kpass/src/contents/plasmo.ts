import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

window.addEventListener("load", () => {
  console.log("content script loaded")
})

console.log(chrome)
