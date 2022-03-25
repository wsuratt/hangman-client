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
          color: '#B026FF',
          marginTop: 3,
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
        Play
      </Button>
    </div>
  )
}
