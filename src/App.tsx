import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import {
  AccountPortfolioV2,
  IndexerGrpcAccountPortfolioApi,
} from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";

import { ChainId, EthereumChainId } from "@injectivelabs/ts-types";

import { WalletStrategy } from "@injectivelabs/wallet-ts";

const walletSTrategy = new WalletStrategy({
  chainId: ChainId.Mainnet,
  ethereumOptions: { ethereumChainId: EthereumChainId.Mainnet, rpcUrl: "" },
});

const endpoints = getNetworkEndpoints(Network.Mainnet);
const indexerApi = new IndexerGrpcAccountPortfolioApi(endpoints.indexer);

function App() {
  const [portfolio, setPortfolio] = useState<AccountPortfolioV2 | null>(null);

  useEffect(() => {
    indexerApi
      .fetchAccountPortfolio("inj1ecs4my7etjjt6e3c9hncfc9rljlg2v5wuua5rc")
      .then((portfolio) => {
        setPortfolio(portfolio);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">{JSON.stringify(portfolio)}</header>
    </div>
  );
}

export default App;
