const constants = require("./constants");

const folderPath = document.getElementById("folder-path");
folderPath.innerText = constants.steamPath;

(async () => {
  const information = document.getElementById("info");
  information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

})()

const openFolderButton = document.getElementById('open-folder-button');
openFolderButton.addEventListener('click', openFolderDialog)
async function openFolderDialog() {
  await window.versions.test();
  const folderPath = document.getElementById('folderPath').value;
  const filePaths = await window.versions.getFilePaths(folderPath);
  console.log(filePaths);
}
