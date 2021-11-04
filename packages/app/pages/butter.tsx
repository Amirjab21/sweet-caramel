import { Web3Provider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';
import { bigNumberToNumber, formatAndRoundBigNumber } from '@popcorn/utils';
import { useWeb3React } from '@web3-react/core';
import BatchProcessingInfo from 'components/BatchButter/BatchProcessingInfo';
import ClaimableBatches from 'components/BatchButter/ClaimableBatches';
import MintRedeemInterface from 'components/BatchButter/MintRedeemInterface';
import Navbar from 'components/NavBar/NavBar';
import StatInfoCard from 'components/StatInfoCard';
import { ContractsContext } from 'context/Web3/contracts';
import { BigNumber, Contract, utils } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  AccountBatch,
  BatchType,
  ComponentMap,
  TimeTillBatchProcessing,
} from '../../hardhat/lib/adapters';
import ButterBatchAdapter from '../../hardhat/lib/adapters/ButterBatchAdapter';
interface HotSwapParameter {
  batchIds: String[];
  amounts: BigNumber[];
}
interface ClaimableBatches {
  balance: BigNumber;
  batches: AccountBatch[];
}

function getClaimableBalance(claimableBatches: AccountBatch[]): BigNumber {
  return claimableBatches.reduce(
    (acc: BigNumber, batch: AccountBatch) =>
      acc.add(batch.accountClaimableTokenBalance),
    BigNumber.from('0'),
  );
}

function isDepositDisabled(
  depositAmount: BigNumber,
  hysiBalance: BigNumber,
  threeCrvBalance: BigNumber,
  wait: Boolean,
  withdrawal: Boolean,
): boolean {
  const balance = withdrawal ? hysiBalance : threeCrvBalance;
  return depositAmount > balance && !wait;
}

export default function Butter(): JSX.Element {
  const context = useWeb3React<Web3Provider>();
  const { library, account, activate } = context;
  const { contracts, hysiDependencyContracts } = useContext(ContractsContext);
  const [hysiBalance, setHysiBalance] = useState<BigNumber>();
  const [threeCrvBalance, setThreeCrvBalance] = useState<BigNumber>();
  const [hysiPrice, setHysiPrice] = useState<BigNumber>();
  const [threeCrvPrice, setThreeCrvPrice] = useState<BigNumber>();
  const [depositAmount, setDepositAmount] = useState<BigNumber>(
    BigNumber.from('0'),
  );
  const [redeeming, setRedeeming] = useState<Boolean>(false);
  const [useUnclaimedDeposits, setUseUnclaimedDeposits] =
    useState<Boolean>(false);
  const [wait, setWait] = useState<Boolean>(false);
  const [butterBatchAdapter, setButterBatchAdapter] =
    useState<ButterBatchAdapter>();
  const [batches, setBatches] = useState<AccountBatch[]>();
  const [timeTillBatchProcessing, setTimeTillBatchProcessing] =
    useState<TimeTillBatchProcessing[]>();
  const [claimableBatches, setClaimableBatches] =
    useState<ClaimableBatches[]>();

  function prepareHotSwap(
    batches: AccountBatch[],
    depositAmount: BigNumber,
  ): HotSwapParameter {
    let cumulatedBatchAmounts = BigNumber.from('0');
    const batchIds: String[] = [];
    const amounts: BigNumber[] = [];
    batches.forEach((batch) => {
      if (cumulatedBatchAmounts < depositAmount) {
        const missingAmount = depositAmount.sub(cumulatedBatchAmounts);
        const amountOfBatch = batch.accountClaimableTokenBalance.gt(
          missingAmount,
        )
          ? missingAmount
          : batch.accountClaimableTokenBalance;
        cumulatedBatchAmounts = cumulatedBatchAmounts.add(amountOfBatch);
        const shareValue = batch.accountClaimableTokenBalance
          .mul(parseEther('1'))
          .div(batch.accountSuppliedTokenBalance);

        batchIds.push(batch.batchId);
        amounts.push(amountOfBatch.mul(parseEther('1')).div(shareValue));
      }
    });
    return { batchIds: batchIds, amounts: amounts };
  }

  useEffect(() => {
    if (!library || !contracts) {
      return;
    }
    setButterBatchAdapter(new ButterBatchAdapter(contracts.butterBatch));
    if (account) {
      contracts.butter.balanceOf(account).then((res) => setHysiBalance(res));
      contracts.threeCrv
        .balanceOf(account)
        .then((res) => setThreeCrvBalance(res));
    }
  }, [library, account]);

  useEffect(() => {
    if (!butterBatchAdapter) {
      return;
    }
    butterBatchAdapter
      .getHysiPrice(hysiDependencyContracts.basicIssuanceModule, {
        [hysiDependencyContracts.yDUSD.address.toLowerCase()]: {
          metaPool: hysiDependencyContracts.dusdMetapool,
          yPool: hysiDependencyContracts.yDUSD,
        },
        [hysiDependencyContracts.yFRAX.address.toLowerCase()]: {
          metaPool: hysiDependencyContracts.fraxMetapool,
          yPool: hysiDependencyContracts.yFRAX,
        },
        [hysiDependencyContracts.yUSDN.address.toLowerCase()]: {
          metaPool: hysiDependencyContracts.usdnMetapool,
          yPool: hysiDependencyContracts.yUSDN,
        },
        [hysiDependencyContracts.yUST.address.toLowerCase()]: {
          metaPool: hysiDependencyContracts.ustMetapool,
          yPool: hysiDependencyContracts.yUST,
        },
      } as ComponentMap)
      .then((res) => setHysiPrice(res));

    butterBatchAdapter
      .getThreeCrvPrice(hysiDependencyContracts.triPool)
      .then((res) => setThreeCrvPrice(res));
    butterBatchAdapter.getBatches(account).then((res) => setBatches(res));
    butterBatchAdapter
      .calcBatchTimes(library)
      .then((res) => setTimeTillBatchProcessing(res));
  }, [butterBatchAdapter]);

  useEffect(() => {
    if (!batches) {
      return;
    }
    const claimableMintBatches = batches.filter(
      (batch) => batch.batchType == BatchType.Mint && batch.claimable,
    );
    const claimableRedeemBatches = batches.filter(
      (batch) => batch.batchType == BatchType.Redeem && batch.claimable,
    );

    setClaimableBatches([
      {
        balance: getClaimableBalance(claimableMintBatches),
        batches: claimableMintBatches,
      },
      {
        balance: getClaimableBalance(claimableRedeemBatches),
        batches: claimableRedeemBatches,
      },
    ]);
  }, [batches]);

  async function hotswap(
    depositAmount: BigNumber,
    batchType: BatchType,
  ): Promise<void> {
    const hotSwapParameter = prepareHotSwap(
      claimableBatches[batchType === BatchType.Mint ? 1 : 0].batches,
      depositAmount,
    );
    toast.loading('Depositing Funds...');
    const res = await contracts.butterBatch
      .connect(library.getSigner())
      .moveUnclaimedDepositsIntoCurrentBatch(
        hotSwapParameter.batchIds as string[],
        hotSwapParameter.amounts,
        batchType === BatchType.Mint ? BatchType.Redeem : BatchType.Mint,
      )
      .then((res) => {
        res.wait().then((res) => {
          toast.dismiss();
          toast.success('Funds deposited!');
          butterBatchAdapter.getBatches(account).then((res) => setBatches(res));
        });
      })
      .catch((err) => {
        toast.dismiss();
        if (err.data === undefined) {
          toast.error('An error occured');
        } else {
          toast.error(err.data.message.split("'")[1]);
        }
      });
  }

  async function deposit(
    depositAmount: BigNumber,
    batchType: BatchType,
  ): Promise<void> {
    setWait(true);
    if (batchType === BatchType.Mint) {
      const allowance = await contracts.threeCrv.allowance(
        account,
        contracts.butterBatch.address,
      );
      if (allowance >= depositAmount) {
        toast.loading('Depositing 3CRV...');
        const res = await contracts.butterBatch
          .connect(library.getSigner())
          .depositForMint(depositAmount, account)
          .then((res) => {
            res.wait().then((res) => {
              toast.dismiss();
              toast.success('3CRV deposited!');
            });
          })
          .catch((err) => {
            toast.dismiss();
            if (err.data === undefined) {
              toast.error('An error occured');
            } else {
              toast.error(err.data.message.split("'")[1]);
            }
          });
      } else {
        approve(contracts.threeCrv);
      }
    } else {
      const allowance = await contracts.butter.allowance(
        account,
        contracts.butterBatch.address,
      );
      console.log('redeem allowance', allowance.toString());
      if (allowance >= depositAmount) {
        toast.loading('Depositing HYSI...');
        await contracts.butterBatch
          .connect(library.getSigner())
          .depositForRedeem(depositAmount)
          .then((res) => {
            res.wait().then((res) => {
              toast.dismiss();
              toast.success('HYSI deposited!');
              butterBatchAdapter
                .getBatches(account)
                .then((res) => setBatches(res));
            });
          })
          .catch((err) => {
            toast.dismiss();
            if (err.data === undefined) {
              toast.error('An error occured');
            } else {
              toast.error(err.data.message.split("'")[1]);
            }
          });
      } else {
        approve(contracts.butter);
      }
    }
    setWait(false);
  }

  async function claim(batchId: string): Promise<void> {
    toast.loading('Claiming Batch...');
    await contracts.butterBatch
      .connect(library.getSigner())
      .claim(batchId, account)
      .then((res) => {
        res.wait().then((res) => {
          toast.dismiss();
          toast.success('Batch claimed!');
        });
        butterBatchAdapter.getBatches(account).then((res) => setBatches(res));
      })
      .catch((err) => {
        toast.dismiss();
        if (err.data === undefined) {
          toast.error('An error occured');
        } else {
          toast.error(err.data.message.split("'")[1]);
        }
      });
  }

  async function withdraw(batchId: string, amount: BigNumber): Promise<void> {
    toast.loading('Withdrawing from Batch...');
    await contracts.butterBatch
      .connect(library.getSigner())
      .withdrawFromBatch(batchId, amount, account)
      .then((res) => {
        res.wait().then((res) => {
          toast.dismiss();
          toast.success('Funds withdrawn!');
        });
        butterBatchAdapter.getBatches(account).then((res) => setBatches(res));
      })
      .catch((err) => {
        toast.dismiss();
        if (err.data === undefined) {
          toast.error('An error occured');
        } else {
          toast.error(err.data.message.split("'")[1]);
        }
      });
  }

  async function approve(contract: Contract): Promise<void> {
    setWait(true);
    toast.loading('Approving Token...');
    await contract
      .connect(library.getSigner())
      .approve(contracts.butterBatch.address, utils.parseEther('100000000'))
      .then((res) => {
        res.wait().then((res) => {
          toast.dismiss();
          toast.success('Token approved!');
        });
      })
      .catch((err) => {
        toast.dismiss();
        if (err.data === undefined) {
          toast.error('An error occured');
        } else {
          toast.error(err.data.message.split("'")[1]);
        }
      });

    setWait(false);
  }

  return (
    <div className="w-full h-screen">
      <Navbar />
      <Toaster position="top-right" />
      <div className="">
        <div className="w-9/12 mx-auto flex flex-row mt-14">
          <div className="w-1/3">
            <div className="">
              <h1 className="text-3xl text-gray-800 font-medium">
                Popcorn Yield Optimizer
              </h1>
              <p className="text-lg text-gray-500">
                Deposit your stablecoins and watch your money grow
              </p>
            </div>
            <div className="mt-12">
              {butterBatchAdapter && (
                <MintRedeemInterface
                  threeCrvBalance={
                    useUnclaimedDeposits
                      ? claimableBatches[1].balance
                      : threeCrvBalance
                  }
                  threeCrvPrice={threeCrvPrice}
                  hysiBalance={
                    useUnclaimedDeposits
                      ? claimableBatches[0].balance
                      : hysiBalance
                  }
                  hysiPrice={hysiPrice}
                  redeeming={redeeming}
                  setRedeeming={setRedeeming}
                  depositAmount={depositAmount}
                  setDepositAmount={setDepositAmount}
                  deposit={useUnclaimedDeposits ? hotswap : deposit}
                  depositDisabled={
                    useUnclaimedDeposits
                      ? isDepositDisabled(
                          depositAmount,
                          claimableBatches[0].balance,
                          claimableBatches[1].balance,
                          wait,
                          redeeming,
                        )
                      : isDepositDisabled(
                          depositAmount,
                          hysiBalance,
                          threeCrvBalance,
                          wait,
                          redeeming,
                        )
                  }
                  useUnclaimedDeposits={useUnclaimedDeposits}
                  setUseUnclaimedDeposits={setUseUnclaimedDeposits}
                />
              )}
              <BatchProcessingInfo
                timeTillBatchProcessing={timeTillBatchProcessing}
              />
            </div>
          </div>
          <div className="w-2/3 mt-28">
            <div className="flex flex-row items-center">
              <div className="w-1/3 mr-2">
                <StatInfoCard
                  title="Butter Value"
                  content={`${
                    hysiPrice ? formatAndRoundBigNumber(hysiPrice) : '-'
                  } $`}
                  icon={{ icon: 'Money', color: 'bg-blue-300' }}
                />
              </div>
              <div className="w-1/3 mx-2">
                <StatInfoCard
                  title="Claimable Butter"
                  content={
                    batches
                      ? String(
                          batches
                            .filter(
                              (batch) => batch.batchType === BatchType.Mint,
                            )
                            .reduce((total, batch) => {
                              return (
                                total +
                                bigNumberToNumber(
                                  batch.accountClaimableTokenBalance,
                                )
                              );
                            }, 0),
                        )
                      : '-'
                  }
                  icon={{ icon: 'Key', color: 'bg-green-400' }}
                />
              </div>
              <div className="w-1/3 ml-2">
                <StatInfoCard
                  title="Pending Withdraw"
                  content={`${
                    batches
                      ? batches
                          .filter(
                            (batch) => batch.batchType === BatchType.Redeem,
                          )
                          .reduce((total, batch) => {
                            return (
                              total +
                              bigNumberToNumber(
                                batch.accountSuppliedTokenBalance,
                              )
                            );
                          }, 0)
                      : '-'
                  } BTR`}
                  icon={{ icon: 'Wait', color: 'bg-yellow-500' }}
                />
              </div>
            </div>
            <div className="w-full h-min-content px-12 pt-12 pb-18 mt-8 rounded-lg bg-primaryLight">
              <div className="z-10">
                <h2 className="text-2xl font-medium w-1/4">
                  We will bring the chart soon to you!
                </h2>
                <p className="text-base text-gray-700 w-1/3">
                  Currently we are developing awesome chart for you that help to
                  visualize how your HYSI growth
                </p>
              </div>
              <div className="w-full flex justify-end -mt-40">
                <img
                  src="/images/chartPlaceholder.svg"
                  alt="chartPlaceholder"
                  className="h-112"
                />
              </div>
            </div>
          </div>
        </div>

        {batches?.length > 0 && (
          <div className="mt-16">
            <h2></h2>
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <ClaimableBatches
                      batches={batches}
                      claim={claim}
                      withdraw={withdraw}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
