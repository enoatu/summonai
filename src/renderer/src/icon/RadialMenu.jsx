import React from "react";
import { Menu, MenuItem, SubMenu } from "@spaceymonk/react-radial-menu";

function RadialMenu({ text }) {
  const [show, setShow] = React.useState(true);
  const [position, setPosition] = React.useState({ x: 150, y: 150 });

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
  const b3 = 'ビジネスライクな正しい文章にして';
  const b4 = 'これに対して何をすればいい?';

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
        <MenuItem onItemClick={handleItemClick} data={b1}>
          {b1}
        </MenuItem>
        <SubMenu
          onDisplayClick={handleDisplayClick}
          onItemClick={handleSubMenuClick}
          itemView="もっと見る"
          data=""
          displayPosition="bottom"
        >
          <MenuItem onItemClick={handleItemClick} data={b2}>
            {b2}
          </MenuItem>
          <MenuItem onItemClick={handleItemClick} data={b3}>
            {b3}
          </MenuItem>
          <MenuItem onItemClick={handleItemClick} data={b4}>
            {b4}
          </MenuItem>
          <SubMenu
            onDisplayClick={handleDisplayClick}
            onItemClick={handleSubMenuClick}
            itemView="2.4. Sub Menu"
            data="2.4. Sub Menu"
            displayPosition="bottom"
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
    </div>
  );
}

export default RadialMenu;
