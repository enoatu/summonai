import React, { useEffect, useState } from 'react';
import icon from '@renderer/icon/icon.png';
import RadialMenu from '@renderer/icon/RadialMenu';


function App() {
  const [isSpread, setIsSpread] = useState(false);
  useEffect(() => {
    window.api.ICON_SPREAD((_event, value) => {
      setIsSpread(true);
    })
    window.api.ICON_UNSPREAD((_event, value) => {
      setIsSpread(false);
    })
  }, [])

  return (
    <div>
      {isSpread ?
        <RadialMenu /> :
        <img src={icon} width="20" height="20" className="rounded-full cursor-pointer" alt="icon"
          onClick={() => setIsSpread(!isSpread)}
        />
      }
    </div>
  );
}

export default App;
