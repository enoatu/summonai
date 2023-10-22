import React, { useEffect, useState } from 'react';
// import { ipcRenderer } from 'electron';
import icon from '@renderer/icon/icon.png';
import RadialMenu from '@renderer/icon/RadialMenu';


function App() {
  const [isSpread, setIsSpread] = useState(false);
  useEffect(() => {
    // ipcRenderer.on('ICON_SPREAD', (event, message) => {
    //   setIsSpread(message);
    // });
  });

  return (
    <div className="container">
      {isSpread ?
        <RadialMenu /> :
        <img src={icon} width="20" height="20" className="m-5 cursor-pointer" alt="icon"
          onClick={() => setIsSpread(!isSpread)}
        />
      }
    </div>
  );
}

export default App;
