/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/loader';
import Modal from '../../components/modal';
import { NFTStorage } from 'nft.storage';
import { useWalletSelector } from '../../contexts/WalletSelectorContext';
// import { Endpoints } from '../../constants/endpoints';
import ErrorCreateMessage from '../event-form/error-create';
import Bio from './bio';
import LinkList from './link-list';
import NftList from './nft-list';
// import { isEnvProd } from '../../utils';
import { socialContractName, socialContractMethods } from '../../utils/contract-methods';
import { getConnectedContract } from '../../utils/contract';
import { vRandaFormState } from '../../models/vRanda';

import eventsContractAbi from '../../abis/events-abi.json';
import profileContractAbi from '../../abis/profile-abi.json';
import { CAMINO_CHAIN_ID, CAMINO_EVENTS_CONTRACT_ADDRESS, PROFILE_CONTRACT_ADDRESS } from '../../constants/endpoints';
import { readContract } from '@wagmi/core';
import { useAccount } from 'wagmi';
import axios from 'axios';

// TODO: Refactor form using React Context
// https://betterprogramming.pub/react-hooks-and-forms-dedb8072763a

interface ProfileComponentProps {
  profile?: vRandaFormState;
  userAddress?: string;
  isEditing?: boolean;
  isInitialized?: boolean;
}

const initialFormState: vRandaFormState = {
  avatar_url: '',
  name: '',
  bio: '',
  avatar: '',
  file: null,
  links: {},
  nfts: [],
};



const ProfileComponent: React.FC<ProfileComponentProps> = ({
  profile = initialFormState,
  userAddress = '',
  isEditing = false,
}) => {
  const [formState, setFormState] = useState<vRandaFormState>(profile);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { selector } = useWalletSelector();

  // const { address } = useAccount();

  const initProfile = useCallback(async () => {
    console.log(initialFormState , profile)
    if (profile !== initialFormState) {
      return;
    }
    try {
      const quests = await readContract({
        address: CAMINO_EVENTS_CONTRACT_ADDRESS,
        abi: eventsContractAbi,
        functionName: 'getClaimedQuests',
        args: [
          userAddress
        ],
        chainId: CAMINO_CHAIN_ID
      }) as any;

      const userProfile = await readContract({
        address: PROFILE_CONTRACT_ADDRESS,
        abi: profileContractAbi,
        functionName: 'users',
        args: [
          userAddress
        ],
        chainId: CAMINO_CHAIN_ID
      }) as any;


      let newState = {
        avatar_url: userProfile.avatarUri,
        name: userProfile.name,
        bio: userProfile.bio,
        avatar: '',
        file: null,
        links: {},
        nfts: [] as any[],
      };
      for(let i=0; i<quests.length; i++){
        try {
          const response = await (await axios.get(quests[i].rewardUri)).data;
          newState.nfts.push({
            title: quests[i].rewardTitle,
            meta: quests[i].rewardDescription,
            url: `https://nftstorage.link/ipfs/${response.image.split('//')[1]}`
          });
        } catch (error) {
          newState.nfts.push({
            title: quests[i].rewardTitle,
            meta: quests[i].rewardDescription,
            url: `https://vself.app/ninja2.png`
          });

        }
      }
      setFormState(newState);
    } catch (error) {
      console.log('Error fetching data: ', error);
      setFormState(initialFormState);

    }
  }, [userAddress, profile]);

  // Update userAddress and profile
  useEffect(() => {
    initProfile();
  }, [userAddress, initProfile]);

  const updateForm = (fields: Partial<vRandaFormState>): void => {
    setFormState((prev) => ({ ...prev, ...fields }));
  };

  const submitVRandaForm = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    if (!userAddress) {
      throw new Error('Invalid ID');
    }
    try {
      let avatar_url = formState.avatar_url || '';
      if (formState.file) {
        if (process.env.NFT_STORAGE_API_KEY === undefined) {
          setLoading(false);
          throw new Error('NFT_STORAGE_API_KEY is not defined');
        }

        const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
        const metadata = await client.store({
          name: 'My sweet NFT',
          description: 'Just try to funge it. You can&apos;t do it.',
          image: formState.file,
        });
        avatar_url = `https://ipfs.io/ipfs/${metadata.data.image.pathname.split('//')[1]}`;
      }

      const wallet = await selector.wallet();
      const data = {
        [userAddress]: {
          vself: {
            avatar_url: String(avatar_url),
            name: String(formState.name),
            bio: String(formState.bio),
            links: Object.assign({}, formState.links),
            nfts: Object.assign({}, formState.nfts),
          },
        },
      };

      const deposit = isInitialized ? '100000000000000000000000' : '100000000000000000000000';
      await wallet.signAndSendTransaction({
        signerId: userAddress,
        receiverId: socialContractName,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'set',
              args: { data },
              gas: '100000000000000',
              deposit,
            },
          },
        ],
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setIsError(true);
      throw err;
    }
  };

  const closeModal = (): void => {
    setIsSuccess(false);
    setIsError(false);
  };
  return (
    <section
      className={`${loading ? 'grid h-screen mt-[-100px] items-center justify-center relative' : 'flex grow justify-center w-full'
        }`}
    >
      <Modal isOpen={isSuccess} onClose={closeModal}>
        <h2 className="font-drukMedium text-black mb-2">Your changes have been applied</h2>
        <p className="text-[#3D3D3D] mb-4">
          You can see your changes on your{' '}
          <a className="underline text-[#019FFF] hover:no-underline" href={`/vranda/${userAddress}`}>
            profile page
          </a>
        </p>
      </Modal>
      <Modal isOpen={isError} onClose={closeModal}>
        <ErrorCreateMessage />
      </Modal>
      {loading && (
        <div className="absolute top-[120px] left-[-50px] right-0 m-auto h-fit bg-[rgba(0,0,0,0.7)] rounded-[20px] w-[300px] p-[15px] text-white">
          <p>
            vRanda profile data is stored on NEAR blockchain using NEAR.Social protocol. To proceed, you must confirm
            the transaction.
          </p>
        </div>
      )}
      <Loader is_load={loading}>
        <form
          data-testid="profile-form"
          role="form"
          autoComplete="off"
          onSubmit={submitVRandaForm}
          name="profile-form"
          className="flex grow flex-col md:flex-row w-full max-w-[1440px] mb-[40px] relative z-10"
        >
          <section className="flex flex-col w-full md:w-[360px] bg-white rounded-[20px] shadow-[0px_0px_10px_0px_#0000001a]">
            <Bio isEditing={isEditing} updateForm={updateForm} {...formState} userAddress={String(userAddress)}/>
            {/* <LinkList links={formState.links} isEditing={isEditing} updateForm={updateForm} /> */}
          </section>

          <section className="flex flex-col rounded-[20px] w-full">
            <NftList nfts={formState.nfts} isEditing={isEditing} userAddress={userAddress} updateForm={updateForm} />
          </section>
        </form>
      </Loader>
    </section>
  );
};

export default ProfileComponent;
