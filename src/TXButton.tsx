import { useState } from 'react';
import { Button } from '@mui/material';
import { TextField, makeStyles } from '@material-ui/core';
import { checkTX } from "./wager";

export default function TXButton(props: any) {
  const [tx, setTX] = useState('');

  const handleClick = async () => {
    
      let isValid = await new Promise<boolean>(resolve => {
        resolve(checkTX(props.owner, tx));
      });
      
      props.validateTX(isValid);
  };
  const classes = useStyles();

  return (
    <div>
      <TextField
        variant="outlined"
        color="primary"
        focused
        label="TX ID"
        // value={tx}
        // onInput={ e=>setTX((e.target as HTMLTextAreaElement).value)}
        InputProps={{
          className: classes.textField
        }}
        style={{ width: "167px", margin: "20px" }}
      />
      <Button
        sx={{
          height: 55,
          width: 167,
          color: '#B026FF',
          marginTop: "20px",
          marginBottom: 10,
          borderColor: '#B026FF',
          '&:hover': {
            borderColor: '#512da8',
            color: '#512da8'
          }
        }}
        onClick={() => {
          handleClick()
        }}
        variant="outlined"
      >
        Submit
      </Button>
    </div>
  )
}
const useStyles = makeStyles({
  textField: {
    color: "white",
  }
}, { index: 1 });
