import React, { useEffect, useState } from 'react';
// import { ipcRenderer } from 'electron';
import icon from '@icon/icon.png';

function Icon() {
  // const [isSpread, setIsSpread] = useState(false);
  useEffect(() => {
    // ipcRenderer.on('ICON_SPREAD', (event, message) => {
    //   setIsSpread(message);
    // });
  });

  return (
    <div className="container">
      <h1>hogggggggggggggggggggggggg</h1>
      <img src={icon} width="20" height="20" style="margin: 5px; cursor: pointer;" alt="icon"/>
    </div>
  );
}

export default Icon;
