import { useEffect, useState } from 'react';
import {
  CircularProgress,
  Snackbar,
  makeStyles,
  Button,
  Box,
  Typography,
} from '@material-ui/core';

const MobilePage = () => {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <Typography className={classes.game}>HANGMAN</Typography>
      <Typography className={classes.title2}>BY </Typography>
      <Typography className={classes.title}>SOL</Typography>
      <Typography className={classes.title2}>WAGER</Typography>
      <Typography className={classes.text2}>Hangman not available on mobile :(</Typography>
    </main>
  )
};
const useStyles = makeStyles({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  game: {
    color: "white",
    marginTop: "25px",
    fontSize: "50px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
  },
  main: {
    textAlign: "center",
    background: "black",
  },
  text: {
    color: "white",
    fontSize: "25px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
  },
  text2: {
    color: "white",
    marginTop: "25px",
    fontSize: "15px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Verdana",
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
}, { index: 1 });
export default MobilePage;
