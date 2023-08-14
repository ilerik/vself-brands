/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @next/next/no-img-element */
import { utils } from 'near-api-js';
import React, { useState, useEffect } from 'react';
import Loader from '../../components/loader';
import Modal from '../../components/modal';
import { AnalyticsEvents } from '../../constants/analytics-events';
import { useWalletSelector } from '../../contexts/WalletSelectorContext';
import { CollectionData } from '../../models/Event';
import { formatTimeStampToLocaleDateString } from '../../utils';
import { logFirebaseAnalyticsEvent } from '../../utils/firebase';
import { getConnectedContract } from '../../utils/contract';

interface EventCardProps {
  eventData: CollectionData | undefined;
  isOwnEvent?: boolean;
  event_id?: number;
  isActive?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ eventData, isOwnEvent, event_id, isActive }) => {
  const [isStopOpened, setIsStopOpened] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hideStopEventButton, setHideStopEventButton] = useState<boolean>(false);
  const [collectionSettings, setCollectionSettings] = useState<any>(null);
  const { selector, accountId } = useWalletSelector();
  const BOATLOAD_OF_GAS = utils.format.parseNearAmount('0.00000000003')!;

  // Fetch collecton settings
  useEffect(() => {
    const getCollectionSettings = async () => {
      try {
        const { contract } = await getConnectedContract();
        const settings = await contract.get_collection_settings({ event_id });
        setCollectionSettings(settings);
      } catch (err) {
        console.log(err);
      }
    };

    getCollectionSettings();
  }, [JSON.stringify(collectionSettings)]);

  const openStopEventModal = () => {
    setIsStopOpened(true);
  };

  const closeStopEventModal = () => {
    setIsStopOpened(false);
    setHideStopEventButton(false);
  };

  const stopEvent = async () => {
    try {
      setHideStopEventButton(true);
      setIsLoading(true);
      const wallet = await selector.wallet();
      await wallet
        .signAndSendTransaction({
          signerId: accountId!,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName: 'stop_event',
                args: {
                  event_id: Number(event_id),
                },
                gas: BOATLOAD_OF_GAS,
                deposit: utils.format.parseNearAmount('0')!,
              },
            },
          ],
        })
        .catch((err) => {
          setHideStopEventButton(false);
          throw err;
        });

      setIsSuccess(true);
      logFirebaseAnalyticsEvent(AnalyticsEvents.EVENT_STOPPED, {});
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Modal isOpen={isStopOpened} onClose={closeStopEventModal}>
        <Loader is_load={isLoading}>
          <div className="flex flex-col">
            <h2 className="font-drukBold text-[#3D3D3D] text-xl uppercase mb-2">Stop Event</h2>
            {isError && (
              <>
                <p className="font-drukMedium uppercase text-[#f24242] text-xl my-2">Error!</p>
                <p className="font-inter uppercase text-[#f24242] text-[14px]">Something Went Wrong</p>
              </>
            )}
            {isSuccess ? (
              <p className="font-interBold uppercase text-[#3D3D3D] mb-2">Event Was Successfully Stopped!</p>
            ) : (
              <p className="text-[#3D3D3D] mb-[20px]">Are you sure you want to stop this event?</p>
            )}
            {!isSuccess && (
              <button
                onClick={hideStopEventButton ? undefined : stopEvent}
                type="button"
                className="flex self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
              >
                Stop
              </button>
            )}
          </div>
        </Loader>
      </Modal>
      <div className="flex flex-col w-full max-w-[1080px] sm:flex-row sm:max-w-1/2 p-[20px] text-black relative overflow-auto ">
        <div className="flex w-full sm:w-1/3 justify-center items-center mt-2 p-[10px]">
          <img src="/ninja2.png" alt="" className="" />
        </div>
        <div className="flex w-full sm:w-2/3 sm:p-6 mb-10 items-center justify-start">
          <div className="flex flex-col">
            <h5 className="text-black text-[30px] mb-[25px] font-drukMedium">{eventData?.event_name}</h5>

            <p className="text-base mb-4 text-[#3D3D3D]">{eventData?.event_description}</p>
            <p className="text-base mb-1 text-[#3D3D3D]">
              {collectionSettings?.signin_request ? `Authorization is needed` : `Authorization isn't needed`}
            </p>
            <p className="text-base mb-1 text-[#3D3D3D]">
              {collectionSettings?.transferability ? `Token is transferable` : `Token isn't transferable`}
            </p>
            <p className="text-base mb-4 text-[#3D3D3D]">
              {collectionSettings?.limited_collection ? `Minting is limited` : `Minting isn't limited`}
            </p>
            <p className="text-base mb-4 text-[#3D3D3D]">
              Start Time: {eventData?.start_time && formatTimeStampToLocaleDateString(eventData.start_time)}
            </p>
            <p className="text-base mb-4 text-[#3D3D3D]">
              Finish Time: {eventData?.finish_time && formatTimeStampToLocaleDateString(eventData.finish_time)}
            </p>
            {isOwnEvent && isActive && !isSuccess && (
              <button
                onClick={openStopEventModal}
                type="button"
                className="flex my-4 self-start px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
              >
                Stop Event
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCard;