import * as anchor from "@project-serum/anchor";
import {Connection, PublicKey} from "@solana/web3.js";
import {programs} from "@metaplex/js";
import {AnchorWallet} from "@solana/wallet-adapter-react";

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
// const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
export const connection = new Connection("https://withered-delicate-bird.solana-mainnet.quiknode.pro/59cfd581e09e0c25b375a642f91a4db010cf27f6/", "confirmed");

const {
  metadata: { MetadataData },
  TokenAccount,
} = programs;

export const getNFTMints = async (
  user_wallet: AnchorWallet
): Promise<any> => {
  let hasNFT = false;
  try {
    const accountsUser = await TokenAccount.getTokenAccountsByOwner(
      connection,
      user_wallet.publicKey
    );

    let potentialNftAccounts = accountsUser.filter((account: { data: { amount: { toNumber: () => number; }; }; }) => account.data.amount.toNumber() === 1)
    
    let nftMetadataAddresses: Array<PublicKey> = [];
    for (let potentialNftAccount of potentialNftAccounts) {
      nftMetadataAddresses.push(await fetchMetadata(potentialNftAccount.data.mint))
    }
    let nftAcinfo = await connection.getMultipleAccountsInfo(
        nftMetadataAddresses,
        "processed"
    );
    
    for (let info of nftAcinfo) {
      if (!info)
        continue

      let accountMetaData = MetadataData.deserialize(info.data)
      if (accountMetaData.updateAuthority !== "2jdkHsMj7BCwR5DNet7Ph41Pj1HJWKSWhZTZxusRrkwa") {
        continue
      }

      hasNFT = true;
      break;
    }
  } catch (err) {
    console.log("you don't have any nfts");
  }
  return hasNFT;
};

export const fetchMetadata = async (nftMintKey: PublicKey) => {
  const metadataBuffer = Buffer.from("metadata");

  // Fetches metadata account from PDA
  return (
      await PublicKey.findProgramAddress(
          [
            metadataBuffer,
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            nftMintKey.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
      )
  )[0];
};
