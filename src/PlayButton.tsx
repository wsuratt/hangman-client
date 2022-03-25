import { Button } from '@mui/material';

export default function PlayButton(props: any) {
  const handleClick = () => {
      props.play();
  };

  return (
    <div>
      <Button
        sx={{
          height: 48,
          width: 167,
          color: '#512da8',
          marginTop: 3,
          borderColor: '#512da8',
          '&:hover': {
            borderColor: 'white',
            color: 'white'
          }
        }}
        onClick={() => {
          handleClick()
        }}
        variant="outlined"
      >
        Play
      </Button>
    </div>
  )
}
