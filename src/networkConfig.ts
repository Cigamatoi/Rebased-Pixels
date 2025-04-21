import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "<DEIN_PACKAGE_ID>",
        creatorCap: "<DEINE_CREATORCAP_ADRESSE>",
        eventObject: "<DEINE_EVENTOBJECT_ADRESSE>",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig }; 