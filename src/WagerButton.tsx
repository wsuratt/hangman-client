import { useState } from 'react';
import { Button } from '@mui/material';
import { CircularProgress, makeStyles } from '@material-ui/core';

import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

export default function WagerButton(props: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const initiateWager = async (onWager: any) => {
    setIsProcessing(true);
    let tx = await onWager();
    setIsProcessing(false);
  };

  const handleClickOpen = () => {
      setOpen(true);
      handleClose(true);
  };

  const handleClose = (agreed: boolean) => {
      setOpen(false);

      if (!agreed) {
          return
      }
      initiateWager(props.onWager);
  };

  return (
    <div>
      {/* <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
      >
          <DialogTitle id="alert-dialog-title">
              {"Are you sure you want to wager 0.1 SOL?"}
          </DialogTitle>
          <DialogContent>
              <DialogContentText id="alert-dialog-description">
                  This cannot be undone.
              </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => handleClose(false)}>Disagree</Button>
              <Button onClick={() => handleClose(true)} autoFocus>
                  Agree
              </Button>
          </DialogActions>
      </Dialog> */}
      <Button
        sx={{
          height: 48,
          width: 167,
          color: 'white',
          marginTop: 1,
          borderColor: 'white',
          '&:hover': {
            borderColor: '#512da8',
          }
        }}
        onClick={() => {
          handleClickOpen()
        }}
        variant="outlined"
      >
        {isProcessing ? 
          <CircularProgress className={classes.loadingCircle}/> 
          : "Wager 0.05 SOL"
        }
      </Button>
    </div>
  )
}
const useStyles = makeStyles({
  loadingCircle: {
    color: '#512da8',
  },
}, { index: 1 });
