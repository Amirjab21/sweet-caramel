import Portis from '@portis/web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';
import Authereum from 'authereum';
import { Bitski } from 'bitski';
import { supportedChainIds } from 'context/Web3/connectors';
import { providers } from 'ethers';
import Fortmatic from 'fortmatic';
import { disconnect } from 'process';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import warning from 'tiny-warning';
import Web3Modal from 'web3modal';
import { normalizeAccount, normalizeChainId } from './normalizers';
import { Web3ReactManagerReturn } from './types';

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad';

const providerOptions = {
  // network: NETWORK_NAME,
  disabledInjectedProvider: true,
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
        callbackUrl:
          typeof window !== 'undefined'
            ? window.location.href + 'bitski-callback.html'
            : null, // required
      },
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

  onError?: (error: Error) => void;

  error?: Error;
}

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
      const { connector, provider, chainId, account, onError } = payload;
      return { connector, provider, chainId, account, onError };
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
  // connector: AbstractConnector,
  update: any,
): Promise<ConnectorUpdate<number>> {
  const provider = update;
  const web3provider = new providers.Web3Provider(update);
  const signer = await web3provider.getSigner();
  const account = await signer.getAddress();
  const network = await web3provider.getNetwork();
  const chainId = network.chainId;
  // const [_chainId, _account] = (await Promise.all([
  //   update.chainId === undefined ? connector.getChainId() : update.chainId,
  //   update.account === undefined ? connector.getAccount() : update.account,
  // ])) as [
  //   Required<ConnectorUpdate>['chainId'],
  //   Required<ConnectorUpdate>['account'],
  // ];

  // const chainId = normalizeChainId(_chainId);
  if (!supportedChainIds.includes(chainId)) {
    throw new UnsupportedChainIdError(chainId, supportedChainIds);
  }
  // const account = _account === null ? _account : normalizeAccount(_account);

  return { provider, chainId, account };
}

export function useWeb3ReactManager(): Web3ReactManagerReturn {
  const [state, dispatch] = useReducer(reducer, {});
  const { connector, provider, chainId, account, onError, error } = state;

  let web3Modal;
  if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal(providerOptions);
  }

  const updateBusterRef = useRef(-1);
  updateBusterRef.current += 1;

  const activate = useCallback(async (): // connector: AbstractConnector,
  // onError?: (error: Error) => void,
  // throwErrors: boolean = false
  Promise<void> => {
    const updateBusterInitial = updateBusterRef.current;

    let activated = false;
    try {
      const update = await web3Modal.connect().then((update) => {
        activated = true;
        return update;
      });
      console.log('updateio');

      const augmentedUpdate = await augmentConnectorUpdate(update);

      if (updateBusterRef.current > updateBusterInitial) {
        throw new StaleConnectorError();
      }
      dispatch({
        type: ActionType.ACTIVATE_CONNECTOR,
        payload: { connector, ...augmentedUpdate, onError },
      });
    } catch (error) {
      if (error instanceof StaleConnectorError) {
        activated && connector.deactivate();
        warning(false, `Suppressed stale connector activation ${connector}`);
        // } else if (throwErrors) {
        //   activated && connector.deactivate()
        //   throw error
      } else if (onError) {
        activated && connector.deactivate();
        onError(error);
      } else {
        // we don't call activated && connector.deactivate() here because it'll be handled in the useEffect
        dispatch({
          type: ActionType.ERROR_FROM_ACTIVATION,
          payload: { connector, error },
        });
      }
    }
  }, []);

  const setError = useCallback((error: Error): void => {
    dispatch({ type: ActionType.ERROR, payload: { error } });
  }, []);

  const deactivate = useCallback(async (): Promise<void> => {
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      console.log('here', provider);
      await provider.disconnect();
    }
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR });
    await web3Modal.clearCachedProvider();
  }, [provider]);

  const handleUpdate = useCallback(
    async (update: ConnectorUpdate): Promise<void> => {
      // if (!connector) {
      //   throw Error(
      //     "This should never happen, it's just so Typescript stops complaining",
      //   );
      // }

      const updateBusterInitial = updateBusterRef.current;

      // updates are handled differently depending on whether the connector is active vs in an error state
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
          const augmentedUpdate = await augmentConnectorUpdate(
            // connector,
            update,
          );

          if (updateBusterRef.current > updateBusterInitial) {
            throw new StaleConnectorError();
          }
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
  const handleError = useCallback(
    (error: Error): void => {
      onError
        ? onError(error)
        : dispatch({ type: ActionType.ERROR, payload: { error } });
    },
    [onError],
  );
  const handleDeactivate = useCallback((): void => {
    dispatch({ type: ActionType.DEACTIVATE_CONNECTOR });
  }, []);

  // ensure that connectors which were set are deactivated
  useEffect((): (() => void) => {
    return () => {
      if (provider) {
        deactivate();
      }
    };
  }, [provider]);

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

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          // provider.removeListener('accountsChanged', handleAccountsChanged)
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
  };
}
