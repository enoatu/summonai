import React, { useEffect, useState } from 'react';
// import { ipcRenderer } from 'electron';
import icon from '@renderer/icon/icon.png';

function App() {
  // const [isSpread, setIsSpread] = useState(false);
  useEffect(() => {
    // ipcRenderer.on('ICON_SPREAD', (event, message) => {
    //   setIsSpread(message);
    // });
  });

  return (
    <div className="container m-4">
      <img src={icon} width="20" height="20" className="m-[5px] cursor-pointer;" alt="icon"/>
    </div>
  );
}

export default App;
