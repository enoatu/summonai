import { useState, useRef, useEffect } from "react";
import constants from "@common/constants";
import utils from "@common/utils";

let once = false;

function App() {
  const [selectedDir, updateSelectedDir] = useState(constants.steamPath);
  const [isLoading, updateIsLoading] = useState(false);
  const [isFinished, updateIsFinished] = useState(false);
  const [logs, updateLogs] = useState([]);
  const logRef = useRef(null);

  const openDirDialog = async () => {
    console.log("hoge", logRef);
    await window.versions.test();
    const dir = await window.api.selectDir(selectedDir);
    console.log(dir);
    updateSelectedDir(dir);
  };

  const start = async () => {
    updateLogs([]);
    updateIsFinished(false);
    updateIsLoading(true);
    await window.api.start(selectedDir);
    updateIsFinished(true);
    updateIsLoading(false);
  };
  const cancel = async () => {
    updateIsLoading(false);
  };

  const logging = (_event, log) => {
    updateLogs((prevLogs) => utils.exceptUniq([...prevLogs, log]));
  };

  useEffect(() => {
    if (once) return;
    window.api.logging(logging);
    once = true;
  }, []);

  useEffect(() => {
    const obj = logRef.current;
    obj.scrollTop = obj.scrollHeight;
  }, [logs]);

  return (
    <div className="container">
      <h1>7dtd Localizer</h1>
      <label htmlFor="folderPath">7 Days To Die フォルダを選択してください</label>
      <br />
      <div>
        <input type="text" value={selectedDir} onChange={(e) => updateSelectedDir(e.target.value || "")} width={500} />
        <button id="open-dir-button" type="button" onClick={openDirDialog}>
          選択
        </button>
      </div>
      {!isLoading ? (
        <>
          <button id="start-button" type="button" onClick={start}>
            日本語化を実行する
          </button>
          <div style={{ height: 20 }} />
        </>
      ) : (
        <>
          <button id="cancel-button" type="button" onClick={cancel}>
            キャンセルする
          </button>
          <div style={{ height: 20 }}>
            <p>日本語化中...</p>
          </div>
        </>
      )}
      <div style={{ height: 20 }}>{isFinished && <p className="finished">日本語化が完了しました</p>}</div>
      <div className="log" ref={logRef}>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      <p id="info">
        This app is using Chrome (v{versions.chrome()}), Node.js (v{versions.node()}), and Electron (v
        {versions.electron()})
      </p>
    </div>
  );
}

export default App;
