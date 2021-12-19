import Portis from '@portis/web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { Bitski } from 'bitski';
import { supportedChainIds } from 'context/Web3/connectors';
import { providers } from 'ethers';
import Fortmatic from 'fortmatic';
import { disconnect } from 'process';
import { useCallback, useEffect, useReducer } from 'react';
import warning from 'tiny-warning';
import Web3Modal from 'web3modal';
import { changeNetworkMetamask } from '../../../utils/src/networkSwitch';
import { normalizeAccount, normalizeChainId } from './normalizers';
import { ConnectorUpdate, Web3ReactManagerReturn } from './types';

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad';
const FORTMATIC_KEY = 'pk_test_2FA53E901762CC1F';
const FORTMATIC_PRODUCTION_KEY = 'pk_live_97D6F04B0DB13919';

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      bridge: 'https://polygon.bridge.walletconnect.org',
      infuraId: INFURA_ID,
      rpc: {
        1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
        42: `https://kovan.infura.io/v3/${INFURA_ID}`,
        100: 'https://dai.poa.network', // xDai
        137: 'https://api.mtpelerin.com/rpc/matic_mainnet',
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
      key: FORTMATIC_PRODUCTION_KEY,
    },
  },
  // authereum: {
  //   package: Authereum, // required
  // },
  bitski: {
    package: Bitski, // required
    options: {
      clientId: 'f38e2e8a-a742-43bb-a2d3-571af0f021ee', // required
      callbackUrl:
        'https://deploy-preview-40--sweet-caramel.netlify.app/callback',
      extraProviderOptions: {
        network: {
          rpcUrl: 'https://api.bitski.com/v1/web3/mainnet',
          chainId: 1,
        },
      },
      // required
    },
  },
};

class StaleConnectorError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}

export class UnsupportedChainIdError extends Error {
  public constructor(
    unsupportedChainId: number,
    supportedChainIds?: readonly number[],
  ) {
    super();
    this.name = this.constructor.name;
    this.message = `Unsupported chain id: ${unsupportedChainId}. Supported chain ids are: ${supportedChainIds}.`;
  }
}

interface Web3ReactManagerState {
  connector?: AbstractConnector;
  provider?: any;
  chainId?: number;
  account?: null | string;
  web3Provider?: any;

  onError?: (error: Error) => void;

  error?: Error;
}

const defaultErrorMessage = {
  name: 'Default',
  message: 'Connected to wallet failed.',
};

enum ActionType {
  ACTIVATE_CONNECTOR,
  UPDATE,
  UPDATE_FROM_ERROR,
  ERROR,
  ERROR_FROM_ACTIVATION,
  DEACTIVATE_CONNECTOR,
  SWITCH_NETWORK,
  SWITCH_NETWORK_ERROR,
}

interface Action {
  type: ActionType;
  payload?: any;
}

function reducer(
  state: Web3ReactManagerState,
  { type, payload }: Action,
): Web3ReactManagerState {
  switch (type) {
    case ActionType.ACTIVATE_CONNECTOR: {
      const { connector, provider, chainId, account, onError, web3Provider } =
        payload;
      return { connector, provider, chainId, account, onError, web3Provider };
    }
    case ActionType.UPDATE: {
      const { provider, chainId, account } = payload;
      return {
        ...state,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account }),
      };
    }
    case ActionType.UPDATE_FROM_ERROR: {
      const { provider, chainId, account } = payload;
      return {
        ...state,
        ...(provider === undefined ? {} : { provider }),
        ...(chainId === undefined ? {} : { chainId }),
        ...(account === undefined ? {} : { account }),
        error: undefined,
      };
    }
    case ActionType.SWITCH_NETWORK: {
      return {
        ...state,
        ...payload,
      };
    }
    case ActionType.SWITCH_NETWORK_ERROR: {
      return {
        ...state,
        ...payload,
      };
    }
    case ActionType.ERROR: {
      const { error } = payload;
      const { connector, onError } = state;
      return {
        connector,
        error,
        onError,
      };
    }
    case ActionType.ERROR_FROM_ACTIVATION: {
      const { connector, error } = payload;
      return {
        connector,
        error,
      };
    }
    case ActionType.DEACTIVATE_CONNECTOR: {
      return {};
    }
  }
}

async function augmentConnectorUpdate(
  update: any,
): Promise<ConnectorUpdate<number>> {
  const provider = update;
  const web3Provider = new providers.Web3Provider(update);
  const signer = await web3Provider.getSigner();
  const account = await signer.getAddress();
  const network = await web3Provider.getNetwork();
  const chainId = network.chainId;

  if (!supportedChainIds.includes(chainId)) {
    throw new UnsupportedChainIdError(chainId, supportedChainIds);
  }

  return { provider, chainId, account, web3Provider };
}

export function useWeb3ReactManager(): Web3ReactManagerReturn {
  const [state, dispatch] = useReducer(reducer, {});
  const {
    connector,
    provider,
    chainId,
    account,
    // onError,
    error,
    web3Provider,
  } = state;
  const onError = (error) => console.log(error);

  let web3Modal;
  // if (typeof window !== 'undefined') {

  //   web3Modal = new Web3Modal({
  //     providerOptions,
  //     disableInjectedProvider: false,
  //     cacheProvider: false,
  //   });
  // }

  const activate = useCallback(
    async (onError?: (error: Error) => void): Promise<void> => {
      const Torus = (await import('@toruslabs/torus-embed')).default;

      providerOptions['torus'] = {
        package: Torus,
        options: {
          networkParams: { host: 'mainnet' },
        },
      };
      providerOptions['bitski'].options.callbackUrl =
        window.location.origin + '/callback';

      web3Modal = new Web3Modal({
        providerOptions,
        disableInjectedProvider: false,
        cacheProvider: false,
      });

      const handleError = async () => {
        await web3Modal.toggleModal();
        if (onError && typeof onError === 'function') {
          return onError(defaultErrorMessage);
        }
      };
      web3Modal.onError = handleError;

      try {
        let update = await web3Modal.connect();

        if (!update) {
          throw new Error('failed');
        }

        const augmentedUpdate = await augmentConnectorUpdate(update);
        dispatch({
          type: ActionType.ACTIVATE_CONNECTOR,
          payload: { connector, ...augmentedUpdate, onError },
        });
      } catch (error) {
        console.log(error, 'error');
        if (!error) {
          onError({ message: 'unknown error', name: 'unknown' });
          return;
        }
        if (error.includes('closed by user')) {
          return;
        }
        onError(error);
        dispatch({
          type: ActionType.ERROR_FROM_ACTIVATION,
          payload: { connector, error },
        });
      }
    },
    [web3Modal, provider, web3Provider, error],
  );

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } });
  }, []);

  const deactivate = useCallback(async (): Promise<void> => {
    if (provider.wc) {
      await provider.close();
      dispatch({ type: ActionType.DEACTIVATE_CONNECTOR });
      setTimeout(() => {
        window.location.reload();
      }, 1);
      return;
    }
    await web3Modal.clearCachedProvider();
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      await provider.disconnect();
    }
    if (
      web3Provider &&
      web3Provider.provider &&
      typeof web3Provider.provider.disconnect == 'function'
    ) {
      await web3Provider.provider.disconnect();
    }
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR });
    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, [provider, web3Provider, web3Modal]);

  const changeNetwork = useCallback(
    async (network: number) => {
      if (!provider) {
        return activate();
      }

      if (provider.wc) {
        deactivate();
        dispatch({
          type: ActionType.ERROR,
          payload: {
            error: {
              name: 'WalletConnect Switch',
              message:
                'You need to change the wallet on your Wallet Connect app',
            },
          },
        });
        onError({
          name: 'WalletConnect Switch',
          message: 'You need to change the wallet on your Wallet Connect app',
        });
        return;
      }

      if (provider.isMetaMask) {
        changeNetworkMetamask(network);
      }
      if (
        provider.apiBaseUrl &&
        provider.apiBaseUrl === 'https://api.bitski.com/v1'
      ) {
        let networkOpts;
        switch (network) {
          case 137:
            networkOpts = {
              rpcUrl: 'https://api.bitski.com/v1/web3/polygon',
              chainId: 137,
            };
            break;
          case 4:
            networkOpts = 'rinkeby';
            break;
          case 1:
            networkOpts = 'mainnet';
            break;
          default:
            dispatch({
              type: ActionType.ERROR,
              payload: {
                error: {
                  name: 'Could not switch to this network',
                  message: 'This network may be unavailable on your wallet.',
                },
              },
            });
            onError({
              name: 'Could not switch to this network',
              message: 'This network may be unavailable on your wallet.',
            });
            break;
        }

        providerOptions.bitski.options['extraProviderOptions'] = {
          network: networkOpts,
        };

        web3Modal = new Web3Modal({
          providerOptions,
          cacheProvider: false,
          disableInjectedProvider: false,
        });
        const update = await web3Modal.connectTo('bitski');
        const updatedThings = await augmentConnectorUpdate(update);
        dispatch({
          type: ActionType.SWITCH_NETWORK,
          payload: { ...updatedThings },
        });
      }

      if (provider.torus) {
        const Torus = (await import('@toruslabs/torus-embed')).default;
        let networkParams;
        switch (network) {
          case 137:
            networkParams = { host: 'matic' };
            break;
          case 4:
            networkParams = { host: 'rinkeby' };
            break;
          case 1:
            networkParams = { host: 'mainnet' };
            break;
          default:
            dispatch({
              type: ActionType.ERROR,
              payload: {
                error: {
                  name: 'Could not switch to this network',
                  message: 'This network may be unavailable on your wallet.',
                },
              },
            });
            onError({
              name: 'Could not switch to this network',
              message: 'This network may be unavailable on your wallet.',
            });
            break;
        }

        providerOptions['torus'] = {
          package: Torus,
          options: {
            networkParams: networkParams,
          },
        };

        web3Modal = new Web3Modal({
          providerOptions,
          cacheProvider: false,
          disableInjectedProvider: false,
        });
        const update = await web3Modal.connectTo('torus');
        const updatedConnector = await augmentConnectorUpdate(update);
        dispatch({
          type: ActionType.SWITCH_NETWORK,
          payload: { ...updatedConnector },
        });
      }

      if (provider.isFortmatic) {
        let customNodeOptions: any;
        let fortmaticKey;
        switch (network) {
          case 137:
            customNodeOptions = {
              rpcUrl: 'https://testnet2.matic.network', // your own node url
              chainId: 137, // chainId of your own node}
            };
            fortmaticKey = FORTMATIC_KEY;
            break;
          case 4:
            customNodeOptions = 'rinkeby';
            fortmaticKey = FORTMATIC_KEY;
            break;
          case 1:
            customNodeOptions = null;
            fortmaticKey = FORTMATIC_PRODUCTION_KEY;
            break;
          default:
            dispatch({
              type: ActionType.ERROR,
              payload: {
                error: {
                  name: 'Could not switch to this network',
                  message: 'This network may be unavailable on your wallet.',
                },
              },
            });
            onError({
              name: 'Could not switch to this network',
              message: 'This network may be unavailable on your wallet.',
            });
            break;
        }

        web3Modal = new Web3Modal({
          providerOptions: {
            ...providerOptions,
            fortmatic: {
              package: Fortmatic, // required
              options: {
                key: fortmaticKey,
                network: customNodeOptions,
              },
            },
          },
          cacheProvider: false,
          disableInjectedProvider: false,
        });
        const update = await web3Modal.connectTo('fortmatic');
        const updatedThings = await augmentConnectorUpdate(update);
        dispatch({
          type: ActionType.SWITCH_NETWORK,
          payload: { ...updatedThings },
        });
      }

      if (provider.isPortis) {
        let networkSelected;
        switch (network) {
          case 137:
            networkSelected = 'matic';
            break;
          case 4:
            networkSelected = 'rinkeby';
            break;
          case 1:
            networkSelected = 'mainnet';
            break;
          default:
            dispatch({
              type: ActionType.ERROR,
              payload: {
                error: {
                  name: 'Could not switch to this network',
                  message: 'This network may be unavailable on your wallet.',
                },
              },
            });
            onError({
              name: 'Could not switch to this network',
              message: 'This network may be unavailable on your wallet.',
            });
            break;
        }
        web3Modal = new Web3Modal({
          providerOptions: {
            ...providerOptions,
            portis: {
              display: {
                logo: 'https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png',
                name: 'Portis',
                description: 'Connect to Portis App',
              },
              package: Portis,
              options: {
                id: 'e9dded09-79d3-4ae3-a659-761a51c95f9c',
                network: networkSelected,
              },
            },
          },
        });

        const update = await web3Modal.connectTo('portis');
        const updatedThings = await augmentConnectorUpdate(update);
        dispatch({
          type: ActionType.SWITCH_NETWORK,
          payload: { ...updatedThings },
        });
      }
    },
    [provider, web3Modal, web3Provider],
  );

  const handleUpdate = useCallback(
    async (update: ConnectorUpdate): Promise<void> => {
      if (!error) {
        const chainId =
          update.chainId === undefined
            ? undefined
            : normalizeChainId(update.chainId);
        if (
          chainId !== undefined &&
          !!supportedChainIds &&
          !supportedChainIds.includes(chainId)
        ) {
          const error = new UnsupportedChainIdError(chainId, supportedChainIds);
          onError
            ? onError(error)
            : dispatch({ type: ActionType.ERROR, payload: { error } });
        } else {
          const account =
            typeof update.account === 'string'
              ? normalizeAccount(update.account)
              : update.account;
          dispatch({
            type: ActionType.UPDATE,
            payload: { provider: update.provider, chainId, account },
          });
        }
      } else {
        try {
          const augmentedUpdate = await augmentConnectorUpdate(update);
          dispatch({
            type: ActionType.UPDATE_FROM_ERROR,
            payload: augmentedUpdate,
          });
        } catch (error) {
          if (error instanceof StaleConnectorError) {
            warning(
              false,
              `Suppressed stale connector update from error state ${connector} ${update}`,
            );
          } else {
            // though we don't have to, we're re-circulating the new error
            onError
              ? onError(error)
              : dispatch({ type: ActionType.ERROR, payload: { error } });
          }
        }
      }
    },
    [provider, error, onError],
  );

  const handleDeactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR });
  }, []);

  // ensure that connectors which were set are deactivated
  // useEffect((): (() => void) => {
  //   return () => {
  //     if (provider) {
  //       deactivate();
  //     }
  //   };
  // }, [provider]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts);
        dispatch({
          type: ActionType.UPDATE,
          payload: {
            address: accounts[0],
          },
        });
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        handleUpdate(provider);
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log('disconnect', error);
        deactivate();
      };
      provider.on('connect', () => console.log('ok'));
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);
      provider.on('error', () => console.log('okedokes'));

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, disconnect, handleUpdate, handleDeactivate]);

  return {
    connector,
    provider,
    chainId,
    account,
    activate,
    setError,
    deactivate,
    error,
    web3Provider,
    changeNetwork,
  };
}
