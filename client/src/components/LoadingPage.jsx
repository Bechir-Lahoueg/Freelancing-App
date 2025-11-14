import { motion } from 'framer-motion';

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      {/* Icon with rotation effect */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity }
        }}
      >
        <img
          src="/loadicon.png"
          alt="Loading"
          className="w-60 h-60 object-contain"
        />
      </motion.div>
    </div>
  );
};

export default LoadingPage;
