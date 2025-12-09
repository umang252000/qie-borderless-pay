// src/services/network.ts

export const QIE_CHAIN_ID = "0x513";  // Example chain ID (Hex) — replace if hackathon gives a different one

export const switchToQIE = async () => {
  const eth = (window as any).ethereum || (window as any).qieWallet;

  if (!eth) {
    console.error("No wallet detected");
    return false;
  }

  try {
    // Try switching to QIE
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: QIE_CHAIN_ID }],
    });
    return true;

  } catch (error: any) {
    // Error 4902 = Chain not added yet
    if (error.code === 4902) {
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: QIE_CHAIN_ID,
              chainName: "QIE Blockchain",
              rpcUrls: [import.meta.env.QIE_RPC_URL],
              nativeCurrency: {
                name: "QIE",
                symbol: "QIE",
                decimals: 18,
              },
              blockExplorerUrls: ["https://testnet.qie.digital/"],
            },
          ],
        });

        return true;
      } catch (err) {
        console.error("Chain adding rejected:", err);
        return false;
      }
    }

    console.error("Cannot switch chain:", error);
    return false;
  }
};