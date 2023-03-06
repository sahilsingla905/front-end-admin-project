import React, { FC } from 'react';
import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


export const Header: FC = () => {
  return (
    <AppBar position="static" color="inherit">
        <Container maxWidth="xl">
            <Toolbar disableGutters>
                <img src="logo.png" className="mr-5" />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1  }} >
                    <MenuIcon sx={{ display: { xs: 'none', md: 'flex' }, color: '#005B96'}} />
                </Typography>
                <div className='bg-[#F6CA65] h-[43px] w-[43px] rounded-[5px] font-bold leading-[27px] text-[23px] flex justify-center items-center mr-[11px] text-white'> JD</div>
                <Typography className='text-[#005B96]'>
                    John Doe
                </Typography>
            </Toolbar>
        </Container>
    </AppBar>
  );
}