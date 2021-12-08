import Portis from '@portis/web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { AbstractConnector } from '@web3-react/abstract-connector';
import Authereum from 'authereum';
import { Bitski } from 'bitski';
import { supportedChainIds } from 'context/Web3/connectors';
import { providers } from 'ethers';
import Fortmatic from 'fortmatic';
import { disconnect } from 'process';
import { useCallback, useEffect, useReducer } from 'react';
import warning from 'tiny-warning';
import Web3Modal from 'web3modal';
import { normalizeAccount, normalizeChainId } from './normalizers';
import { ConnectorUpdate, Web3ReactManagerReturn } from './types';

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad';

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
  bitski: {
    package: Bitski, // required
    options: {
      clientId: '20da1e93-1c5e-4e9e-ac8b-60e94508d90b', // required
      callbackUrl:
        typeof window !== 'undefined'
          ? window.location.href + 'bitski-callback.html'
          : null, // required
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
  if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
      providerOptions,
      disableInjectedProvider: false,
      cacheProvider: false,
    });
  }

  const activate = useCallback(
    async (onError?: (error: Error) => void): Promise<void> => {
      const handleError = async () => {
        await web3Modal.toggleModal();
        if (onError && typeof onError === 'function') {
          return onError(defaultErrorMessage);
        }
      };
      web3Modal.onError = handleError;

      if (web3Modal.userOptions && web3Modal.userOptions.length === 1) {
        web3Modal = new Web3Modal({
          providerOptions,
          disableInjectedProvider: false,
          cacheProvider: false,
        });
      }

      if (provider) {
        web3Modal.resetState();
      }

      try {
        await web3Modal.clearCachedProvider();
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
    // setTimeout(() => {
    //   window.location.reload();
    // }, 1);
  }, [provider, web3Provider, web3Modal]);

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
  //       alert('fuck')
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
  };
}
