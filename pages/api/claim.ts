/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { CAMINO_EVENTS_CONTRACT_ADDRESS } from '../../constants/endpoints';
import eventsContractAbi from '../../abis/events-abi.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { eventId, userAddress, index } = req.body;

    const caminoProvider = new ethers.providers.JsonRpcProvider(process.env.COLUMBUS_RPC);
    const signer = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVAKE_KEY as string, caminoProvider);
    const eventContract = new ethers.Contract(CAMINO_EVENTS_CONTRACT_ADDRESS as string, eventsContractAbi, signer);

    try {
        const result = await eventContract.checkin(
            eventId,
            userAddress,
            index,
        );
        console.log(result);
        return res.status(200).json({ isSuccess: true });
    } catch (error) {
        console.log('transaction failed', error);
        return res.status(200).json({ isSuccess: false });
    }
}
