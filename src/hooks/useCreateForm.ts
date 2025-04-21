 überimport { useSignAndExecuteTransaction, useWallets } from "@iota/dapp-kit";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useState } from "react";
import { useNetworkVariable } from "../networkConfig";

export const useCreateForm = () => {
  const [formData, setFormData] = useState({
    eventId: "",
    eventdate: "",
    royaltyPercentage: "",
    price: "",
    nft: "",
    recipient: "",
    initiatedResell: "",
    seatNumber: "",
    coin: "0x2::coin::IOTA",
  });

  const [nftFormData, setNftFormData] = useState({
    nft: "",
    recipient: "",
    price: "",
  });

  const packageId = useNetworkVariable("packageId" as never);
  const eventObject = useNetworkVariable("eventObject" as never);
  const creatorCap = useNetworkVariable("creatorCap" as never);
  
  const { isConnected, address } = useWallets();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const client = new IotaClient({
    url: getFullnodeUrl("testnet"),
  });

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNftFormData = (
    field: keyof typeof nftFormData,
    value: string
  ) => {
    setNftFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetFormData = () => {
    setFormData({
      eventId: "",
      eventdate: "",
      royaltyPercentage: "",
      price: "",
      nft: "",
      recipient: "",
      initiatedResell: "",
      seatNumber: "",
      coin: "0x2::coin::IOTA",
    });
  };

  const resetNftFormData = () => {
    setNftFormData({
      nft: "",
      recipient: "",
      price: "",
    });
  };

  return {
    formData,
    nftFormData,
    updateFormData,
    updateNftFormData,
    resetFormData,
    resetNftFormData,
    packageId,
    eventObject,
    creatorCap,
    signAndExecuteTransaction,
    client,
    isConnected,
    address,
  };
}; 