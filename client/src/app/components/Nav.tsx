import React from 'react';

const Nav = () => {
  return (
    <div className='bg-bg-nav flex flex-row justify-between items-center px-8  text-white w-full h-[60px]'>
      <div className='font-pacifico text-text-nav text-4xl drop-shadow-[-5px_5px_1px_#ADC1C2]'>
        HotBun
      </div>
      <div className='flex gap-2'>
        <div className='font-poppins text-text-nav px-2 '>Login</div>
        <div className='font-poppins text-text-nav px-2'>Register</div>
      </div>
    </div>
  );
};

export default Nav;
