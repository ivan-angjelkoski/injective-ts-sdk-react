import React, { useEffect, useState } from "react";
import "./App.css";

import {
  AccountPortfolioV2,
  getInjectiveAddress,
  IndexerGrpcAccountPortfolioApi,
  MsgSend,
} from "@injectivelabs/sdk-ts";
import { BigNumberInBase } from "@injectivelabs/utils";
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
  const [amount, setAmount] = useState<string>("1");
  const injectiveAddress = address ? getInjectiveAddress(address) : null;

  const msg = MsgSend.fromJSON({
    dstInjectiveAddress: injectiveAddress!,
    srcInjectiveAddress: injectiveAddress!,
    amount: [
      {
        denom: "inj",
        amount: new BigNumberInBase(amount).toWei().toString(),
      },
    ],
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

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value);
  }

  return (
    <div className="container">
      <header>
        {address ? (
          <h1>Injective Wallet</h1>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>

      {address && (
        <div className="wallet-card">
          <h2>Wallet Information</h2>
          <div>
            <strong>Ethereum Address:</strong>
            <div className="address-info">{address}</div>
          </div>

          {injectiveAddress && (
            <div>
              <strong>Injective Address:</strong>
              <div className="address-info">{injectiveAddress}</div>

              <div className="amount-input-container">
                <label htmlFor="amount-input">Amount to send (INJ):</label>
                <input
                  id="amount-input"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  min="0.000001"
                  step="0.000001"
                  className="amount-input"
                />
              </div>

              <button className="send-button" onClick={send}>
                Send Transaction
              </button>
            </div>
          )}
        </div>
      )}

      {portfolio && (
        <div className="portfolio-container">
          <h2>Portfolio</h2>
          <div className="portfolio-data">
            {JSON.stringify(portfolio, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
