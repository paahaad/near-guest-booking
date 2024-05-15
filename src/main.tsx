/* eslint-disable @typescript-eslint/ban-ts-comment */
window.global ||= window;
import { Buffer } from "buffer"
global.Buffer = Buffer
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import './index.css'
import { getConfig } from "./config"
import * as nearAPI from "near-api-js"
import NearWalletSelector from "@near-wallet-selector/core"
import { setupNearWallet } from "@near-wallet-selector/near-wallet"
import nearWalletIconUrl from "@near-wallet-selector/near-wallet/assets/near-wallet-icon.png"

const { contractName } = getConfig(process.env.NODE_ENV || "development" )

console.log("[After Before has bee init]")
// Initializing contract
async function initContract() {
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

  const selector = await NearWalletSelector.init({
    network: "testnet",
    contractId: contractName,
    wallets: [
      setupNearWallet({iconUrl: nearWalletIconUrl}),
      // setupSender({iconUrl: senderIconUrl}) NOT WORKING
    ],
  });
  // @ts-ignore
  window.selector = selector;

  selector.on("signIn", () => window.location.replace(window.location.origin + window.location.pathname));
  selector.on("signOut", () => window.location.replace(window.location.origin + window.location.pathname));
  
  let currentUser;
  if (selector.isSignedIn()) {

    const account = (await selector.getAccounts())[0];
    // @ts-ignore
    window.accountId = account.accountId;
    const provider = new nearAPI.providers.JsonRpcProvider({
      url: selector.network.nodeUrl,
    });

    currentUser = {
      // @ts-ignore
      accountId:  window.accountId,
      // @ts-ignore
      balance:  (await provider.query(`account/${account.accountId}`, "")).amount
    };
  }
  return { currentUser, nearConfig, selector };
}
console.log("[After Before has bee init]")

// @ts-ignore
window.nearInitPromise = initContract().then(
  ({ currentUser, nearConfig, selector }) => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App
          //@ts-ignore
          currentUser={currentUser}
          nearConfig={nearConfig}
          selector={selector}
        />
      </React.StrictMode>
    )
  })

