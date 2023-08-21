import {
  NAVBAR_BACKGROUND_COLOR,
  NAVBAR_HEIGHT,
  WALLETCONNECT_BUTTON_COLOR,
} from "../config-global";

import React, { useEffect } from "react";
import { Box, Button, Container, Typography } from "@mui/material";

import { useSigningClient } from "../context/cosmwasm";
import { useRouter } from "next/router";

export default function Navbar() {

  const router = useRouter();

  const {
    walletAddress,
    connectWallet,
    signingClient,
    disconnect,
    getBalances,
    nativeBalanceStr,
    nativeBalance
  } = useSigningClient();
  
  useEffect(() => {
    let account = localStorage.getItem("address");
    if (account != null) {
      connectWallet(true);
    }
  }, []);

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) return;
    getBalances();
  }, [walletAddress, signingClient]);

  const handleConnect = () => {
    if (walletAddress.length === 0) {
      connectWallet(false);
    } else {
      disconnect();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        width: "100vw",
        height: `${NAVBAR_HEIGHT}px`,
        background: NAVBAR_BACKGROUND_COLOR,
        // borderBottom: "1px solid #303030",
        zIndex: "1",
      }}
    >
      <Container
        sx={{
          // border: "1px solid red",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: { sm: "space-between", xs: "initial" }
        }}
      >
        <Box
          sx={{
            display: { sm: "flex", xs: "none" },
            height: "100%",
            padding: { sm: "16px 0", xs: "20px 0" },
            img: {              
              height: "100%",
            },
            cursor: "pointer"
          }}
          onClick={() => router.push("/home")}
        >
          <img alt="" src="./injLogo.png" />
        </Box>
        <Box
          sx={{
            display: { sm: "none", xs: "flex" },
            height: "100%",
            padding: { sm: "16px 0", xs: "20px 0" },
            img: {
              height: "100%",
            },
            cursor: "pointer"
          }}
          onClick={() => router.push("/home")}
        >
          <img alt="" src="./injLogo.png" />
        </Box>


        <Box sx={{ display: "flex", flexDirection: "row", paddingX: { xs: "10px", sm: "0px" }, gap: { sm: "40px", xs: "10px" }, width: { sm: "50%" } }}>
          <Typography
            sx={{
              color: "white !important",
              fontSize: "20px",
              fontWeight: "700",
              cursor: "pointer"
            }}
            onClick={() => router.push("/home")}
          >
            {"Home"}
          </Typography>

          <Typography
            sx={{
              color: "white !important",
              fontSize: "20px",
              fontWeight: "700",
              cursor: "pointer"
            }}
            onClick={() => router.push("/resolver")}
          >
            {"Resolver"}
          </Typography>
        </Box>

        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >

          <Typography
            sx={{
              color: "white !important",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer"

            }}
          >{walletAddress && (nativeBalance.toFixed(2))}</Typography>
          <Box
            sx={{
              marginLeft: "10px",
              ".MuiButton-root": {
                width: { sm: "160px", xs: "120px" },
                height: { sm: "36px", xs: "32px" },
                border: `1px solid ${WALLETCONNECT_BUTTON_COLOR}`,
                borderRadius: "18px",
                color: WALLETCONNECT_BUTTON_COLOR,
                textTransform: "none",
                fontSize: { sm: "14px", xs: "11px" },
                lineHeight: { sm: "16px", xs: "11px" },
              },
            }}
          >



            <Button
              onClick={handleConnect}

            >

              <Box
                sx={{
                  width: "30px",
                  height: "30px",
                  backgroundImage: `url(${walletAddress
                    ? "./logo192.png"
                    : "./keplr128.png"
                    })`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "auto 60%",
                  backgroundPosition: { sm: "0px center", xs: "0px center" },
                }}
              />

              {walletAddress
                ? walletAddress.substring(0, 6) +
                "..." +
                walletAddress.substring(
                  walletAddress.length - 6,
                  walletAddress.length
                )
                : "Connect Wallet"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
