import { BigNumber } from 'ethers';

export interface Quest {
  reward_description: string;
  reward_title: string;
  reward_uri: string;
}

export interface CollectionData {
  event_description: string;
  event_name: string;
  finish_time: number;
  quest: Quest;
  start_time: number;
}

export interface CollectionFormData extends CollectionData {
  file: File | undefined;
}

export interface CollectionStats {
  stopped_at: number | null;
  participants: string[];
  created_at: number;
  created_by: string;
  total_actions: number;
  total_rewards: number;
  total_users: number;
}

export interface EventAction {
  username: string;
  qr_string: string;
  timestamp: number;
  reward_index: number;
}

export interface CollectionSettings {
  signin_request: boolean;
  transferability: boolean;
  limited_collection: boolean;
}

export interface Collection {
  0: number;
  1: CollectionData;
  2: CollectionSettings;
  3: CollectionStats;
}

export interface IEventData {
  eventId: BigNumber;
  startTime: BigNumber;
  finishTime: BigNumber;
  totalUsers: BigNumber;
  eventOwner: string;
  eventName: string;
  eventDescription: string;
  isAvailable: boolean;
}

export interface IEventStats {
  totalActions: BigNumber;
  totalRewards: BigNumber;
  totalUsers: BigNumber;
  createdAt: BigNumber;
  stoppedAt: BigNumber;
  participants: string[];
}

export interface IQuest {
  rewardTitle: string;
  rewardDescription: string;
  rewardUri: string;
}

export interface IEventAction {
  timestamp: BigNumber;
  userAddress: string;
  actionStatus: boolean;
}

export interface IEvent {
  eventData: IEventData;
  eventStats: IEventStats;
  quest: IQuest;
}
