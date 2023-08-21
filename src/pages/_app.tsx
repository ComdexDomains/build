import Layout from "@/layouts/Layout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SigningCosmWasmProvider } from '../context/cosmwasm'

import "@/styles/globals.css";
import type { AppProps } from "next/app";

// import * as gtag from '../util/google-analytics';
import { useRouter } from "next/router";
// import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // const router = useRouter();

  // useEffect(() => {
  //   const handleRouteChange = (url: string) => {
  //     gtag.pageview(url);
  //   };

  //   router.events.on('routeChangeComplete', handleRouteChange);

  //   return () => {
  //     router.events.off('routeChangeComplete', handleRouteChange);
  //   };
  // }, [router.events]);

  return (
    <SigningCosmWasmProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ToastContainer autoClose={3000} />
    </SigningCosmWasmProvider>

  );
}
