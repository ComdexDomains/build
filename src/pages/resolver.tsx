import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  Divider,
  Grid,
  Input,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useSigningClient } from "@/context/cosmwasm";
import { toast } from "react-toastify";
import Loading from "@/components/loading";
import { captureRejectionSymbol } from "events";

interface PriceProps {
  characters: any,
  price: any,
  total?: any
}

type Props = {};
const Home: React.FC<Props> = () => {
  const [duration, setDuration] = useState<Number | String>(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [myDomains, setMyDomains] = useState(testDomainInfo);
  const [currentDomainName, setCurrentDomainName] = useState("");
  const [resolverAddress, setResolverAddress] = useState("");
  const [resolverOwner, setResolverOwner] = useState("");
  const [isLoading, setLoadingView] = useState(false);
  const {
    walletAddress,
    signingClient,
    fetchDomains,
    fetchName,
    nativeBalance,
    executeRegister,
    loading,
    domains
  } = useSigningClient()


  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      setMyDomains([])
      return
    }

    fetchDomains(walletAddress);
  }, [signingClient, walletAddress])

  useEffect(() => {
    if (domains === null) {
      return
    }
    setMyDomains(domains)
    console.log("*********My domain list", domains);
  }, [domains])

  useEffect(() => {
    let fixedPrice = 0;
    if (currentDomainName?.length < 3)
      return;
    else if (currentDomainName.length == 3)
      fixedPrice = 5;
    else if (currentDomainName.length == 4)
      fixedPrice = 2;
    else if (currentDomainName.length > 4)
      fixedPrice = 1;

    console.log("**********Current Price:", parseInt(duration.toString()) * fixedPrice);
    setCurrentPrice(parseInt(duration.toString()) * fixedPrice);
  }, [currentDomainName, duration])


  const handleResolver = async () => {
    let owner = "";
    if (resolverAddress.length == 0) {
      toast.warning("Domain is required");
      setResolverOwner(owner);
      return;
    }
    else if (resolverAddress.slice(-5) != ".cmdx") {
      toast.warning("Domain is required matching with xxx.cmdx");
      setResolverOwner(owner);
      return;
    }
    else {
      owner = await fetchName(resolverAddress.substring(0, resolverAddress.length - 5));
    }

    if (!owner)
      toast.warning("Resolver non exist");
    setResolverOwner(owner);
  }

  return (
    <Container
      sx={{
        paddingTop: "6vh",
        paddingBottom: "6vh",
        position: "relative"
      }}
    >
      {/* <Grid container spacing={4}>
        <Grid item md={4} sm={6} xs={12}>
          <PriceCard characters={"5+"} price={1} total={(currentDomainName?.length >= 5) ? currentPrice : 0} />
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <PriceCard characters={"4"} price={2} total={(currentDomainName?.length == 4) ? currentPrice : 0} />
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <PriceCard characters={"3"} price={5} total={(currentDomainName?.length == 3) ? currentPrice : 0} />
        </Grid>
      </Grid> */}
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        width: "100%",
        position: "absolute"
      }}>
        <Typography variant="h4">
          Comdex Name Service Resolver
        </Typography>

        <Box
          sx={{
            marginTop: "5vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "720px",
              height: "64px",
              padding: "0px 8px",
              borderRadius: "32px",
              background: "#203040",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Input
              placeholder="Name Service Resolver"
              sx={{
                // border: "1px solid red",
                width: "100%",
                color: "#a0b0c0",
                padding: "5px 10px",
                ":before": {
                  display: "none",
                },
                ":after": {
                  display: "none",
                },
              }}
              onChange={(e) => setResolverAddress(e.target.value)}
            />
            <Button
              sx={{
                height: "48px",
                padding: "5px 20px",
                borderRadius: "24px",
                background: "#a0b0c0 !important",
                color: "#101820",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: "400",
                ":hover": {
                  background: "#a0b0c0 !important",
                },
              }}

              onClick={handleResolver}
            >
              Resolver
            </Button>
          </Box>
          {resolverOwner && <Box
            sx={{
              width: "100%",
              maxWidth: "720px",
              height: "44px",
              padding: "0px 8px",
              background: "#00ff4045",
              display: "flex",
              borderRadius: "10px",
              marginTop: "10px",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "19px",
                fontWeight: "700",
                background:
                  "linear-gradient(to right, #0085FA 0%, #009FFB 50%, #00e7fd 100%)",
                "-webkit-background-clip": "text",
                "-webkit-text-fill-color": "transparent",
              }}
            >
              {resolverOwner}
            </Typography>
          </Box>}
        </Box>
      </Box>



      <Dialog
        open={loading || isLoading}
        sx={{
          ".MuiPaper-root": {
            background: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            margin: "0",
            padding: "0",
          },
        }}
      >
        <Loading />
      </Dialog>
    </Container>
  );
}


const testDomainInfo: any[] | (() => any[]) = [
  // {
  //   domainName: "punk.cmdx",
  //   expiredDate: "20 Sep 2023 1:16:59",
  // },
  // {
  //   domainName: "meme.cmdx",
  //   expiredDate: "20 Sep 2023 1:16:59",
  // },
  // {
  //   domainName: "token.cmdx",
  //   expiredDate: "20 Sep 2023 1:16:59",
  // },
  // {
  //   domainName: "character.cmdx",
  //   expiredDate: "20 Sep 2023 1:16:59",
  // },
];

export default Home;