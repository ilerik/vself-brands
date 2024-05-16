import React, { useState } from 'react';
import { IEventAction, IEventStats } from '../../models/Event';
import { formatTimeStampToLocaleDateString } from '../../utils';
import AnalyticsChart from './analyticsChart';
import { useContractEvent } from 'wagmi';
import { CAMINO_CHAIN_ID, CAMINO_EVENTS_CONTRACT_ADDRESS } from '../../constants/endpoints';
import eventsContractAbi from "../../abis/events-abi.json";
import { BigNumber } from 'ethers';
interface EventStatsTableProps {
  eventStats: IEventStats | undefined;
  eventActions: IEventAction[];
  // rewardsQnt: number;
}

const EventStatsTable: React.FC<EventStatsTableProps> = ({ eventStats, eventActions }) => {

  const [peventStats ,setPEventStats ] = useState<IEventStats | undefined>(eventStats);
  const [peventActions ,setPEventActions ] = useState<IEventAction[]>(eventActions);


  const unwatch = useContractEvent({
    address: CAMINO_EVENTS_CONTRACT_ADDRESS,
    abi: eventsContractAbi,
    eventName: 'Checkin',
    listener(log) {
      try {
        if (log) {
          console.log(log);
          const newActions = peventActions;
          newActions.push({
            timestamp: BigNumber.from(123),
            userAddress: (log[0] as any).args.userAddress,
            rewardIndex: (log[0] as any).args._questIndex
          })
          setPEventActions(newActions);
          const newStats = peventStats;
          if(!newStats?.participants.indexOf((log[0] as any).args.userAddress)){
            newStats?.participants.push((log[0] as any).args.userAddress);
            newStats?.totalUsers.add(1);
          }
          newStats?.totalActions.add(1);
          newStats?.totalRewards.add(1);
          setPEventStats(newStats);
          // setParticipants(current => {
          //   return [...current, (log[0] as any).args.userAddress];
          // });
          // console.log(log)
          // setIsSuccess(true);
          // setIsLoading(false);
        }
      } catch(error) {
        console.log(error)
       }

      if (log.length > 0) unwatch?.()
    },
  });

  return (
    <div className="w-full">
      <AnalyticsChart
        total_actions={Number(peventStats?.totalActions)}
        total_users={Number(peventStats?.totalUsers)}
        rewardsQnt={Number(peventStats?.totalRewards)}
        event_actions={peventActions.map(item => ({
          username: item.userAddress,
          qr_string: '',
          timestamp: Number(item.timestamp),
          reward_index: Number(item.rewardIndex),
        }))}
      />
      {/* <div className="mt-5"> */}
        {/* <h3 className="text-[20px] font-interBold mb-[20px]">Top Ambassadors</h3> */}
        {/* <table>
          <tbody>
            {topAmbassadors
              .filter((item) => item.accountId !== null)
              .sort((a, b) => parseFloat(b.count) - parseFloat(a.count))
              .map(({ accountId, count }, index) => (
                <AmbassadorRow key={index} accountId={accountId} count={count} />
              ))}
          </tbody>
        </table> */}
      {/* </div> */}
    </div>
    // <table className="w-full">
    //   <thead className="bg-[#d9d9d9b0] text-black font-interBold text-[14px]">
    //     <tr>
    //       <th className="px-4 py-2 text-left hidden sm:table-cell">Created At</th>
    //       <th className="px-4 py-2 text-center hidden sm:table-cell">Stopped At</th>
    //       <th className="px-4 py-2 text-center">Total Actions</th>
    //       <th className="px-4 py-2 text-center">Total Rewards</th>
    //       <th className="px-4 py-2 text-center">Total Users</th>
    //     </tr>
    //   </thead>
    //   {eventStats && (
    //     <tbody className="text-[#3D3D3D]">
    //       <tr>
    //         <td className="text-sm px-4 py-2 whitespace-nowrap text-center hidden sm:table-cell">
    //           {eventStats.createdAt && formatTimeStampToLocaleDateString(Number(eventStats.createdAt))}
    //         </td>
    //         <td className="text-sm px-4 py-2 whitespace-nowrap text-center hidden sm:table-cell">
    //           {
    //             eventStats.createdAt &&
    //             eventStats.stoppedAt &&
    //             eventStats.createdAt < eventStats.stoppedAt &&
    //             formatTimeStampToLocaleDateString(Number(eventStats.stoppedAt))
    //           }
    //         </td>

    //         <td className="text-center text-sm px-4 py-2 whitespace-nowrap">{Number(eventStats.totalActions)}</td>
    //         <td className="text-center text-sm px-4 py-2 whitespace-nowrap">{Number(eventStats.totalRewards)}</td>
    //         <td className="text-center text-sm px-4 py-2 whitespace-nowrap">{Number(eventStats.totalUsers)}</td>
    //       </tr>
    //       <tr>
    //         <td className="px-4 py-2 whitespace-nowrap text-sm ">
    //           <b>Participants:</b>
    //         </td>
    //         <td className="break-words text-sm px-4 py-2 whitespace-nowrap overflow-x-auto max-w-[100px] md:max-w-[300px]">
    //           {eventStats.participants && eventStats.participants.join(', ')}
    //         </td>
    //       </tr>
    //     </tbody>
    //   )}
    // </table>
  );
};

export default EventStatsTable;
