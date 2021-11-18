import { UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import React, { createContext, useContext, useEffect, useState } from 'react';
import getContractAddresses from '../../../hardhat/lib/utils/getContractAddresses';
import {
  ERC20,
  ERC20__factory,
  StakingRewards,
  StakingRewards__factory,
} from '../../../hardhat/typechain';
import { store } from '../store';
import { networkMap } from './connectors';
import useWeb3Modal from './web3modal';
export interface StakingContracts {
  pop: StakingRewards;
  popEthLp: StakingRewards;
  butter: StakingRewards;
}
export interface Contracts {
  pop: ERC20;
  threeCrv: ERC20;
  popEthLp: ERC20;
  butter: ERC20;
  staking: StakingContracts;
}

interface ContractsContext {
  contracts: Contracts;
  setContracts: React.Dispatch<Contracts>;
}

export const ContractsContext = createContext<ContractsContext>(null);

interface ContractsWrapperProps {
  children: React.ReactNode;
}

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return `You're connected to an unsupported network. Please connect to ${
      networkMap[Number(process.env.CHAIN_ID)]
    }.`;
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

export default function ContractsWrapper({
  children,
}: ContractsWrapperProps): JSX.Element {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal, account] = useWeb3Modal();
  const [contracts, setContracts] = useState<Contracts>();
  const { dispatch } = useContext(store);

  // useEffect(() => {
  //   if (!account) {
  //     loadWeb3Modal();
  //   }
  // }, [account]);

  // useEffect(() => {
  //   if (error) {
  //     dispatch(
  //       setSingleActionModal({
  //         content: getErrorMessage(error),
  //         title: 'Wallet Error',
  //         visible: true,
  //         type: 'error',
  //         onConfirm: {
  //           label: 'Close',
  //           onClick: () => dispatch(setSingleActionModal(false)),
  //         },
  //       }),
  //     );
  //   }
  // }, [error]);

  useEffect(() => {
    if (!provider) {
      return;
    }
    const addresses = getContractAddresses();
    setContracts({
      pop: ERC20__factory.connect(
        addresses.POP[networkMap[process.env.CHAIN_ID]],
        provider,
      ),
      threeCrv: ERC20__factory.connect(
        addresses.THREE_CRV[networkMap[process.env.CHAIN_ID]],
        provider,
      ),
      popEthLp: ERC20__factory.connect(
        addresses.POP_ETH_LP[networkMap[process.env.CHAIN_ID]],
        provider,
      ),
      butter: ERC20__factory.connect(
        addresses.BUTTER[networkMap[process.env.CHAIN_ID]],
        provider,
      ),
      staking: {
        pop: StakingRewards__factory.connect(
          addresses.STAKE_POP[networkMap[process.env.CHAIN_ID]],
          provider,
        ),
        popEthLp: StakingRewards__factory.connect(
          addresses.STAKE_POP_ETH_LP[networkMap[process.env.CHAIN_ID]],
          provider,
        ),
        butter: StakingRewards__factory.connect(
          addresses.STAKE_BUTTER[networkMap[process.env.CHAIN_ID]],
          provider,
        ),
      },
    });
  }, [provider, account]);

  return (
    <ContractsContext.Provider
      value={{
        contracts,
        setContracts,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
}
