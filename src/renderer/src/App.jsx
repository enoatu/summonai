import { useEffect } from "react";
import constants from "@common/constants";

function App() {
  useEffect(() => {
    const folderPath = document.getElementById("folder-path");
    folderPath.innerText = constants.steamPath;
    (async () => {
      const information = document.getElementById("info");
      information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;
    })();
    const openFolderButton = document.getElementById("open-folder-button");
    openFolderButton.addEventListener("click", openFolderDialog);
  }, []);

  const openFolderDialog = async () => {
    await window.versions.test();
    const folderPath = document.getElementById("folderPath").value;
    const filePaths = await window.versions.getFilePaths(folderPath);
    console.log(filePaths);
  };

  return (
    <>
      <h1>7dtd Localizer</h1>
      <label htmlFor="folderPath">フォルダのパス:</label>
      <input type="text" id="folder-path" name="folderPath" />
      <br />
      <button id="open-folder-button" type="button">
        フォルダを選択
      </button>
      <button id="start-button" type="button">
        日本語化を実行する
      </button>
      <br />
      <p id="info"></p>
    </>
  );
}

export default App;
