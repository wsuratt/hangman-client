import * as anchor from "@project-serum/anchor";
import { web3 } from '@project-serum/anchor';
import TXButton from "./TXButton";

const idl = require('./hangman_program.json');

export const SOLWAGER_PROGRAM = new anchor.web3.PublicKey(
  "8VxWJzmYtVrC755tFjQGMLhAN3hgPfCNPReEtN3wBzYz"
);

const FEE_WALLET = new anchor.web3.PublicKey(
  "8WnqfBUM4L13fBUudvjstHBEmUcxTPPX7DGkg3iyMmc8"
);

const POOL_PDA = new anchor.web3.PublicKey(
  "6N4dfkqdTFsdJuu6gvvKCUhUX4swWqeTRvt4zonJGgW4"
);

const url = "https://hangman-solwager.herokuapp.com";
// const url = "http://localhost:4800";

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
  // console.log(response);
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

  let fee = ((((losses/wins) * 0.05) * 0.8) * 0.1);
  let amount = +(((((losses/wins) * 0.05) * 0.8) - fee).toFixed(2));

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

export const createUser = async (ID: string) => {
  putData(url + '/api/users', { "ID": ID })
  .then(data => {
    // console.log('Create user:', data);
  })
  .catch((error) => {
    // console.error('Error:', error);
  });
}

export const getHasWagered = async (ID: string): Promise<boolean>  => {
  return new Promise<boolean>(resolve => {
    getData(url + '/api/users/wager/' + ID)
    .then(data => {
      resolve(data);
    })
    .catch((error) => {
      // console.log(error);
      resolve(false);
    });
  });
}

export const getWord = async (ID: string): Promise<string>  => {
  let word = "";
  await getData(url + '/api/users/word/' + ID)
  .then(data => {
    word = data.word;
  })
  .catch((error) => {
    // console.log(error);
    word = "*****";
  });
  return word;
}

export const getNumGuesses = async (ID: string): Promise<string>  => {
  let str = "";
  await getData(url + '/api/users/guesses/' + ID)
  .then(data => {
    str = data;
    // console.log('Guesses: ' + data);
  })
  .catch((error) => {
    str = "0";
    createUser(ID);
  });
  return str;
}

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const awaitTransactionSignatureConfirmation = async (
  txid: anchor.web3.TransactionSignature,
  timeout: number,
  connection: anchor.web3.Connection,
  commitment: anchor.web3.Commitment = "recent",
  queryStatus = false
): Promise<anchor.web3.SignatureStatus | null | void> => {
  let done = false;
  let status: anchor.web3.SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      console.log("Rejecting for timeout...");
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        txid,
        (result: any, context: any) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            console.log("Rejected via websocket", result.err);
            reject(status);
          } else {
            console.log("Resolved via websocket", result);
            resolve(status);
          }
        },
        commitment
      );
    } catch (e) {
      done = true;
      console.error("WS error in setup", txid, e);
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            txid,
          ]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              console.log("REST null result for", txid, status);
            } else if (status.err) {
              console.log("REST error for", txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              console.log("REST no confirmations for", txid, status);
            } else {
              console.log("REST confirmation for", txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            console.log("REST connection error: txid", txid, e);
          }
        }
      })();
      await sleep(2000);
    }
  });

  //@ts-ignore
  if (connection._signatureSubscriptions[subId]) {
    connection.removeSignatureListener(subId);
  }
  done = true;
  console.log("Returning status", status);
  return status;
}

export const initialize = async (
  program: anchor.Program,
  owner: anchor.web3.PublicKey
) => {
  const [account, accountBump] = await web3.PublicKey.findProgramAddress(
    [Buffer.from("hangman_solwager")],
    program.programId
  );
  // console.log(account)
  let tx = await program.rpc.initialize({
    accounts: {
      owner: owner,
      pool: account,
      systemProgram: web3.SystemProgram.programId,
    },
  });
  // console.log(tx)
}

export const wager = async (
  program: anchor.Program,
  owner: anchor.web3.PublicKey,
  connection: anchor.web3.Connection
): Promise<boolean> => {
  const txTimeout = 60000;

  let tx = await program.rpc.wager({
      accounts: {
          owner: owner,
          // admin: FEE_WALLET,
          pool: POOL_PDA,
          systemProgram: web3.SystemProgram.programId,
      }
  });
  const status = await awaitTransactionSignatureConfirmation(
    tx,
    txTimeout,
    connection,
    "singleGossip",
    false
  )

  if (!status?.err) {
    return new Promise<boolean>(resolve => {
      // console.log(tx);
      postData(url + '/api/wager', { "ID": owner.toString(), "sig": tx })
      .then(data => {
        resolve(true);
      })
      .catch((error) => {
        console.error('error:', error);
        resolve(false);
      });
    });
  }
  else {
    return false;
  }
}

export const checkTX = async (
  owner: anchor.web3.PublicKey,
  tx: string
): Promise<boolean> => {
  return new Promise<boolean>(resolve => {
    // console.log(tx);
    postData(url + '/api/wager', { "ID": owner.toString(), "sig": tx })
    .then(data => {
      resolve(true);
    })
    .catch((error) => {
      console.error('error:', error);
      resolve(false);
    });
  });
}

export const startGame = async (userID: string) => {
  await postData(url + '/api/start', { "ID": userID })
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

export const endGame = async (ID: string) => {
  await postData(url + '/api/end', { "ID": ID })
  .then(data => {
  })
  .catch((error) => {
  });
}
