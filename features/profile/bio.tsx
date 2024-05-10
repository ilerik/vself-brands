import React, { useEffect, useState } from 'react';
import { writeContract, readContract } from '@wagmi/core';
import ActiveLink from '../../components/active-link';
import UploadImageButton from '../../components/uploadImageButton';
import { vRandaFormState } from '../../models/vRanda';
import ChainLink from '../../components/icons/ChainLink';
import { CAMINO_CHAIN_ID, PROFILE_CONTRACT_ADDRESS } from '../../constants/endpoints';
import profileContractAbi from "../../abis/profile-abi.json";
import { useContractEvent } from 'wagmi';
import { resizeFile, uploadMetadataToIPFS } from '../../utils';
import axios from 'axios';

type BioProps = Partial<vRandaFormState> & {
  isEditing?: boolean;
  userAddress?: string;
  updateForm: (fields: Partial<vRandaFormState>) => void;
};

const Bio: React.FC<BioProps> = ({ isEditing, /*name, bio, avatar_url,*/ userAddress, updateForm }) => {

  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      const userProfile = await readContract({
        address: PROFILE_CONTRACT_ADDRESS,
        abi: profileContractAbi,
        functionName: 'users',
        args: [
          userAddress
        ],
        chainId: CAMINO_CHAIN_ID
      });
      setName((userProfile as any)[0]);
      setBio((userProfile as any)[1]);
      setAvatarUrl((userProfile as any)[2]);
    })();
  }, []);


  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    // const key = e.currentTarget.name;
    // updateForm({ [key]: value });
    setName(value);
  };

  const handleTextareaChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const value = (event.target as HTMLElement).innerText;
    // updateForm({ bio: value });
    setBio(value);
  };

  const handleImgChange = async (file: File | null) => {
    console.log(file)
    setAvatar(file);
    // if(file){
    //   const resizedFile = await resizeFile(file);
    //   const meatadataUri = await uploadMetadataToIPFS(name?name:'', bio?bio:'', resizedFile);
    //   console.log(meatadataUri);
    //   try {
    //     const result = (await axios.get(meatadataUri)).data;
    //     // console.log(result)
    //     const imgUri = result.image;
    //     const rewardImg = `https://nftstorage.link/ipfs/${imgUri.split('//')[1]}`;
    //     console.log(rewardImg)
    //     // updateForm({ file: file, avatar_url: rewardImg });
    //     setAvatarUrl(rewardImg);
    //   } catch (error) {
    //     setAvatarUrl(`https://vself.app/ninja2.png`);
    //     // updateForm({ file: file, avatar_url: `https://vself.app/ninja2.png` });
    //     console.log(error)
    //   }
    // } else{
    //   setAvatarUrl(``);
    //   // updateForm({ file: file, avatar_url: '' });
    // }
  };

  const copyToClipBoard = async () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const link = `/vranda/${userAddress}`;
    navigator.clipboard.writeText(origin + link);
  };

  const submitProfile = async () => {
    let rewardImg;
    if (avatar) {
      const resizedFile = await resizeFile(avatar);
      const meatadataUri = await uploadMetadataToIPFS(name ? name : '', bio ? bio : '', resizedFile);
      try {
        const result = (await axios.get(meatadataUri)).data;
        // console.log(result)
        const imgUri = result.image;
        rewardImg = `https://nftstorage.link/ipfs/${imgUri.split('//')[1]}`;
        console.log(rewardImg)
        // updateForm({ file: file, avatar_url: rewardImg });
        setAvatarUrl(rewardImg);
      } catch (error) {
        rewardImg = `https://vself.app/ninja2.png`
        setAvatarUrl(`https://vself.app/ninja2.png`);
        // updateForm({ file: file, avatar_url: `https://vself.app/ninja2.png` });
        console.log(error)
      }
    } else {
      rewardImg = avatarUrl;
      // updateForm({ file: file, avatar_url: '' });
    }

    try {
      const tx = await writeContract({
        address: PROFILE_CONTRACT_ADDRESS,
        abi: profileContractAbi,
        functionName: 'createProfile',
        args: [
          name, bio, rewardImg
        ],
        chainId: CAMINO_CHAIN_ID
      });

      console.log(tx);

    } catch (error) {
      console.log(error);
    }

  };


  const unwatch = useContractEvent({
    address: PROFILE_CONTRACT_ADDRESS,
    abi: profileContractAbi,
    eventName: 'ProfileCreated',
    listener(log) {
      try {
        if (log) {
          console.log(log);
          console.log((log[0] as any).args.userAddress);
        }
      } catch (error) {
        console.log(error)
      }

      if (log.length > 0) unwatch?.()
    },
  });

  return (
    <div className="flex flex-col mb-[40px] p-[40px] md:px-[15px]">
      <div className="flex flex-col">
        <div className="flex justify-center items-baseline mt-2 mb-[15px] md:mb-0 relative">
          <UploadImageButton onImageSet={handleImgChange} url={avatarUrl} readonly={!isEditing} />
        </div>
        <div className="flex flex-col items-center mt-[20px]" data-testid="profile-parent">
          <input
            disabled={!isEditing}
            data-testid="profile-name"
            autoComplete="off"
            placeholder="Name"
            name="name"
            onChange={handleInputChange}
            value={name}
            type="text"
            className="w-full mb-2 py-1.5 text-center font-medium text-[#3D3D3D] leading-[32px] font-inter text-[24px] bg-transparent bg-clip-padding border-b-[1px] border-[#dedede] transition ease-in-out m-0 outline-none"
          />
          <div
            data-testid="profile-bio"
            placeholder="Bio"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            role={'textbox'}
            onInput={handleTextareaChange}
            className={
              'w-full px-5 py-1.5 text-center font-normal text-[#3D3D3D] leading-[20px] font-inter text-[14px] md:text-[14px] bg-transparent bg-clip-padding border-0 transition ease-in-out m-0 mb-[18px] outline-none'
            }
          >
            {bio}
          </div>
          <ActiveLink href={`/vranda/${userAddress}`}>
            <span className="text-[#41F092] text-[14px] font-normal leading-[28px] underline">{userAddress}</span>
          </ActiveLink>
          {
            isEditing ?
              <button
                onClick={submitProfile}
                type="button"
                className="flex flex-rox w-full mt-[8px] h-[40px] items-center justify-center bg-[#41F092] rounded-full hover:bg-[#76FFAD] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
              >
                <span className="font-inter text-[14px] text-[#3D3D3D] leading-[32px] font-medium mx-[3px]">Submit Profile</span>
              </button>
              :''
          }
          <button
            onClick={copyToClipBoard}
            type="button"
            className="flex flex-rox w-full mt-[8px] h-[40px] items-center justify-center bg-[#41F092] rounded-full hover:bg-[#76FFAD] focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
          >
            <span className="font-inter text-[14px] text-[#3D3D3D] leading-[32px] font-medium mx-[3px]">Copy link</span>
            <ChainLink className={'w-[18px] h-[18px] stroke-[#3D3D3D] mx-[3px]'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bio;
