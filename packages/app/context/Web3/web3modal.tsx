// SPDX-License-Identifier: Apache-2.0
import { Web3Provider } from '@ethersproject/providers';
import Portis from '@portis/web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Authereum from 'authereum';
import { Bitski } from 'bitski';
import Fortmatic from 'fortmatic';
import { useCallback, useState } from 'react';
import Web3Modal from 'web3modal';

const INFURA_ID = process.env.INFURA_ID;

const NETWORK_NAME = 'mainnet';

function useWeb3Modal(config: any = {}) {
  const [provider, setProvider] = useState<any>();
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState<number>();

  let web3Modal: Web3Modal;
  if (typeof window !== 'undefined') {
    const Torus = require('@toruslabs/torus-embed').default;

    web3Modal = new Web3Modal({
      network: NETWORK_NAME,
      // disabledInjectedProvider: false,
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            bridge: 'https://polygon.bridge.walletconnect.org',
            infuraId: INFURA_ID,
            rpc: {
              1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
              42: `https://kovan.infura.io/v3/${INFURA_ID}`,
              100: 'https://dai.poa.network', // xDai
            },
          },
        },
        portis: {
          display: {
            logo: 'https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png',
            name: 'Portis',
            description: 'Connect to Portis App',
          },
          package: Portis,
          options: {
            id: 'e9dded09-79d3-4ae3-a659-761a51c95f9c',
          },
        },
        fortmatic: {
          package: Fortmatic, // required
          options: {
            key: 'pk_live_97D6F04B0DB13919',
          },
        },
        authereum: {
          package: Authereum, // required
        },
        torus: {
          package: Torus,
          options: {
            networkParams: {
              host: 'https://localhost:8545', // optional
              chainId: 1, // optional
              networkId: 1, // optional
            },
            config: {
              buildEnv: 'development', // optional
            },
          },
        },
        bitski: {
          package: Bitski, // required
          options: {
            clientId: '20da1e93-1c5e-4e9e-ac8b-60e94508d90b', // required
            callbackUrl: window.location.href + 'bitski-callback.html', // required
          },
        },
      },
    });
  }

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    setProvider(new Web3Provider(newProvider));
    setAccount(newProvider.selectedAddress);
    setChainId(newProvider.networkVersion);

    newProvider.on('chainChanged', (chainId) => {
      setChainId(chainId);
      setProvider(new Web3Provider(newProvider));
    });

    newProvider.on('accountChanged', () => {
      setProvider(new Web3Provider(newProvider));
    });
  }, [web3Modal, account, setProvider]);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      setAccount('');
      await web3Modal.clearCachedProvider();
      if (
        provider &&
        provider.provider &&
        typeof provider.provider.disconnect == 'function'
      ) {
        await provider.provider.disconnect();
      }
      window.location.reload();
    },
    [web3Modal],
  );
  console.log(provider, account);
  return [provider, loadWeb3Modal, logoutOfWeb3Modal, account, chainId];
}

export default useWeb3Modal;
