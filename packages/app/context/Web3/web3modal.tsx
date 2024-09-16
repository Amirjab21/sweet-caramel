// SPDX-License-Identifier: Apache-2.0
import Portis from '@portis/web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Authereum from 'authereum';
import { Bitski } from 'bitski';
import { RESET_WEB3_PROVIDER, SET_WEB3_PROVIDER } from 'context/actions';
import { providers } from 'ethers';
import Fortmatic from 'fortmatic';
import { useCallback, useContext, useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { store } from '../store';

export interface SetWeb3ProviderProps {
  provider: any;
  web3Provider: any;
  address: string;
  chainId: number;
}

const INFURA_ID = process.env.INFURA_ID;

const NETWORK_NAME = 'rinkeby';

function useWeb3Modal(config: any = {}) {
  const { dispatch, state } = useContext(store);
  const {
    web3Provider: { provider, address: account, web3Provider },
  } = state;
  // const [provider, setProvider] = useState<any>();
  // const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState<number>();

  let web3Modal: Web3Modal;
  if (typeof window !== 'undefined') {
    // const Torus = require('@toruslabs/torus-embed').default;

    web3Modal = new Web3Modal({
      // network: NETWORK_NAME,
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
            key: 'pk_test_2FA53E901762CC1F',
          },
        },
        authereum: {
          package: Authereum, // required
        },
        // torus: {
        //   package: Torus,
        //   options: {
        //     networkParams: {
        //       host: 'https://localhost:8545', // optional
        //       chainId: 1, // optional
        //       networkId: 1, // optional
        //     },
        //     config: {
        //       buildEnv: 'development', // optional
        //     },
        //   },
        // },
        bitski: {
          package: Bitski, // required
          options: {
            clientId: '20da1e93-1c5e-4e9e-ac8b-60e94508d90b', // required
            callbackUrl: window.location.href + 'bitski-callback.html', // required
          },
        },
      },
    });

    // web3Modal.clearCachedProvider()
  }

  // useEffect(() => {
  //   async function getRid() {
  //     // await provider.close();
  //     await web3Modal.clearCachedProvider();
  //     console.log('doneee');
  //   }
  //   // if (provider && provider.clo¿se){
  //   getRid();
  //   // }
  // }, [provider]);

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async function () {
    const provider = await web3Modal.connect();

    const web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    const network = await web3Provider.getNetwork();
    dispatch({
      type: SET_WEB3_PROVIDER,
      provider,
      web3Provider,
      web3Modal,
      address,
      chainId: network.chainId,
    });

    // await web3Modal.toggleModal();
  }, []);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      console.log('xexy', web3Provider);
      await web3Modal.clearCachedProvider();
      if (
        web3Provider?.provider?.disconnect &&
        typeof web3Provider.provider.disconnect === 'function'
      ) {
        await web3Provider.provider.disconnect();
        console.log('disconnecto');
      }
      dispatch({ type: RESET_WEB3_PROVIDER });
    },
    [web3Provider],
  );

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts);
        // dispatch({
        //   type: 'SET_ADDRESS',
        //   address: accounts[0],
        // })
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload();
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error);
        logoutOfWeb3Modal();
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, logoutOfWeb3Modal]);

  console.log(provider, account);
  return [loadWeb3Modal, logoutOfWeb3Modal];
}

export default useWeb3Modal;

// export function useWeb3ModalV2() {
//   return useContext()
// }

// export function createWeb3ModalRoot()
