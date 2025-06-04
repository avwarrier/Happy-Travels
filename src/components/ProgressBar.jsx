// components/ProgressBar.jsx
import { motion } from 'framer-motion';

const ProgressBar = ({ progress }) => (
  <div className="fixed top-0 left-0 w-full h-2 z-50 bg-gray-100">
    <motion.div
      /* full-width element we'll scale instead of resize */
      className="h-full origin-left rounded-md airbnb-gradient"
      initial={false}                             // <-- keep previous state
      animate={{ scaleX: progress }}              // <-- 0 → 1
      transition={{ type: 'tween', duration: 0.45, ease: 'easeInOut' }}
      style={{ width: '100%' }}                   // width is always 100%
    />
  </div>
);

export default ProgressBar;
