import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';

export interface Web3ReactManagerFunctions {
  activate: (
    onError?: (error: Error) => void,
    throwErrors?: boolean,
  ) => Promise<void>;
  setError: (error: Error) => void;
  deactivate: () => void;
}

export interface Web3ReactManagerReturn extends Web3ReactManagerFunctions {
  connector?: AbstractConnector;
  provider?: any;
  chainId?: number;
  account?: null | string;
  web3Provider?: Web3Provider;

  error?: Error;
}

export interface Web3ReactContextInterface<T = any>
  extends Web3ReactManagerFunctions {
  connector?: AbstractConnector;
  library?: T;
  chainId?: number;
  account?: null | string;
  provider?: Web3Provider;
  web3Provider?: Web3Provider;

  active: boolean;
  error?: Error;
}

export interface ConnectorUpdate<T = number | string> {
  provider?: any;
  chainId?: T;
  account?: null | string;
  web3Provider?: any;
}
