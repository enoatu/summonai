import React from "react";
import { Menu, MenuItem, SubMenu } from "@spaceymonk/react-radial-menu";

function RadialMenu({ text }) {
  const [show, setShow] = React.useState(true);
  const [position, setPosition] = React.useState({ x: 150, y: 150 });

  // You can also use separate handler for each item
  const handleItemClick = (event, index, data) => {
    console.log(`[MenuItem] ${data} clicked`);
    // setShow(false); // you should handle your menu visibility yourself
    alert(`[MenuItem] ${data} clicked`);
  };
  const handleSubMenuClick = (event, index, data) => {
    console.log(`[SubMenu] ${data} clicked`);
  };
  const handleDisplayClick = (event, position) => {
    console.log(`[Display] ${position} clicked`);
  };

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
        <MenuItem onItemClick={handleItemClick} data={text}>
          {text}
        </MenuItem>
        <SubMenu
          onDisplayClick={handleDisplayClick}
          onItemClick={handleSubMenuClick}
          itemView="2. Sub Menu"
          data="2. Sub Menu"
          displayPosition="bottom"
        >
          <MenuItem onItemClick={handleItemClick} data="2.1. Item">
            2.1. Item
          </MenuItem>
          <MenuItem onItemClick={handleItemClick} data="2.2. Item">
            2.2. Item
          </MenuItem>
          <MenuItem onItemClick={handleItemClick} data="2.3. Item">
            2.3. Item
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
