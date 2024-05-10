/* eslint-disable @next/next/no-img-element */
import React from 'react';
import IpfsImage from '../../components/ipfsImage';
import { IEventData, IQuest } from '../../models/Event';

interface ClaimsListProps {
  qrbtnCallback: (index: number) => void;
  claimBtnCallback: (index: number, questIndex: number) => void;
  imgCallback: (index: number) => void;
  event_id: number;
  eventData: IEventData | undefined;
  quests: IQuest[];
  rewardImgs: string[];
}

const ClaimsList: React.FC<ClaimsListProps> = ({
  event_id,
  qrbtnCallback,
  claimBtnCallback,
  imgCallback,
  eventData,
  quests,
  rewardImgs,
}) => {
  const getQRCode = (event: React.MouseEvent<HTMLElement>) => {
    const value: number = parseInt((event.currentTarget as HTMLButtonElement).value, 10);
    qrbtnCallback(value);
  };
  const getClaim = (event: React.MouseEvent<HTMLElement>, index: number) => {
    const value: number = parseInt((event.currentTarget as HTMLButtonElement).value, 10);
    claimBtnCallback(value, index);
  };
  const getImg = (index: number) => {
    imgCallback(index);
  };
  const copyToClipBoard = (index: number) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const link = `/claim/${event_id}_${index}`;
    navigator.clipboard.writeText(origin + link);
  };

  return (
    <table className="text-[#3D3D3D] w-full">
      <tbody>
        {
          rewardImgs.map((rewardImg, index) => (
            <tr key={index} className="hover:text-black hover:bg-[#cbd5e173] ">
              <td>{quests[index]?.rewardTitle}</td>
              <td>{quests[index]?.rewardDescription}</td>
              <td className="px-[10px]">
                <button
                  type="button"
                  onClick={() => getImg(index)}
                  className="flex items-center hover:opacity-20 transition-opacity ease-in-out"
                >
                  {rewardImg ? (
                    <IpfsImage
                      src={rewardImg}
                      alt="reward"
                      className="mx-auto object-contain max-w-[50px]"
                    />
                  ) : (
                    <div style={{ width: 50, height: 50 }} />
                  )}
                </button>
              </td>
              {/* <td className="w-[150px]"></td>
              <td className="w-[200px]"></td>
              <td className="w-[200px]"></td> */}
              <td className="w-[150px]">
                <button
                  type="button"
                  onClick={getQRCode}
                  className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                >
                  Get QR
                </button>
              </td>
              <td className="w-[200px]">
                <button
                  onClick={(e) => getClaim(e ,index)}
                  type="button"
                  className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                >
                  Claim Reward
                </button>
              </td>
              <td className="w-[200px]">
                <button
                  onClick={() => copyToClipBoard(index)}
                  type="button"
                  className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                >
                  Copy Claim Link
                </button>
              </td>
            </tr>
          ))
        }

        {/* <tr className="hover:text-black hover:bg-[#cbd5e173] ">
          <td></td>
          <td></td>
          <td className="px-[10px]"></td>
          <td className="w-[150px]">
            <button
              type="button"
              onClick={getQRCode}
              className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
            >
              Get QR
            </button>
          </td>
          <td className="w-[200px]">
            <button
              onClick={getClaim}
              type="button"
              className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
            >
              Claim Reward
            </button>
          </td>
          <td className="w-[200px]">
            <button
              onClick={copyToClipBoard}
              type="button"
              className="flex my-4 self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
            >
              Copy Claim Link
            </button>
          </td>
        </tr> */}
      </tbody>
    </table>
  );
};

export default ClaimsList;
