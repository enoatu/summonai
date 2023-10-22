import React, { useState } from 'react';
import icon from '@renderer/icon/icon.png';
import RadialMenu from '@renderer/icon/RadialMenu';


function App() {
  const [isSpread, setIsSpread] = useState(false);
  window.api.ICON_SPREAD((_event, value) => {
    setIsSpread(true);
  })

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
