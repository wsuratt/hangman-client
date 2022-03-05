import { Button } from '@mui/material';

export default function StartButton(props: any) {
  const handleClick = () => {
      props.start();
  };

  return (
    <div>
      <Button
        sx={{
          height: 48,
          width: 167,
          color: 'green',
          marginTop: 1,
          borderColor: 'green',
          '&:hover': {
            borderColor: '#66ff00',
            color: '#66ff00'
          }
        }}
        onClick={() => {
          handleClick()
        }}
        variant="outlined"
      >
        Start
      </Button>
    </div>
  )
}
