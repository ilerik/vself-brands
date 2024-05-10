import { isEnvProd } from '../utils';

export enum Endpoints {
  TESTNET_RPC_ENDPOINT_URI = 'https://rpc.testnet.near.org',
  MAINNET_RPC_ENDOINT_URI = 'https://rpc.mainnet.near.org',

  // vSelf Event Contracts
  OLD_TESTNET_CONTRACT_URI = 'events_v29.sergantche.testnet',
  TESTNET_CONTRACT_URI = 'events_v32.sergantche.testnet',

  TESTNET_CONTRACT_URI_V32 = 'v32.prod.vself.sergantche.testnet',
  MAINNET_CONTRACT_URI = 'v3.event.vself.near',

  // Linkdrop Contracts
  LINKDROP_TESTNET_CONTRACT_URI = 'linkdrop_v2.sergantche.testnet',

  // Deposits Contracts
  DEPOSITS_TESTNET_CONTRACT_URI = 'dev-1666966310314-54040938400138',
  DEPOSITS_MAINNET_CONTRACT_URI = 'dev-1666696088646-92999275504703',

  // Near social
  SOCIAL_TESTNET_CONTRACT_URI = 'v1.social08.testnet',
  SOCIAL_MAINNET_CONTRACT_URI = 'social.near',

  // Communities contract
  COMMUNITIES_TESTNET_CONTRACT_URI = 'communities_v6.sergantche.testnet',
  COMMUNITIES_MAINNET_CONTRACT_URI = 'communities_v1.sergantche_dev.near',

  // Website URL
  PROD_URL = 'https://vself.app',
  TESTNET_URL = 'https://testnet.vself.app',
}

// Graphql api endpoints
const APIURL_TESTNET = 'https://api.thegraph.com/subgraphs/name/ilerik/near-social-testnet';
const APIURL_MAINNET = 'https://api.thegraph.com/subgraphs/name/ilerik/near-social-mainnet';
export const APIURL = isEnvProd ? APIURL_MAINNET : APIURL_TESTNET;
export const WEBSITE_URL = isEnvProd ? Endpoints.PROD_URL : Endpoints.TESTNET_URL;

// Events contract address
// export const CAMINO_EVENTS_CONTRACT_ADDRESS = '0xD0E98880FFCC67A3155A210Bbae45bd00bfedd3f'; this is first version
// export const CAMINO_EVENTS_CONTRACT_ADDRESS = '0xA2c04D5f270e22f115eA5bed2226dD36198ed580'; this is second version
// export const CAMINO_EVENTS_CONTRACT_ADDRESS = '0xc6f3c1aAEF62265701DcEFC4c196f2F1406f9e8D';
// export const CAMINO_EVENTS_CONTRACT_ADDRESS = '0xA7937DA02f93441d62665a413cB4511A87D49a51';
// export const CAMINO_EVENTS_CONTRACT_ADDRESS = '0x51d96295f36A908F7Ab4E1dD252De50658363C71';
export const CAMINO_EVENTS_CONTRACT_ADDRESS = '0xad95a7f87D09656030cf4E3CDD08a6a799a36428';
export const PROFILE_CONTRACT_ADDRESS = '0xe18d9ee3c3279e0B8F61233c8b2FB5F2170fe80C';


export const CAMINO_CHAIN_ID = 501;
export const REACT_APP_ENABLE_TESTNETS = true;
