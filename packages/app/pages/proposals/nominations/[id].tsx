import { ProposalType } from '@popcorn/hardhat/adapters';
import ProposalPage from 'components/Proposals/ProposalPage';

export default function SingleTakedownPage(): JSX.Element {
  return <ProposalPage proposalType={ProposalType.Nomination} />;
}
