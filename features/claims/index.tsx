/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useReducer, useState } from 'react';
import QRCode from 'react-qr-code';
import Modal from '../../components/modal';
import { IEventData, IEventStats, IQuest } from '../../models/Event';
import { downloadQR } from '../../utils';
import ClaimForm from './claim-form';
import ClaimsList from './claims-list';
import IpfsImage from '../../components/ipfsImage';
import axios from 'axios';

interface ClaimsProps {
  eventId: number;
  eventData: IEventData | undefined;
  eventStats: IEventStats | undefined;
  quests: IQuest[];
}

interface ClaimWidgetState {
  index: number;
  qrString: string | null;
  claimString: string | null;
  imgSrc: string | null;
}

enum ClaimWidgetActionKind {
  CLOSE_MODAL = 'CLOSE_MODAL',
  OPEN_IMG_MODAL = 'OPEN_IMG_MODAL',
  OPEN_QR_MODAL = 'OPEN_QR_MODAL',
  OPEN_CLAIM_MODAL = 'OPEN_CLAIM_MODAL',
}

interface ClaimWidgetAction {
  type: ClaimWidgetActionKind;
  payload: {
    index: number,
    content: string | null,
  };
}

const initialState: ClaimWidgetState = {
  index: -1,
  qrString: null,
  claimString: null,
  imgSrc: null,
};

const claimReducer = (state: ClaimWidgetState, action: ClaimWidgetAction) => {
  switch (action.type) {
    case ClaimWidgetActionKind.CLOSE_MODAL:
      return { ...state,index: -1, qrString: null, claimString: null, imgSrc: null };
    case ClaimWidgetActionKind.OPEN_IMG_MODAL:
      return { ...state, index: action.payload.index, imgSrc: action.payload.content };
    case ClaimWidgetActionKind.OPEN_QR_MODAL:
      return { ...state, index: action.payload.index, qrString: action.payload.content };
    case ClaimWidgetActionKind.OPEN_CLAIM_MODAL:
      return { ...state, index: action.payload.index, claimString: action.payload.content };
    default:
      return state;
  }
};

const Claims: React.FC<ClaimsProps> = ({ eventId, eventData, eventStats, quests }) => {
  const [rewardImgs, setRewardImgs] = useState<string[]>([]);
  const [{index, qrString, imgSrc, claimString }, dispatch] = useReducer(claimReducer, initialState);

  const closeModal = () => {
    dispatch({
      type: ClaimWidgetActionKind.CLOSE_MODAL,
      payload: {
        index: -1,
        content: null,
      },
    });
  };

  const openImgModal = async (index: number) => {
    dispatch({
      type: ClaimWidgetActionKind.OPEN_IMG_MODAL,
      payload: {
        index: -1,
        content: String(rewardImgs[index]),
      },
    });
  };

  const openQRCodeModal = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const link = `/claim/${eventId}`;

    // const newString = 'https://t.me/vself_bot?start=' + eventId;
    const newString = origin + link;
    dispatch({
      type: ClaimWidgetActionKind.OPEN_QR_MODAL,
      payload: {
        index: -1,
        content: newString
      },
    });
  };

  const openClaimModal = (value: number, index: number) => {
    dispatch({
      type: ClaimWidgetActionKind.OPEN_CLAIM_MODAL,
      payload: {
        index,
        content: 'claiming'
      }
    });
  };

  useEffect(() => {
    if (quests.length > 0) {
      (async () => {
        const rewardImgs: string[] = [];
        console.log(quests);
        for(let i = 0; i< quests.length; i++){
          try {
            const result = (await axios.get(quests[i]?.rewardUri!)).data;
            // console.log(result)
            const imgUri = result.image;
            const rewardImg = `https://nftstorage.link/ipfs/${imgUri.split('//')[1]}`;
            rewardImgs.push(rewardImg);
          } catch (error) {
            console.log(error)
            rewardImgs.push('/ninja2.png')
          }
        }
        // await Promise.all(quests.map(async (quest) => {
        //   // console.log(quest);
        //   try {
        //     const result = (await axios.get(quest?.rewardUri!)).data;
        //     // console.log(result)
        //     const imgUri = result.image;
        //     const rewardImg = `https://nftstorage.link/ipfs/${imgUri.split('//')[1]}`;
        //     rewardImgs.push(rewardImg);
        //   } catch (error) {
        //     console.log(error)
        //     rewardImgs.push('/ninja2.png')
        //   }
        // }));

        setRewardImgs((current) => {
          return [...current, ...rewardImgs];
        });
      })();
    }
  }, [quests.length]);

  return (
    <section className="flex flex-col w-full py-[40px] mb-4 overflow-y-auto bg-white rounded-[40px]">
      <Modal isOpen={!!imgSrc} onClose={closeModal}>
        <IpfsImage src={String(imgSrc)} alt="" className="mb-4 object-contain" />
      </Modal>
      <Modal isOpen={!!qrString} onClose={closeModal}>
        <DownloadQR qrString={String(qrString)} />
      </Modal>
      <Modal isOpen={!!claimString} onClose={closeModal}>
        <ClaimForm eventId={eventId} eventStats={eventStats} index={index} isByBackendWallet = {false} />
      </Modal>
      <div className="flex flex-col w-full max-w-[1080px] mx-auto">
        <h2 className="font-drukMedium uppercase text-black text-[30px] mb-[25px]">QR Strings</h2>
        <ClaimsList
          event_id={eventId}
          eventData={eventData}
          quests={quests}
          rewardImgs={rewardImgs}
          imgCallback={openImgModal}
          qrbtnCallback={openQRCodeModal}
          claimBtnCallback={openClaimModal}
        />
      </div>
    </section>
  );
};

interface DownloadQRProps {
  qrString: string;
}

const DownloadQR: React.FC<DownloadQRProps> = ({ qrString }) => {
  const download = () => {
    downloadQR(qrString);
  };
  return (
    <div className="flex flex-col">
      <h2 className="font-drukMedium uppercase text-black text-xl mb-2">QR Code</h2>
      <QRCode id="qrcode" value={qrString} />
      <button
        className="mt-4 flex self-center px-6 py-2.5 bg-transparent border-[1px] border-[#019FFF] text-[#019FFF] hover:text-white font-medium text-xs leading-tight uppercase rounded-full hover:bg-[#019FFF] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
        onClick={download}
        type="button"
      >
        Download
      </button>
    </div>
  );
};

export default Claims;
