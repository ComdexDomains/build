import { useState } from "react";
import { connectKeplr } from "../services/keplr";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
  JsonObject,
} from "@cosmjs/cosmwasm-stargate";
import {
  convertMicroDenomToDenom,
  convertDenomToMicroDenom,
  convertFromMicroDenom,
} from "../util/conversion";

import { ToastOptions, toast } from "react-toastify";
// import { NotificationContainer, NotificationManager } from 'react-notifications'
import { coin } from "@cosmjs/launchpad";

export interface ISigningCosmWasmClientContext {
  walletAddress: string;
  client: CosmWasmClient | null;
  signingClient: SigningCosmWasmClient | null;
  loading: boolean;
  error: any;
  connectWallet: Function;
  disconnect: Function;

  getConfig: Function;
  config: any;
  isAdmin: boolean;

  getBalances: Function;
  nativeBalanceStr: string;
  nativeBalance: number;

  executeRegister: Function;
  extendDate: Function;
  fetchName: Function;
  fetchDomains: Function;
  fetchAllDomains: Function;
  totalDomainCount: number;
  domains: any;
}

export const PUBLIC_CHAIN_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || "";
export const PUBLIC_CHAIN_REST_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAIN_REST_ENDPOINT || "";
export const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "";
export const PUBLIC_STAKING_DENOM =
  process.env.NEXT_PUBLIC_STAKING_DENOM || "ucmdx";
export const PUBLIC_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const defaultFee = {
  amount: [],
  gas: "400000",
};

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [client, setClient] = useState<CosmWasmClient | null>(null);
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [nativeBalanceStr, setNativeBalanceStr] = useState("");
  const [nativeBalance, setNativeBalance] = useState(0);

  const [config, setConfig] = useState({
    owner: "",
    enabled: true,
    denom: null,
    treasury_amount: 0,
    flip_count: 0,
  });

  const [domains, setDomains] = useState([]);

  const [totalDomainCount, setTotalDomainCount] = useState(0);
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    connect & disconnect   //////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  interface ExtendedToastOptions extends ToastOptions {
    duration: number;
  }

  const toastOptions: ExtendedToastOptions = {
    duration: 10000,
  };

  const connectWallet = async (inBackground: boolean) => {
    if (!inBackground) setLoading(true);

    try {
      await connectKeplr();

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID);

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSignerOnlyAmino(
        PUBLIC_CHAIN_ID
      );

      // make client
      setClient(await CosmWasmClient.connect(PUBLIC_CHAIN_RPC_ENDPOINT));

      // make client
      setSigningClient(
        await SigningCosmWasmClient.connectWithSigner(
          PUBLIC_CHAIN_RPC_ENDPOINT,
          offlineSigner
        )
      );

      // get user address
      const [{ address }] = await offlineSigner.getAccounts();
      setWalletAddress(address);

      localStorage.setItem("address", address);

      if (!inBackground) {
        setLoading(false);
        toast.success("Connected Successfully");
      }
    } catch (error) {
      toast.error(`Connect error : ${error}`);
      if (!inBackground) {
        setLoading(false);
      }
    }
  };

  const disconnect = () => {
    if (signingClient) {
      localStorage.removeItem("address");
      signingClient.disconnect();
    }
    setIsAdmin(false);
    setWalletAddress("");
    setSigningClient(null);
    setLoading(false);
    toast.success(`Disconnected successfully`);
  };

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    global variables    /////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const getBalances = async () => {
    setLoading(true);
    try {
      const objectNative: JsonObject = await signingClient?.getBalance(
        walletAddress,
        PUBLIC_STAKING_DENOM
      );
      setNativeBalanceStr(
        `${convertMicroDenomToDenom(
          objectNative.amount
        )} ${convertFromMicroDenom(objectNative.denom)}`
      );
      setNativeBalance(convertMicroDenomToDenom(objectNative.amount));
      setLoading(false);
      // toast.success(`Successfully got balances`)
    } catch (error) {
      setLoading(false);
      // toast.error(`GetBalances error : ${error}`)
    }
  };

  const getConfig = async () => {
    setLoading(true);
    try {
      const response: JsonObject = await signingClient?.queryContractSmart(
        PUBLIC_CONTRACT_ADDRESS,
        {
          config: {},
        }
      );
      setConfig(response);
      setIsAdmin(response.owner == walletAddress);
      setLoading(false);
      // toast.success(`Successfully got config`)
    } catch (error) {
      setLoading(false);
      // toast.error(`getConfig error : ${error}`)
    }
  };

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Execute Flip and Remove Treasury     ////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const extendDate = async (name: string, duration: number) => {
    setLoading(true);
    const isExist = await fetchName(name);
    if (isExist) {
      try {
        const result = await signingClient?.execute(
          walletAddress, // sender address
          PUBLIC_CONTRACT_ADDRESS, // token escrow contract
          {
            extend: {
              name: name,
              duration: duration,
            },
          },
          defaultFee,
          undefined,
          []
        );
        setLoading(false);
        getBalances();

        if (result && result.transactionHash) {
          const response: JsonObject = await signingClient.getTx(
            result.transactionHash
          );
          let log_json = JSON.parse(response.rawLog);
          let wasm_events = log_json[0].events[2].attributes;

          if (wasm_events[3].value === duration) {
            toast.success("Register success:" + result.txHash, toastOptions);
            await fetchDomains(walletAddress);
            console.log("************Hash result", result);
          }
        }
      } catch (error) {
        setLoading(false);
        toast.error(`Contract error : ${error}`);
        toast.error(error as string);
      }
    } else toast.warn("Domain not exist");
  };

  const executeRegister = async (
    name: string,
    duration: number,
    price: number
  ) => {
    setLoading(true);
    const isExist = await fetchName(name);
    if (!isExist) {
      try {
        const result = await signingClient?.execute(
          walletAddress, // sender address
          PUBLIC_CONTRACT_ADDRESS, // token escrow contract
          {
            register: {
              name: name,
              duration: duration,
            },
          },
          defaultFee,
          undefined,
          [
            coin(
              parseInt(convertDenomToMicroDenom(price), 10),
              PUBLIC_STAKING_DENOM
            ),
          ]
        );
        setLoading(false);
        getBalances();

        console.log("st", nativeBalance);

        if (result && result.transactionHash) {
          const response: JsonObject = await signingClient.getTx(
            result.transactionHash
          );
          let log_json = JSON.parse(response.rawLog);
          let wasm_events = log_json[0].events[5].attributes;

          if (wasm_events[3].value === name) {
            toast.success("Register success:" + result.txHash, toastOptions);
            await fetchDomains(walletAddress);
            await fetchAllDomains();
            console.log("************Hash result", result);
          }
        }
      } catch (error) {
        setLoading(false);
        toast.error(`Contract error : ${error}`);
        toast.error(error as string);
      }
    } else toast.warn("Domain exist");
  };

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Get History            //////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const fetchName = async (name: string) => {
    console.log(name);
    setLoading(true);
    try {
      const response: JsonObject = await signingClient.queryContractSmart(
        PUBLIC_CONTRACT_ADDRESS,
        {
          resolve_record: {
            name: name,
          },
        }
      );

      console.log("response", response);

      const { address } = response as { address: string };


      console.log("owner address:", address);

      setLoading(false);

      if (address) return address;
      else return false;
    } catch (e) {
      toast.error(e as string);
    }
  };

  const fetchAllDomains = async () => {
    setLoading(true);
    try {

      const response: JsonObject = await signingClient.queryContractSmart(
        PUBLIC_CONTRACT_ADDRESS,
        {
          resolve_all_addr: {
          },
        }
      );

      console.log("fetch", response);
      let all_data = response;

      console.log("************fetchAllDomains Data", all_data);

      let count = 0;
      for (let owner_data of all_data) {
        count += owner_data[1].length;
      }

      console.log("************fetchAllDomains Count", count);
      setTotalDomainCount(count);
      setLoading(false);
    } catch (e) {
      console.log("************fetchAllDomains failed", e);
      toast.error(e as string);
      setLoading(false);
    }
  };

  const fetchDomains = async (addr: string) => {
    setLoading(true);
    try {

      const response: JsonObject = await signingClient.queryContractSmart(
        PUBLIC_CONTRACT_ADDRESS,
        {
          resolve_addr: {
            address: addr,
          },
        }
      );

      console.log("response:", response)

      response.list.reverse();
      setDomains(response.list);

      console.log("list", response.list);
      console.log("domains", domains);

      setLoading(false);
    } catch (e) {
      toast.error(e as string);
      setLoading(false);
    }
  };

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
    client,
    getConfig,
    config,
    isAdmin,

    getBalances,
    nativeBalanceStr,
    nativeBalance,

    executeRegister,
    extendDate,
    fetchName,
    fetchDomains,
    fetchAllDomains,
    totalDomainCount,
    domains,
  };
};
