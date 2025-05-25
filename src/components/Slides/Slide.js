import React from 'react'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Slide = ({ children, prev, next, welcome, end, ...rest }) => {
    return (
        <div className='flex flex-col items-center h-screen justify-center gap-[20px]'>
            {
                !welcome ?
                    <button onClick={prev} className='bg-[#191919] rounded-md shadow-md text-white w-[100px] h-[45px] cursor-pointer'>
                        <KeyboardArrowUpIcon sx={{ fontSize: 30 }} />
                    </button>
                :
                    <div className='h-[45px]'></div>
            }

            <div className="h-[70vh] w-[85vw] bg-[#eae0d8] shadow-md rounded-xl p-[5px]" {...rest}>
                {children}
            </div>

            {
                !end ?
                    <button onClick={next} className='bg-[#191919] rounded-md shadow-md text-white w-[100px] h-[45px] cursor-pointer'>
                        <KeyboardArrowDownIcon sx={{ fontSize: 30 }} />
                    </button>
                :
                    <div className='h-[45px]'></div>
            }
        </div>
    );
}

export default Slide