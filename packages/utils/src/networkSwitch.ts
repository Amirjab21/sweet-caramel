import { setSingleActionModal } from '../../app/context/actions';
declare global {
  interface Window {
    ethereum: any;
  }
}

export const connectToEthereumMainnet = async () => {
  await window.ethereum?.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x1' }],
  });
};
export const connectToEthereumRinkeby = async () => {
  await window.ethereum?.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x4' }],
  });
};

export const connectToMaticMainnet = async () => {
  await window.ethereum?.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0x89',
        rpcUrls: ['https://rpc-mainnet.matic.network'],
        chainName: 'Matic(Polygon) Mainnet',
        nativeCurrency: {
          name: 'Matic',
          symbol: 'MATIC',
          decimals: 18,
        },
        blockExplorerUrls: ['https://polygonscan.com'],
      },
    ],
  });
};
export const connectToMaticMumbai = async () => {
  await window.ethereum?.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0x13881',
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
        chainName: 'Matic Mumbai',
        nativeCurrency: {
          name: 'Matic',
          symbol: 'MATIC',
          decimals: 18,
        },
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
      },
    ],
  });
};
export const connectToArbitrum = async () => {
  await window.ethereum?.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0xA4B1',
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        chainName: 'Arbitrum One',
        nativeCurrency: {
          name: 'AETH',
          symbol: 'AETH',
          decimals: 18,
        },
        blockExplorerUrls: ['https://arbiscan.io'],
      },
    ],
  });
};
export const switchNetwork = (
  chainId: number,
  provider: any,
  dispatch: React.Dispatch<any>,
  activate: any,
) => {
  // if (!provider) {
  //   return activate();
  // }
  // if (provider.isMetaMask) {
  //   changeNetworkMetamask(chainId);
  // }
  // if (provider.wc) {
  //   dispatch(
  //       setSingleActionModal({
  //         title: 'You must change network on your wallet app',
  //         content: 'app',
  //         visible: true,
  //         onConfirm: {
  //           label: 'OK',
  //           onClick: () => dispatch(setSingleActionModal(false)),
  //         },
  //       }),
  //     );
  // }
  // if (provider)
};

export const getChainLogo = (chainId: number) => {
  switch (chainId) {
    case 1:
      return '/images/icons/ethLogo.png';
    case 4:
      return '/images/icons/ethLogo.png';
    case 137:
      return '/images/icons/polygonLogo.png';
    case 80001:
      return '/images/icons/polygonLogo.png';
    case 42161:
      return '/images/icons/arbLogo.png';
  }
};

export function changeNetworkMetamask(chainId: number) {
  try {
    switch (chainId) {
      case 1:
        connectToEthereumMainnet();
        break;
      case 4:
        connectToEthereumRinkeby();
        break;
      case 137:
        connectToMaticMainnet();
        break;
      case 42161:
        connectToArbitrum();
        break;
    }
  } catch (e) {
    console.error('Error while changing network', e);
  }
}
