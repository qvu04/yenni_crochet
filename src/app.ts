import React from "react";
import { createRoot } from "react-dom/client";

import "zmp-ui/zaui.css";
import "css/tailwind.scss";
import "css/app.scss";

import App from "components/app";

const root = createRoot(document.getElementById("app")!);
root.render(React.createElement(App));
