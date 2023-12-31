import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import Icon from "@renderer/icon/Icon";
import Window from "@renderer/window/Window";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {document.title === 'icon' ? <Icon /> : <Window />}
  </React.StrictMode>
);
