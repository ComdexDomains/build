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

interface Domain {
  name: string,
  expired: string
}
interface PriceProps {
  characters: any,
  price: any,
  total?: any
}

function isAlphaNumeric(domain: string) {
  const regex = /^[a-z0-9]+$/;
  return regex.test(domain);
}


function PriceCard(props: PriceProps) {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: "12px",
        padding: "20px 20px",
        backgroundColor: "#ffffff10",
        // backgroundBlendMode: "20px",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        img: {
          width: { lg: "90px", md: "72px", sm: "72px", xs: "72px" },
          // background: "#101820",
          background: "radial-gradient(at left bottom, rgb(236, 72, 153), rgb(239, 68, 68), rgb(234, 179, 8))",
          borderRadius: "50%",
        },
      }}
    >
      <img alt="" src="./dns.svg" />
      <Box
        sx={{
          width: "100%",
          marginLeft: "20px",
          borderLeft: "2px dashed #101820",
          padding: "10px 0 10px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: { lg: "24px", md: "20px", sm: "20px", xs: "20px" },
            whiteSpace: "nowrap",
          }}
        >
          {props.characters} characters
        </Typography>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "700",
            background:
              "#e81f3f",
            "-webkit-background-clip": "text",
            "-webkit-text-fill-color": "transparent",
          }}
        >
          {props.price} CMDX
        </Typography>
        {props.total > 0 &&
          <Typography
            sx={{
              fontSize: "26px",
              fontWeight: "700",
              background:
                "#e81f3f",
              "-webkit-background-clip": "text",
              "-webkit-text-fill-color": "transparent",
            }}
          >
            Total: {props.total} CMDX
          </Typography>}
      </Box>
    </Box>
  );
}

interface DateCellProps {
  seconds: string;
}



type Props = {};
const Home: React.FC<Props> = () => {
  const [duration, setDuration] = useState<Number | String>(1);
  const [extendDuration, setExtendDuration] = useState<Number | String>(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [myDomains, setMyDomains] = useState([]);
  const [currentDomainName, setCurrentDomainName] = useState("");
  const [selectedDomainName, setSelectedDomainName] = useState("");
  const [resolverAddress, setResolverAddress] = useState("");
  const [resolverOwner, setResolverOwner] = useState("");
  const [isLoading, setLoadingView] = useState(false);
  const [isExtending, setLoadingExtending] = useState(false);
  const {
    walletAddress,
    signingClient,
    fetchDomains,
    fetchAllDomains,
    totalDomainCount,
    fetchName,
    nativeBalance,
    executeRegister,
    extendDate,
    loading,
    domains
  } = useSigningClient()


  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      setMyDomains([])
      return
    }
    fetchAllDomains();
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


  const handleExtend = async (domain: string) => {
    setLoadingView(true);
    console.log("**********handleExtend", domain, extendDuration);

    try {
      await extendDate(domain, extendDuration);
    } catch (e) {
      console.log(e);
      toast.error("Register Failed");
    }

    setLoadingExtending(false);
    setLoadingView(false);
  }

  const handleRegister = async () => {

    console.log("********current Info:", currentDomainName, currentPrice, duration, nativeBalance);

    if (currentDomainName.length == 0) {
      toast.warning("Domain is required");
      return;
    }

    if (currentDomainName.length < 3) {
      toast.warning("Domain is at least 3 length required");
      return;
    }

    if (!isAlphaNumeric(currentDomainName)) {
      toast.warning("Domain contains az-09 characters");
      return;
    }


    if (currentPrice <= 0) {
      toast.warning("Price is required");
      return;
    }

    if (!signingClient || walletAddress.length === 0) {
      toast.error('Please connect wallet');
      return
    }

    if (nativeBalance < currentPrice) {
      toast.error("Insufficient Balances");
      return
    }

    console.log("price:", currentPrice);
    console.log("duration:", duration);

    setLoadingView(true);
    try {
      await executeRegister(currentDomainName, duration, currentPrice);
    } catch (e) {
      console.log(e);
      toast.error("Register Failed");
    }
    setLoadingView(false);
  }


  const FormatDate = (seconds: string) => {
    const date = new Date(parseInt(seconds) * 1000);
    const formattedDate = date.toLocaleDateString();
    return formattedDate;
  };

  return (
    <Container
      sx={{
        paddingTop: "6vh",
        paddingBottom: "6vh",
      }}
    >
      <Grid container spacing={4}>
        <Grid item md={4} sm={6} xs={12}>
          <PriceCard characters={"5+"} price={1} total={(currentDomainName?.length >= 5) ? currentPrice : 0} />
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <PriceCard characters={"4"} price={2} total={(currentDomainName?.length == 4) ? currentPrice : 0} />
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <PriceCard characters={"3"} price={5} total={(currentDomainName?.length == 3) ? currentPrice : 0} />
        </Grid>
      </Grid>

      <Box
        sx={{
          marginTop: "5vh",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
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
          <Select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{
              width: "110px",
              height: "48px",
              borderRadius: "24px",
              background: "#a0b0c0",
              color: "#101820",
              ".MuiOutlinedInput-notchedOutline": {
                borderWidth: "0 !important",
              },
              ".MuiSvgIcon-root": {
                color: "#101820",
              },
            }}
          >
            <MenuItem value={1}>1 Year</MenuItem>
            <MenuItem value={2}>2 Year</MenuItem>
            <MenuItem value={5}>5 Year</MenuItem>
            <MenuItem value={10}>10 Year</MenuItem>
          </Select>
          <Input
            placeholder="Search Domain Name"
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
            onChange={(e) => setCurrentDomainName(e.target.value)}
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

            onClick={handleRegister}
          >
            Register
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          margin: "6vh auto 0",
          width: "100%",
          maxWidth: "800px",
          minHeight: "10vh",
          background: "#304050",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            minHeight: "10vh",
            background: "#304050",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around"
          }}
        >

          <Typography
            sx={{
              color: "white !important",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            {`Total Domains: ${walletAddress ? totalDomainCount : 0}`}
          </Typography>
          <Typography
            sx={{
              color: "white !important",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >

            {` My Domains: ${myDomains?.length}`}
          </Typography>
        </Box>
        <Divider
          sx={{
            width: "100%",
            borderColor: "#203040",
            margin: "20px 0",
          }}
        />
        {myDomains.length > 0 ? (
          myDomains.map((item: Domain) => (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #a0b0c080",
                padding: "10px 0",
                ":last-child": {
                  border: "none",
                },
                ".MuiTypography-root": {
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                },
                ":hover": {
                  backgroundColor: "#00ff4045"
                }
              }}

              onClick={() => { setLoadingExtending(true), setSelectedDomainName(item.name) }}
            >
              <Typography>{item.name}.cmdx</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { sm: "row", xs: "column" },
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "700",
                    marginRight: "10px",
                  }}
                >
                  Domain expired date
                </Typography>
                <Typography>{FormatDate(item.expired)}</Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              padding: "20px 0",
            }}
          >
            <Typography>No Domain</Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={isExtending}
        onClose={() => setLoadingExtending(false)}
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
        <Box
          sx={{
            marginTop: "5vh",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
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
              gap: "30px"
            }}
          >
            <Select
              value={extendDuration}
              onChange={(e) => setExtendDuration(e.target.value)}
              sx={{
                width: "110px",
                height: "48px",
                borderRadius: "24px",
                background: "#a0b0c0",
                color: "#101820",
                ".MuiOutlinedInput-notchedOutline": {
                  borderWidth: "0 !important",
                },
                ".MuiSvgIcon-root": {
                  color: "#101820",
                },
              }}
            >
              <MenuItem value={1}>1 Year</MenuItem>
              <MenuItem value={2}>2 Year</MenuItem>
              <MenuItem value={5}>5 Year</MenuItem>
              <MenuItem value={10}>10 Year</MenuItem>
            </Select>

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

              onClick={() => handleExtend(selectedDomainName)}
            >
              Extend
            </Button>
          </Box>
        </Box>
      </Dialog>
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

    </Container >
  );
}



export default Home;