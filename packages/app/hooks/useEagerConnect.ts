import { useWeb3React } from 'components/Web3ModalReact';
import { connectors } from 'context/Web3/connectors';
import { useEffect, useState } from 'react';

export default function useEagerConnect() {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    async function handleEagerConnect() {
      const eagerConnect = localStorage.getItem('eager_connect');

      const isAuthorized = await connectors.Injected.isAuthorized();
      if (isAuthorized && eagerConnect === 'true') {
        activate().catch(() => {
          setTried(true);
        });
      } else {
        activate().catch(() => {
          setTried(true);
        });
      }
    }

    handleEagerConnect();
  }, []); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}
