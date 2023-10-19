export const isMac = process.platform === "darwin";
export const isWindows = process.platform === "win32";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const removeBlank = (text) => {
  // \uFFFC はノーブレークスペース
  return text.replace("\uFFFC", "").replace(/\t|\s|\r/g, "").trim();
}
