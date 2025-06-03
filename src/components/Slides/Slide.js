import React from 'react'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { motion, AnimatePresence } from 'framer-motion';

const Slide = ({ children, prev, next, welcome, end, direction = 'next', ...rest }) => {
    // Animation variants
    const variants = {
        enter: (direction) => ({
            y: direction === 'next' ? 100 : -100,
            opacity: 0,
        }),
        center: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeInOut' }
        },
        exit: (direction) => ({
            y: direction === 'next' ? -100 : 100,
            opacity: 0,
            transition: { duration: 0.5, ease: 'easeInOut' }
        }),
    };

    return (
        <div className='flex flex-col items-center h-screen justify-center gap-[20px]'>
            {
                !welcome ?
                    <button
                        onClick={prev}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-black hover:bg-gray-300 transition-colors duration-200 focus:outline-none cursor-pointer"
                        aria-label="Previous"
                    >
                        <KeyboardArrowUpIcon sx={{ fontSize: 28 }} />
                    </button>
                :
                    <div className='h-[45px]'></div>
            }

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={rest.key || 'slide'}
                    className="h-[70vh] w-[85vw] bg-white rounded-xl"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            {
                !end && !rest.hideNextArrow ?
                    <button
                        onClick={next}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-black hover:bg-gray-300 transition-colors duration-200 focus:outline-none cursor-pointer"
                        aria-label="Next"
                    >
                        <KeyboardArrowDownIcon sx={{ fontSize: 28 }} />
                    </button>
                :
                    <div className='h-[45px]'></div>
            }
        </div>
    );
}

export default Slide