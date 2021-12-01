import { useWeb3React } from 'components/Web3ModalReact';
import React, { useContext } from 'react';
import { store } from '../../context/store';
import WalletConnectModal from './WalletSelectModal';

export const WalletSelectModalContainer: React.FC = () => {
  const {
    state: { walletSelectModal },
  } = useContext(store);
  const { chainId, account, activate, deactivate } = useWeb3React<any>();
  return (
    <WalletConnectModal
      visible={walletSelectModal.visible}
      title={'Connect to wallet'}
      activate={activate}
      // type={singleActionModal.type}
      onConfirm={walletSelectModal.onConfirm}
    />
  );
};
