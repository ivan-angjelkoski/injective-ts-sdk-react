import React, { useEffect, useState } from "react";
import "./App.css";

import {
  AccountPortfolioV2,
  getInjectiveAddress,
  IndexerGrpcAccountPortfolioApi,
  MsgSend,
} from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";

import { ChainId, EthereumChainId } from "@injectivelabs/ts-types";

import { MsgBroadcaster, WalletStrategy } from "@injectivelabs/wallet-ts";

const walletStrategy = new WalletStrategy({
  chainId: ChainId.Mainnet,
  ethereumOptions: { ethereumChainId: EthereumChainId.Mainnet, rpcUrl: "" },
});

// walletStrategy.setWallet(Wallet.Keplr); Note that if we use keplr, it returns then injective address, not the ethereum address.

const endpoints = getNetworkEndpoints(Network.Mainnet);
const indexerApi = new IndexerGrpcAccountPortfolioApi(endpoints.indexer);

const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  network: Network.Mainnet,
  endpoints,
  ethereumChainId: EthereumChainId.Mainnet,
  chainId: ChainId.Mainnet,
});

function App() {
  const [portfolio, setPortfolio] = useState<AccountPortfolioV2 | null>(null);

  const [address, setAddress] = useState<string | null>(null);
  const injectiveAddress = address ? getInjectiveAddress(address) : null;

  const msg = MsgSend.fromJSON({
    dstInjectiveAddress: injectiveAddress!,
    srcInjectiveAddress: injectiveAddress!,
    amount: [{ denom: "inj", amount: "100000000" }],
  });

  useEffect(() => {
    if (!injectiveAddress) {
      return;
    }

    indexerApi.fetchAccountPortfolio(injectiveAddress).then((portfolio) => {
      setPortfolio(portfolio);
    });
  }, [address, injectiveAddress]);

  function connectWallet() {
    walletStrategy.getAddresses().then((addresses) => {
      setAddress(addresses[0]);
    });
  }

  function send() {
    if (!injectiveAddress || !address) {
      return;
    }

    msgBroadcaster
      .broadcastV2({
        msgs: [msg],
        address: injectiveAddress,
        ethereumAddress: address,
        injectiveAddress: injectiveAddress,
      })
      .then((txHash) => {
        console.log(txHash);
      });
  }

  return (
    <div>
      <header>
        {address ? (
          <h1>Connected to {address}</h1>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>

      {injectiveAddress && (
        <div>
          <h2>Injective Address: {injectiveAddress}</h2>
        </div>
      )}

      <button onClick={send}>Send</button>

      {portfolio && (
        <div>
          <h2>Portfolio: {JSON.stringify(portfolio)}</h2>
        </div>
      )}
    </div>
  );
}

export default App;
