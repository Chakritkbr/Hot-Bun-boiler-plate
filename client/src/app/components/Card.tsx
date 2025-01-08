import React from 'react';

const Card = () => {
  return (
    <div className='flex flex-col max-w-sm border w-[200px] h-[360px] bg-white shadow-lg rounded-lg overflow-hidden'>
      <div className='flex w-[200px] h-[188px] justify-center items-center'>
        <div className='w-full h-full'>
          <img
            src='https://images.mrcook.app/recipe-image/01938c63-609f-720f-aad7-ff66acb5c459?cacheKey=VHVlLCAwMyBEZWMgMjAyNCAxMTo1OTowNiBHTVQ='
            alt='1'
          />
        </div>
      </div>
      <div className='flex flex-col p-[8px] justify-center mt-[8px]'>
        <div className='font-nunito font-semibold'>HotBun Delights</div>
        <div className='mt-[4px] font-poppins text-text-nav '>60 ฿ THB.</div>
        <div className='text-[12px] text-gray-600 mb-[8px] text-ellipsis overflow-hidden line-clamp-2'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore
          officiis voluptate maiores alias voluptatibus esse excepturi ullam
          repellat vel vero, corporis tempore dicta, harum sequi eveniet
          voluptatem quo beatae voluptates.
        </div>
        <div className='flex  text-gray-400 text-[10px] font-poppins gap-1 flex-wrap px-[2px]'>
          <button className='rounded-full border border-gray-400 bg-white p-[2px] overflow-hidden '>
            Vegan
          </button>
          <button className='rounded-full border border-gray-400 bg-white p-[2px] overflow-hidden '>
            Gluten-free
          </button>
          <button className='rounded-full border border-gray-400 bg-white p-[2px] overflow-hidden '>
            Low-sodium
          </button>
          <button className='rounded-full border border-gray-400 bg-white p-[2px] overflow-hidden '>
            Dairy-Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
