import { Button } from '@mui/material';

export default function HomeButton(props: any) {
  const handleClick = () => {
      props.home();
  };

  return (
    <div>
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
          handleClick()
        }}
        variant="outlined"
      >
        Home
      </Button>
    </div>
  )
}
