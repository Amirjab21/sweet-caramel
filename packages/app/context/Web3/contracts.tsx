import { Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BasicIssuanceModule,
  BasicIssuanceModule__factory,
  BeneficiaryGovernance,
  BeneficiaryGovernance__factory,
  BeneficiaryRegistry,
  BeneficiaryRegistry__factory,
  Curve3Pool,
  Curve3Pool__factory,
  CurveMetapool,
  CurveMetapool__factory,
  ERC20,
  ERC20__factory,
  GrantElections,
  GrantElections__factory,
  HysiBatchInteraction,
  HysiBatchInteraction__factory,
  ISetToken,
  ISetToken__factory,
  RewardsManager,
  RewardsManager__factory,
  Staking,
  Staking__factory,
  UniswapV2Router02,
  UniswapV2Router02__factory,
  YearnVault,
  YearnVault__factory,
} from '../../../contracts/typechain';
import { setSingleActionModal } from '../actions';
import { store } from '../store';
import { connectors, networkMap } from './connectors';

export interface Contracts {
  staking: Staking;
  beneficiary: BeneficiaryRegistry;
  election: GrantElections;
  pop: ERC20;
  rewardsManager: RewardsManager;
  uniswap: UniswapV2Router02;
  threeCrv: ERC20;
  beneficiaryGovernance: BeneficiaryGovernance;
  hysi: ISetToken;
  batchHysi: HysiBatchInteraction;
}

export interface hysiDependencyContracts {
  basicIssuanceModule: BasicIssuanceModule;
  yDUSD: YearnVault;
  yFRAX: YearnVault;
  yUSDN: YearnVault;
  yUST: YearnVault;
  dusdMetapool: CurveMetapool;
  fraxMetapool: CurveMetapool;
  usdnMetapool: CurveMetapool;
  ustMetapool: CurveMetapool;
  triPool: Curve3Pool;
}

interface ContractsContext {
  contracts: Contracts;
  hysiDependencyContracts: hysiDependencyContracts;
  setContracts: React.Dispatch<Contracts>;
  setHysiDependencyContracts: React.Dispatch<hysiDependencyContracts>;
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
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;
  const [contracts, setContracts] = useState<Contracts>();
  const [hysiDependencyContracts, setHysiDependencyContracts] =
    useState<hysiDependencyContracts>();

  const { dispatch } = useContext(store);

  useEffect(() => {
    if (!active) {
      activate(connectors.Network);
    }
  }, [active]);

  useEffect(() => {
    if (error) {
      dispatch(
        setSingleActionModal({
          content: getErrorMessage(error),
          title: 'Wallet Error',
          visible: true,
          type: 'error',
          onConfirm: {
            label: 'Close',
            onClick: () => dispatch(setSingleActionModal(false)),
          },
        }),
      );
    }
  }, [error]);

  useEffect(() => {
    if (!library) {
      return;
    }
    setContracts({
      staking: Staking__factory.connect(process.env.ADDR_STAKING, library),
      beneficiary: BeneficiaryRegistry__factory.connect(
        process.env.ADDR_BENEFICIARY_REGISTRY,
        library,
      ),
      election: GrantElections__factory.connect(
        process.env.ADDR_GRANT_ELECTION,
        library,
      ),
      pop: ERC20__factory.connect(process.env.ADDR_POP, library),
      rewardsManager: RewardsManager__factory.connect(
        process.env.ADDR_REWARDS_MANAGER,
        library,
      ),
      uniswap: UniswapV2Router02__factory.connect(
        process.env.ADDR_UNISWAP_ROUTER,
        library,
      ),
      threeCrv: ERC20__factory.connect(process.env.ADDR_3CRV, library),
      beneficiaryGovernance: BeneficiaryGovernance__factory.connect(
        process.env.ADDR_BENEFICIARY_GOVERNANCE,
        library,
      ),
      hysi: ISetToken__factory.connect(process.env.ADDR_HYSI, library),
      batchHysi: HysiBatchInteraction__factory.connect(
        process.env.ADDR_BATCH_HYSI,
        library,
      ),
    });
    setHysiDependencyContracts({
      basicIssuanceModule: BasicIssuanceModule__factory.connect(
        process.env.ADDR_BASIC_ISSUANCE_MODULE,
        library,
      ),
      yDUSD: YearnVault__factory.connect(process.env.ADDR_YDUSD, library),
      yFRAX: YearnVault__factory.connect(process.env.ADDR_YFRAX, library),
      yUSDN: YearnVault__factory.connect(process.env.ADDR_YUSDN, library),
      yUST: YearnVault__factory.connect(process.env.ADDR_YUST, library),
      dusdMetapool: CurveMetapool__factory.connect(
        process.env.ADDR_DUSD_METAPOOL,
        library,
      ),
      fraxMetapool: CurveMetapool__factory.connect(
        process.env.ADDR_FRAX_METAPOOL,
        library,
      ),
      usdnMetapool: CurveMetapool__factory.connect(
        process.env.ADDR_USDN_METAPOOL,
        library,
      ),
      ustMetapool: CurveMetapool__factory.connect(
        process.env.ADDR_UST_METAPOOL,
        library,
      ),
      triPool: Curve3Pool__factory.connect(process.env.ADDR_TRI_POOL, library),
    });
  }, [library, active]);

  return (
    <ContractsContext.Provider
      value={{
        contracts,
        hysiDependencyContracts,
        setContracts,
        setHysiDependencyContracts,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
}
