import { useEffect, useState } from 'react';
import WagerButton from './WagerButton';
import StartButton from './StartButton';
import HomeButton from './HomeButton';
import {
  CircularProgress,
  Snackbar,
  makeStyles,
  Button,
  Box,
  Typography,
} from '@material-ui/core';
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Alert from "@material-ui/lab/Alert";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { web3 } from '@project-serum/anchor';
import { Provider, Program } from '@project-serum/anchor';
import {
  getPayoutAmount,
  getHasWagered,
  getWagerProgram,
  getWord,
  getNumGuesses,
  SOLWAGER_PROGRAM,
  initialize,
  createUser,
  wager,
  guess,
  startGame,
  endGame
} from "./wager";

const Home = () => {
  const initialLetters:string[] = [];

  const [hasWagered, setHasWagered] = useState(false);
  const [word, setWord] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [wagerProgram, setWagerProgram] = useState<anchor.Program>();
  const [hasGuessed, setHasGuessed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [numGuesses, setNumGuesses] = useState(8);
  const [guessedLetters, setGuessedLetters] = useState(initialLetters);
  const [wrongGuesses, setWrongGuesses] = useState(initialLetters);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(true);
  const [restartTimer, setRestartTimer] = useState(0);
  const [clickedStart, setClickedStart] = useState(false);
  const [startCount, setStartCount] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const classes = useStyles();
  
  const renderTime = ({ remainingTime } : { remainingTime: any}) => {
    setTimeLeft(remainingTime);
    return remainingTime;
  }

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const home = () => {
    setHasWagered(false);
    setWord("");
    setHasGuessed(false);
    setHasStarted(false);
    setNumGuesses(8);
    setGuessedLetters(initialLetters);
    setWrongGuesses(initialLetters);
    setTimeLeft(15);
    setRestartTimer(0);
    setClickedStart(false);
    setStartCount(3);
    setGameOver(false);
  }

  useEffect(() => {
    if (!wallet) {
      return;
    }
    if (!hasWagered){
      getPayout();
    }
  });

  useEffect(() => {
    if (!wallet) {
      return;
    }
    createUser(wallet.publicKey.toString());
    const program = getWagerProgram(
      wallet as typeof anchor.Wallet,
      connection,
      SOLWAGER_PROGRAM
    );
    setWagerProgram(program);
    initHasWagered();
  }, [wallet, connection]);

  useEffect(() => {
    if (clickedStart)
    {
      if (startCount > 0) {
        setTimeout(() => setStartCount(startCount - 1), 1000);
      } else {
        setClickedStart(false);
        setStartCount(3);
      }
    }
  });

  useEffect(() => {
    if (!wallet || !wagerProgram)
      return;
      
    if (timeLeft == 0)
    {
      setGameOver(true);
      endGame(wallet.publicKey.toString())
    }
  });

  useEffect(() => {
    if (!wallet || !wagerProgram)
      return;

    const handleKeydown = (event: any) => {
      const { key, keyCode } = event;

      if (hasStarted && !gameOver) {
        if (keyCode >= 65 && keyCode <= 90) {
          const letter = key.toUpperCase();
          if (guessedLetters.includes(letter))
          {
            setAlertState({
              open: true,
              message:
                "You already guessed that!",
              severity: "error",
            });
          }
          else if (!hasGuessed)
          {
            onGuess(letter);
          }
        }
      }
      
    }
    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  });

  useEffect(() => {
    if(gameOver)
      onOver();
  }, [gameOver]);

  const getPayout = async () => {
    if (!wagerProgram)
        return;

    const amount = await getPayoutAmount(wagerProgram);
    setPayoutAmount(amount);
  }

  const initHasWagered = async () => {
    if (!wallet)
        return;

    const temp = await getHasWagered(wallet.publicKey.toString());
    if(temp) {
      let currWord = await getWord(wallet.publicKey.toString());
      setWord(currWord);
    }
    setHasWagered(temp);
  }

  const onWager = async () => {
    try {
      if (!wallet || !wagerProgram)
        return;

      const wagerStatus = await new Promise<boolean>(resolve => {
        resolve(wager(wagerProgram, wallet.publicKey));
      });
      // const wagerStatus = false;
      // console.log(wagerStatus)
      // await initialize(wagerProgram, wallet.publicKey);
      if (wagerStatus)
      {
        let currWord = await getWord(wallet.publicKey.toString());
        setWord(currWord);
        let currNumGuesses = await getNumGuesses(wallet.publicKey.toString());
        setNumGuesses(parseInt(currNumGuesses));
        setHasWagered(true);
    
        setAlertState({
          open: true,
          message:
            "Wager succeeded!",
          severity: "success",
        });
      }
      else
      {
        throw 'wager failed';
      }
    } catch (error: any) {
      console.log(error);
      let message = error.msg || "Wager failed! Please try again!";
  
      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  const OnStart = async () => {
    if (!wallet || !wagerProgram)
      return;
    startGame(wallet.publicKey.toString());
    setClickedStart(true);
    setTimeout(() => setHasStarted(true), 3000);
  }

  const onGuess = async (letter: string) => {
    if (!wallet || !wagerProgram)
      return;
    setIsPlaying(false);
    setHasGuessed(true);
    // make this a promise
    let currWord = await guess(wallet.publicKey.toString(), letter);
    // let currWord = await getWord(wallet.publicKey.toString());
    setRestartTimer(prevRestartTimer => prevRestartTimer + 1);
    setWord(currWord);
    if (!currWord.includes(letter))
      setWrongGuesses(prevWrongGuesses => [...prevWrongGuesses, letter]);
    setGuessedLetters(prevGuessedLetters => [...prevGuessedLetters, letter]);
    let currNumGuesses = await getNumGuesses(wallet.publicKey.toString());
    setNumGuesses(parseInt(currNumGuesses));
    if (!currWord.includes("*"))
      setGameOver(true);
      setIsPlaying(true);
    setTimeout(() => setHasGuessed(false), 1000);
  }

  const onOver = async () => {
    if (!wallet || !wagerProgram)
        return;
    // await end(wagerProgram, wallet.publicKey);
  }

  return (
    <main className={classes.main}>
      <Typography className={classes.game}>HANGMAN</Typography>
      <Typography className={classes.title2}>BY </Typography>
      <Typography className={classes.title}>SOL</Typography>
      <Typography className={classes.title2}>WAGER</Typography>
      <br/>
      {!hasStarted ? (
        <div className={classes.walletButton}>
          <WalletMultiButton />
        </div>
      ) : (
        <Typography className={classes.guessText}>Guesses Remaining: {numGuesses}</Typography>
      )}
      {wallet && !hasWagered ? (
        <div>
          <WagerButton 
            onWager={onWager}
          />
          <Typography className={classes.payoutText}>ESTIMATED PAYOUT: {payoutAmount} SOL</Typography>
        </div>
      ) : !hasStarted && !clickedStart && hasWagered ? (
        <StartButton start={OnStart}/>
      ) : !hasStarted && hasWagered ? (
        <div className={classes.startText}>
          {startCount}
        </div>
      ) : hasStarted ? (
        <div>
          {timeLeft > 0 && !gameOver ? (
            <div className={classes.timer}>
              <CountdownCircleTimer
                key={restartTimer}
                isPlaying={isPlaying}
                size={75}
                duration={15}
                trailColor={'#000000'}
                colors={['#008000', '#FFFF00', '#FF0000', '#FF0000']}
                colorsTime={[15, 10, 5, 0]}
              >
                {renderTime}
              </CountdownCircleTimer>
            </div>
          ) : numGuesses == 0 ? (
            <div>
              <Typography className={classes.incorrectText}>YOU LOST!</Typography>
              <HomeButton home={home}/>
            </div>
          ) : numGuesses > 0 && timeLeft > 0 ? (
            <div>
              <Typography className={classes.correctText}>YOU WON!</Typography>
              <HomeButton home={home}/>
            </div>
          ) : (
            <div>
              <Typography className={classes.incorrectText}>OUT OF TIME!</Typography>
              <HomeButton home={home}/>
            </div>
          )}
          <Typography className={classes.codeText}>{word}</Typography>
          <Typography className={classes.text}>Type a letter to guess</Typography>
          <Typography className={classes.incorrectText2}>{wrongGuesses.map(letter => letter + ", ")}</Typography>
        </div>
      ): null}
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  )
};
interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
};
const useStyles = makeStyles({
  correctText: {
    color: "green",
    fontSize: "50px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
    marginTop: "15px",
  },
  game: {
    color: "white",
    marginTop: "25px",
    fontSize: "50px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
  },
  incorrectText: {
    color: "red",
    fontSize: "50px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
    marginTop: "15px",
  },
  incorrectText2: {
    color: "red",
    fontSize: "25px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
    marginTop: "10px",
  },
  loadingCircle: {
    marginTop: "75px",
    color: '#512da8',
  },
  main : {
    textAlign: "center",
    background: "black",
  },
  payoutText: {
    color: "white",
    marginTop: "25px",
    fontFamily: "Verdana",
  },
  guessText: {
    color: "white",
    fontSize: "25px",
    fontWeight: "bold",
    marginTop: "25px",
    fontFamily: "Verdana",
  },
  startText: {
    color: "white",
    fontSize: "40px",
    marginTop: "5px",
    fontFamily: "Verdana",
  },
  text: {
    color: "white",
    fontFamily: "Verdana",
  },
  timer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "15px"
  },
  title: {
    color: "#512da8",
    display: "inline",
    marginTop: "25px",
    fontSize: "25px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
  },
  title2: {
    color: "white",
    display: "inline",
    marginTop: "25px",
    fontSize: "25px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
  },
  walletButton: {
    marginTop: "25px;",
    background: "black",
    display: "inline-block",
  },
  codeText: {
    color: "white",
    fontSize: "50px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
    marginTop: "15px",
  },
}, { index: 1 });
export default Home;
