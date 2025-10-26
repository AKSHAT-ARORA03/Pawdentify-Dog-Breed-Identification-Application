import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Quick Actions Configuration - Exactly 3 items as specified
const QUICK_ACTIONS = [
  {
    id: 'vaccination',
    title: 'Vaccination Tracker',
    subtitle: 'Track pet vaccinations',
    icon: '💉',
    route: '/vaccination',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'help',
    title: 'Help & Support',
    subtitle: 'Get instant assistance',
    icon: '💬',
    route: '/help',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'feedback',
    title: 'Feedback Center',
    subtitle: 'Share your thoughts',
    icon: '📝',
    route: '/feedback',
    gradient: 'from-purple-500 to-pink-600'
  }
];

// Individual Quick Action Item Component
const QuickActionItem = ({ action, index, onActionClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onActionClick(action);
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        h-16 p-4 bg-gradient-to-r ${action.gradient}
        backdrop-blur-md border border-white border-opacity-20
        transition-all duration-300 group
        shadow-lg hover:shadow-xl
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={action.title}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Background Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-white bg-opacity-10 rounded-xl"
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-4 h-full">
        {/* Icon Container */}
        <div className={`
          flex items-center justify-center rounded-lg
          w-10 h-10 bg-black bg-opacity-20 backdrop-blur-sm
          transition-all duration-300 group-hover:bg-opacity-30
        `}>
          <span className="text-lg">{action.icon}</span>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white leading-tight text-sm">
            {action.title}
          </h3>
          <p className="text-white text-opacity-80 text-xs leading-tight">
            {action.subtitle}
          </p>
        </div>

        {/* Action Indicator */}
        <div className="flex items-center">
          <motion.div
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Floating Quick Actions Menu Component
const FloatingQuickActionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle outside clicks and keyboard events
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      // Alt + Q shortcut
      if (event.altKey && event.key === 'q') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    navigate(action.route);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  // FAB Animation variants
  const fabVariants = {
    closed: { 
      rotate: 0,
      scale: 1
    },
    open: { 
      rotate: 45,
      scale: 1.1
    }
  };

  // Menu container variants - Improved positioning and design
  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transformOrigin: 'bottom right'
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transformOrigin: 'bottom right',
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 15,
      transformOrigin: 'bottom right',
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div 
      ref={menuRef}
      className={`
        fixed z-[9999] bottom-8 right-6
        ${isMobile ? 'bottom-6 right-4' : ''}
      `}
    >
      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              absolute bottom-20 right-0
              ${isMobile ? 'w-64' : 'w-72'}
              bg-slate-800 bg-opacity-95 backdrop-blur-xl
              rounded-2xl border border-slate-600 border-opacity-40
              shadow-2xl shadow-slate-900/30
              overflow-hidden
            `}
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(15, 23, 42, 0.5),
                0 0 0 1px rgba(148, 163, 184, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `
            }}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 border-opacity-50">
              <div>
                <h2 className="text-base font-semibold text-white">Quick Actions</h2>
                <p className="text-slate-300 text-xs mt-0.5">Essential dog care tools</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Actions List - Exactly 3 items */}
            <div className="p-4 space-y-3">
              {QUICK_ACTIONS.map((action, index) => (
                <QuickActionItem
                  key={action.id}
                  action={action}
                  index={index}
                  onActionClick={handleActionClick}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 text-center">
              <p className="text-slate-400 text-xs">
                Press <kbd className="bg-slate-600 px-1.5 py-0.5 rounded text-white text-xs">Alt + Q</kbd> to toggle
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        variants={fabVariants}
        animate={isOpen ? "open" : "closed"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className={`
          ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
          bg-gradient-to-r from-purple-600 to-indigo-600
          hover:from-purple-700 hover:to-indigo-700
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-300
          flex items-center justify-center
          focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50
          backdrop-blur-sm border border-white border-opacity-10
        `}
        style={{
          boxShadow: `
            0 10px 25px -5px rgba(139, 92, 246, 0.4),
            0 4px 6px -2px rgba(139, 92, 246, 0.2)
          `
        }}
        aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-white`} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-white`} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingQuickActionsMenu;
