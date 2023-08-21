import React from "react";
import Navbar from "./navbar";
import {
  GLOBAL_TEXT_COLOR,
  NAVBAR_HEIGHT,
} from "../config-global";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Box } from "@mui/material";

type Props = {
  children?: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <div>
      <Navbar />
      <Box
        sx={{
          paddingTop: `${NAVBAR_HEIGHT}px`,
          ".MuiTypography-root": {
            color: GLOBAL_TEXT_COLOR,
          },
        }}
      >
        {props.children}
      </Box>
    </div>
  );
};

export default Layout;
