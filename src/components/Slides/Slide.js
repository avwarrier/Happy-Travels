import React from 'react';
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { motion, AnimatePresence } from 'framer-motion';


const Slide = ({
  children,
  prev,
  next,
  welcome,
  end,
  hideNextArrow,
  direction = 'next',
  /** a unique value so Framer-Motion can animate between slides */
  motionKey,
}) => {
  /* page-enter / exit variants */
  const variants = {
    enter: (dir) => ({ y: dir === 'next' ? 100 : -100, opacity: 0 }),
    center:       { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit:  (dir) => ({ y: dir === 'next' ? -100 : 100, opacity: 0,
                       transition: { duration: 0.5, ease: 'easeInOut' } }),
  };

  return (
    <div className="relative flex flex-col items-center h-screen justify-center">
      {/* ───── navigation arrows ───── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
        {!welcome && (
          <button
            onClick={prev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-black
                       hover:bg-pink-500 hover:text-white transition-colors duration-200 focus:outline-none"
            aria-label="Previous"
          >
            <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
          </button>
        )}
        {!end && !hideNextArrow && (
          <button
            onClick={next}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-black
                       hover:bg-pink-500 hover:text-white transition-colors duration-200 focus:outline-none"
            aria-label="Next"
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
          </button>
        )}
      </div>

      {/* ───── slide content with enter/exit animation ───── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={motionKey} 
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="h-[70vh] w-[98vw] bg-white rounded-xl"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Slide;
