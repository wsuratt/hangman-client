import * as anchor from "@project-serum/anchor";
import { web3 } from '@project-serum/anchor';

const idl = require('./hangman_program.json');

export const SOLWAGER_PROGRAM = new anchor.web3.PublicKey(
  "FMUgWojverbaoVHq1tkLf9xxFe1eusyN4AjJQ1GBBx4A"
);

const FEE_WALLET = new anchor.web3.PublicKey(
  "8WnqfBUM4L13fBUudvjstHBEmUcxTPPX7DGkg3iyMmc8"
);

const POOL_PDA = new anchor.web3.PublicKey(
  "CoDTqzRy4P4jQqz3FadbWJJHdLupsQH7PrrvLNgodNFX"
);

const url = "https://hangman-solwager.herokuapp.com";

async function getData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'GET', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return response.json();
}

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  console.log(response);
  return response.json();
}

async function putData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'PUT', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return response.json();
}

export const getPayoutAmount = async (
  program: anchor.Program,
): Promise<number>  => {
  const poolAccount = await program.account.pool.fetch(POOL_PDA);

  let wins = parseInt(poolAccount.win) + 1;
  let losses = parseInt(poolAccount.loss);

  let amount = +((((losses/wins) * 0.1) * 0.5).toFixed(2));

  return amount;
}
export const getWagerProgram = (
  anchorWallet: typeof anchor.Wallet,
  connection: anchor.web3.Connection,
  programId: anchor.web3.PublicKey
): anchor.Program => {
  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: "recent",
  });

  return new anchor.Program(idl, programId, provider)
};

const createUser = async (ID: string) => {
  putData(url + '/api/users', { "ID": ID })
  .then(data => {
    console.log('Create user:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

export const getWord = async (ID: string): Promise<string>  => {
  let word = "";
  await getData(url + '/api/users/word/' + ID)
  .then(data => {
    word = data.word;
  })
  .catch((error) => {
    console.log(error);
    word = "*****";
    createUser(ID);
  });
  return word;
}

export const getNumGuesses = async (ID: string): Promise<string>  => {
  let str = "";
  await getData(url + '/api/users/guesses/' + ID)
  .then(data => {
    str = data;
    console.log('Guesses: ' + data);
  })
  .catch((error) => {
    str = "0";
    createUser(ID);
  });
  return str;
}

export const initialize = async (
  program: anchor.Program,
  owner: anchor.web3.PublicKey
) => {
  const [account, accountBump] = await web3.PublicKey.findProgramAddress(
    [Buffer.from("hangman_test")],
    program.programId
  );
  await program.rpc.initialize(accountBump, {
    accounts: {
      owner: owner,
      pool: account,
      systemProgram: web3.SystemProgram.programId,
    },
  });
}

export const wager = async (
  program: anchor.Program,
  owner: anchor.web3.PublicKey
) => {
  let tx = await program.rpc.wager({
      accounts: {
          owner: owner,
          admin: FEE_WALLET,
          pool: POOL_PDA,
          systemProgram: web3.SystemProgram.programId,
      }
  });
  await postData(url + '/api/wager', { "ID": owner.toString(), "sig": tx })
  .then(data => {
    // console.log(data);
  })
  .catch((error) => {
    console.error('error:', error);
  });
}

export const startGame = async (userID: string) => {
  await postData(url + '/api/wager', { "ID": userID })
  .then(data => {
    // console.log(data);
  })
  .catch((error) => {
    console.error('error:', error);
  });
}

export const guess = async (ID: string, guess: string): Promise<string> => {
  let word = "";
  await postData(url + '/api/guess', { "ID": ID, "guess": guess })
  .then(data => {
    word = data.word;
  })
  .catch((error) => {
    console.error('error:', error);
  });
  return word;
}

// export const end = async (
//   program: anchor.Program,
//   owner: anchor.web3.PublicKey,
// ) => {
//   await program.rpc.endGame({
//       accounts: {
//           owner: owner,
//           pool: POOL_PDA,
//           systemProgram: web3.SystemProgram.programId,
//       }
//   });
// }
