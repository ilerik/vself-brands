/* eslint-disable no-prototype-builtins */
import React from 'react';
import type { GetServerSidePropsContext, NextPage } from 'next';
import ProfileComponent from '../../features/profile';
import { getConnectedContract } from '../../utils/contract';
import { socialContractMethods, socialContractName } from '../../utils/contract-methods';
import PageLayout from '../../components/page-layout';
import { vRandaFormState } from '../../models/vRanda';

interface VRandaPageProps {
  profile: vRandaFormState;
  userAddress: string;
}

const VRandaPage: NextPage<VRandaPageProps> = ({ profile, userAddress }) => {
  return (
    <PageLayout colored title={`${userAddress}`} description={profile?.bio} image={profile?.avatar_url} pageName="vRanda">
      <ProfileComponent userAddress={String(userAddress)} isEditing={false} />
    </PageLayout>
  );
};

// Get data from Indexer
export const getServerSideProps = async ({ query, res }: GetServerSidePropsContext) => {
  res.setHeader('Cache-Control', 'public, s-maxage=0, stale-while-revalidate=10');
  const { slug } = query;
  const userAddress = String(slug);
  try {
    const { contract } = await getConnectedContract(socialContractName, socialContractMethods);
    const result = await contract.get({ keys: [`${userAddress}/vself/**`] });
    // Parse the data and udpate the state
    if (!result.hasOwnProperty(userAddress)) {
      throw 'Undefined';
    }
    const { vself } = result[userAddress!];
    vself.links = vself.links ? Object.values(vself.links) : [];
    vself.nfts = vself.nfts ? Object.values(vself.nfts) : [];

    return {
      props: {
        profile: vself,
        userAddress: String(slug),
      },
    };
  } catch (err) {
    return {
      props: {
        userAddress: String(slug),
        profile: {},
      },
    };
  }
};

export default VRandaPage;
