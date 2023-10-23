import React, { useEffect, useState } from 'react';
import icon from '@renderer/icon/icon.png';
import RadialMenu from '@renderer/icon/RadialMenu';

function App() {
  const [isSpread, setIsSpread] = useState(false);
  const [text, setText] = useState('ss');
  useEffect(() => {
    window.api.ICON_SPREAD(() => {
      setIsSpread(true);
    })
    window.api.ICON_SET_TEXT((_event, text) => {
      console.log(text);
      setText(text);
    })
    window.api.ICON_UNSPREAD(() => {
      setIsSpread(false);
    })
  }, [])

  return (
    <div onMouseDown={() => window.api.ICON_CLICK()}>
      {isSpread ?
        <RadialMenu text={text}/> :
        <img src={icon} width="20" height="20" className="rounded-full cursor-pointer" alt="icon"
          onClick={() => setIsSpread(!isSpread)}
        />
      }
    </div>
  );
}

export default App;
