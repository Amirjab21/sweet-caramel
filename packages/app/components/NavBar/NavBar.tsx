import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { connectors } from '../../context/Web3/connectors';
import NavbarLink from './NavbarLinks';

const Navbar: React.FC = () => {
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
  const router = useRouter();
  const [showGrants, setShowGrants] = useState(false);
  const [showProposals, setShowProposals] = useState(false);

  return (
    <>
      <nav className="flex shadow-md py-3 px-14 bg-white">
        <div>
          <Link href="/" passHref>
            <a>
              <img
                src="/images/icons/popLogo.png"
                alt="Logo"
                className="w-8 h-8"
              />
            </a>
          </Link>
        </div>
        <ul className="flex flex-row items-center mx-auto space-x-16">
          <li />
          <li>
            <NavbarLink
              label="Staking"
              url="/staking"
              isActive={router.pathname === '/staking'}
            />
          </li>
          <li>
            <NavbarLink
              label="Rewards"
              url="/rewards"
              isActive={router.pathname === '/rewards'}
            />
          </li>
          <li>
            <NavbarLink
              label="White Paper"
              url="/docs/Popcorn_whitepaper_v1.pdf"
              isActive={false}
              target="_window"
            />
          </li>
        </ul>
        <button
          className="w-28 p-1 flex flex-row items-center justify-center border border-gray-400 rounded hover:bg-indigo-400 hover:text-white"
          onClick={() => activate(connectors.Injected)}
        >
          <p>Connect{account && 'ed'}</p>
          {account && (
            <div className="w-2 h-2 bg-green-400 rounded-full ml-2" />
          )}
        </button>
      </nav>
    </>
  );
};
export default Navbar;
