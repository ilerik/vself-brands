import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core';
import { IEventData } from '../../models/Event';
import { formatTimeStampToLocaleDateString } from '../../utils';
import { CAMINO_CHAIN_ID, CAMINO_EVENTS_CONTRACT_ADDRESS } from '../../constants/endpoints';
import eventsContractAbi from '../../abis/events-abi.json';

interface EventRowProps {
  event_name: string;
  total_users: number;
  start_time: number;
  finish_time: number;
  event_id: number;
}

const EventRow: React.FC<EventRowProps> = ({
  event_id,
  event_name,
  total_users,
  start_time,
  finish_time,
}) => {
  const router = useRouter();
  const eventUrl = `/event/${event_id}`;
  const navigateToEvent = () => {
    router.push(eventUrl);
  };
  const [questsLen , setQuestsLen] = useState(0);
  useEffect(() => {
    getQuestsLen();
  } , []);
  const getQuestsLen = async () => {
    try {
      const event = await readContract({
        address: CAMINO_EVENTS_CONTRACT_ADDRESS,
        abi: eventsContractAbi,
        functionName: 'getEvent',
        args: [
          event_id
        ],
        chainId: CAMINO_CHAIN_ID
      });
      console.log(event)
      setQuestsLen((event as any).quests.length);
    } catch (e) {
      console.log(e);
    }
  }



  return (
    <tr
      onClick={navigateToEvent}
      className="cursor-pointer hover:bg-[#cbd5e173] text-black transition-colors ease-in table-row"
    >
      <td className="px-4 py-2">
        <Link href={eventUrl}>{event_name}</Link>
      </td>
      <td className="px-4 py-2 text-center hidden sm:table-cell">{questsLen}</td>
      <td className="px-4 py-2 text-center hidden sm:table-cell">{total_users}</td>
      <td className="px-4 py-2 text-center hidden sm:table-cell">{formatTimeStampToLocaleDateString(start_time)}</td>
      <td className="px-4 py-2 text-center">{formatTimeStampToLocaleDateString(finish_time)}</td>
    </tr>
  );
};

interface EventTableProps {
  events: IEventData[];
}

const EventTable: React.FC<EventTableProps> = ({ events }) => {
  return (
    <table id="event-table" data-testid="event-table">
      <thead className="bg-[#d9d9d9b0] text-black">
        <tr>
          <th className=" text-sm font-interBold px-4 py-2">Event Title</th>
          <th className=" text-sm font-interBold px-4 py-2 hidden sm:table-cell">Quests</th>
          <th className=" text-sm font-interBold px-4 py-2 hidden sm:table-cell">Users</th>
          <th className=" text-sm font-interBold px-4 py-2 hidden sm:table-cell">Start Time</th>
          <th className=" text-sm font-interBold px-4 py-2 ">End Time</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event: IEventData, index: number) => (
          <EventRow
            key={String(index)}
            event_id={Number(event.eventId)}
            event_name={event.eventName}
            total_users={Number(event.totalUsers)}
            start_time={Number(event.startTime)}
            finish_time={Number(event.finishTime)}
          />
        ))}
      </tbody>
    </table>
  );
};

export default EventTable;
