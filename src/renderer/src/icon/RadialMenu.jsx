import React from "react";
import { Menu, MenuItem, SubMenu } from "@spaceymonk/react-radial-menu";

function RadialMenu({ text }) {
  const [show, setShow] = React.useState(true);
  const [position, setPosition] = React.useState({ x: 150, y: 150 });
  const [hover, setHover] = React.useState(0);

  // You can also use separate handler for each item
  const handleItemClick = (event, index, data) => {
    console.log(`[MenuItem] ${data} clicked`);
    window.api.ICON_BUTTON_CLICK({text, data});
    setShow(false); // you should handle your menu visibility yourself
  };
  const handleSubMenuClick = (event, index, data) => {
    console.log(`[SubMenu] ${data} clicked`);
  };
  const handleDisplayClick = (event, position) => {
    console.log(`[Display] ${position} clicked`);
  };

  const b1 = 'どういう意味?';
  const b2 = '日本語訳して';
  const b3 = 'ビジネスライクな正しい文章にして。かつ、「。」で必ず改行すること';
  const b4 = 'これに対して何をすればいい?';
  const candidates = [b1, b2, b3, b4];

  // ホバーするとその内容が表示される(文字が外に出る) tailwindcss absolute 使用
  const TextWrapper = ({ hover, children }) => {
    return (
      <span className="text-[8.5px] w-full h-full text-ellipsis">{children}</span>
    );
  }

  return (
    <div
      // right click event
      onContextMenu={(e) => {
        e.preventDefault();
        setShow(true);
        // if your div is not full screen, you should remove the offset
        // via getBoundingClientRect().left and getBoundingClientRect().top
        // check `src/stories/BasicControls.stories.tsx` for an example
        setPosition({ x: e.clientX, y: e.clientY });
      }}
      // onClick={() => setShow(false)}
      style={{ width: "100vw", height: "100vh" }}
      className="relative"
    >
      <Menu
        centerX={position.x}
        centerY={position.y}
        innerRadius={75}
        outerRadius={150}
        show={show}
        animation={["fade", "scale"]}
        animationTimeout={150}
      >
        {/* Populate your menu here */}
        <MenuItem
          onMouseEnter={() => setHover(1)}
          onMouseLeave={() => setHover(0)}
          onItemClick={handleItemClick} data={b1}>
          <TextWrapper hover={hover === 1}>{b1}</TextWrapper>
        </MenuItem>
        <SubMenu
          onDisplayClick={handleDisplayClick}
          onItemClick={handleSubMenuClick}
          itemView="もっと見る"
          data=""
          displayPosition="bottom"
          className="text-[8.5px] w-full h-full text-ellipsis"
        >
          <MenuItem
            onMouseEnter={() => setHover(2)}
            onMouseLeave={() => setHover(0)}
            onItemClick={handleItemClick} data={b2}>
            <TextWrapper hover={hover===2}>{b2}</TextWrapper>
          </MenuItem>
          <MenuItem
            onMouseEnter={() => setHover(3)}
            onMouseLeave={() => setHover(0)}
            onItemClick={handleItemClick} data={b3}>
            <TextWrapper hover={hover===3}>{b3}</TextWrapper>
          </MenuItem>
          <MenuItem
            onMouseEnter={() => setHover(4)}
            onMouseLeave={() => setHover(0)}
            onItemClick={handleItemClick} data={b4}>
            <TextWrapper hover={hover===4}>{b4}</TextWrapper>
          </MenuItem>
          <SubMenu
            onDisplayClick={handleDisplayClick}
            onItemClick={handleSubMenuClick}
            itemView="+"
            data="2.4. Sub Menu"
            displayPosition="bottom"
            className="text-[8.5px] w-full h-full text-ellipsis"
          >
            <MenuItem onItemClick={handleItemClick} data="2.4.1. Item">
              2.4.1. Item
            </MenuItem>
            <MenuItem onItemClick={handleItemClick} data="2.4.2. Item">
              2.4.2. Item
            </MenuItem>
          </SubMenu>
        </SubMenu>
      </Menu>
      {show && <div className="absolute flex justify-center top-[93px] left-[93px] items-center w-auto h-[100px] z-[50000]">
        {hover !== 0 && <div className="bg-gray-100 rounded-lg text-sm p-2">{candidates[hover-1]}</div>}
      </div>}
    </div>
  );
}

export default RadialMenu;
