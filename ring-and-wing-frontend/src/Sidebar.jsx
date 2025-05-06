// Default colors
const defaultColors = {
  primary: '#2e0304',
  accent: '#f1670f',
  muted: '#ac9c9b',
  background: '#fefdfd',
  activeBg: '#f1670f20',
  iconBrown: '#853619' // Added brown color for dropdown icons
};

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FiMenu, 
  FiX,
  FiGrid,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiMessageSquare,
  FiBookOpen,
  FiDollarSign,
  FiShoppingCart,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiTablet,
  FiClock,
  FiLogOut,
  FiShield,
  FiSettings,
  FiDatabase
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ colors = defaultColors, onTimeClockClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth >= 768) setIsOpen(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (openDropdown && !location.pathname.startsWith(openDropdown)) {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);
  const isParentActive = (subItems) => 
    subItems.some(subItem => isActive(subItem.path));

  const isLargeScreen = windowWidth >= 1920;
  const sidebarWidth = isLargeScreen ? '8rem' : '5rem';
  const iconSize = isLargeScreen ? 32 : 24;
  const chevronSize = isLargeScreen ? 20 : 16;
  const logoSize = isLargeScreen ? '1.875rem' : '1.5rem';
  const tooltipTextSize = isLargeScreen ? '1rem' : '0.875rem';
  const dropdownWidth = isLargeScreen ? '14rem' : '12rem';
  
  const userRole = userData?.role || 'staff';

  // Define navigation items with role-based access - updated structure
  const navigationItems = [
    { 
      path: '/dashboard', 
      icon: <FiGrid size={iconSize} className="text-white" />, 
      label: 'Dashboard',
      roles: ['manager', 'staff']
    },
    { 
      path: '/pos', 
      icon: <FiShoppingCart size={iconSize} className="text-white" />, 
      label: 'POS',
      roles: ['manager', 'staff']
    },
    { 
      path: '/sales',
      icon: <FiShoppingBag size={iconSize} className="text-white" />,
      label: 'Sales',
      roles: ['manager', 'staff'],
      subItems: [
        { 
          path: '/self-checkout', 
          icon: <FiTablet size={iconSize} style={{ color: colors.iconBrown }} />, 
          label: 'Self Checkout',
          roles: ['manager', 'staff']
        },
        { 
          path: '/orders', 
          icon: <FiShoppingBag size={iconSize} style={{ color: colors.iconBrown }} />, 
          label: 'Orders',
          roles: ['manager', 'staff']
        },
      ]
    },
    { 
      path: '/inventory-management',
      icon: <FiDatabase size={iconSize} className="text-white" />,
      label: 'Inventory & Menu',
      roles: ['manager'],
      subItems: [
        { 
          path: '/inventory', 
          icon: <FiBox size={iconSize} style={{ color: colors.iconBrown }} />, 
          label: 'Inventory',
          roles: ['manager']
        },
        { 
          path: '/menu', 
          icon: <FiBookOpen size={iconSize} style={{ color: colors.iconBrown }} />, 
          label: 'Menu',
          roles: ['manager']
        },
      ]
    },
    { 
      path: '/timeclock', 
      icon: <FiClock size={iconSize} className="text-white" />, 
      label: 'Time Clock',
      roles: ['manager', 'staff']
    },
    { 
      path: '/staff',
      icon: <FiUsers size={iconSize} className="text-white" />,
      label: 'Staff',
      roles: ['manager'],
      subItems: [
        { 
          path: '/employees', 
          icon: <FiUser size={iconSize} style={{ color: colors.iconBrown }} />, 
          label: 'Employee Management',
          roles: ['manager']
        },
        { 
          path: '/payroll', 
          icon: <FiDollarSign size={iconSize} style={{ color: colors.iconBrown }} />, 
          label: 'Payroll System',
          roles: ['manager']
        }
      ]
    },
    { 
      path: '/expenses', 
      icon: <FiDollarSign size={iconSize} className="text-white" />, 
      label: 'Expenses',
      roles: ['manager']
    },
    { 
      path: '/chatbot', 
      icon: <FiMessageSquare size={iconSize} className="text-white" />, 
      label: 'AI Assistant',
      roles: ['manager', 'staff']
    }
  ];

  // Filter navigation items based on user role
  const allowedNavigationItems = navigationItems.map(item => {
    if (!item.roles.includes(userRole)) {
      return null;
    }

    if (item.subItems) {
      const filteredSubItems = item.subItems.filter(subItem => 
        !subItem.roles || subItem.roles.includes(userRole)
      );
      
      if (filteredSubItems.length === 0) {
        return null;
      }
      
      return {...item, subItems: filteredSubItems};
    }
    
    return item;
  }).filter(Boolean); // Remove null items

  const allowedRoutes = [
    '/dashboard', 
    '/orders', 
    '/inventory', 
    '/payroll', 
    '/chatbot', 
    '/menu', 
    '/expenses', 
    '/pos', 
    '/employees',
    '/self-checkout',
    '/timeclock'
  ];
  
  const shouldRender = allowedRoutes.some(route => location.pathname.startsWith(route));

  if (!shouldRender) return null;

  // Animation variants
  const sidebarVariants = {
    open: {
      width: windowWidth < 768 ? "100%" : sidebarWidth,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: {
      width: windowWidth < 768 ? "0" : '5rem',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "afterChildren"
      }
    }
  };
  
  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    closed: { 
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };
  
  const mobileNavVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }),
    hover: {
      scale: 1.05,
      x: 10,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { 
      scale: 0.95 
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: colors.accent, 
          color: colors.background 
        }}
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Container */}
      <motion.div
        className={`fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 flex flex-col`}
        style={{ 
          backgroundColor: colors.primary,
          width: sidebarWidth,
          borderRight: `1px solid ${colors.muted}`
        }}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Brand/Logo Section */}
        <div 
          className="flex flex-col items-center justify-center h-16 border-b"
          style={{ borderColor: colors.muted }}
        >
          <div className="font-bold text-white" style={{ fontSize: logoSize }}>RW</div>
          {/* Role indicator */}
          <div className="flex items-center mt-1">
            <FiShield size={12} className="text-white opacity-75 mr-1" />
            <span className="text-xs text-white opacity-75 capitalize">{userRole}</span>
          </div>
        </div>
        
        {/* Navigation Links - Now with overflow-y-auto for scrolling but no horizontal overflow */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-y-2 py-4 px-2 scrollbar-none">
          {allowedNavigationItems.map((item, index) => (
            <div key={item.path} className="relative">
              {item.subItems ? (
                <div
                  className="group flex flex-col items-center p-2 rounded-xl cursor-pointer"
                  style={{ 
                    backgroundColor: isParentActive(item.subItems) ? colors.activeBg : 'transparent',
                  }}
                  onClick={() => setOpenDropdown(openDropdown === item.path ? null : item.path)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <div className="absolute left-full ml-4 hidden group-hover:flex items-center">
                      <div 
                        className="relative whitespace-nowrap rounded-md bg-white px-4 py-2 font-semibold text-gray-900 drop-shadow-lg border border-gray-200"
                        style={{ fontSize: tooltipTextSize }}
                      >
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45" />
                        {item.label}
                      </div>
                    </div>
                  </div>
                  
                  <FiChevronDown 
                    size={chevronSize} 
                    className={`mt-1 transition-transform text-white ${
                      openDropdown === item.path ? 'rotate-180' : ''
                    }`}
                  />

                  {/* Dropdown menu - Fixed positioning to appear correctly outside narrow sidebar */}
                  {openDropdown === item.path && (
                    <div 
                      className="fixed left-[5rem] top-auto bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50"
                      style={{ 
                        width: dropdownWidth,
                        marginTop: '-2.5rem' // Position vertically aligned with parent icon
                      }}
                    >
                      {item.subItems.map(subItem => (
                        <div key={subItem.path || subItem.label}>
                          {subItem.onClick ? (
                            <button
                              onClick={subItem.onClick}
                              className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900 w-full text-left"
                            >
                              {subItem.icon}
                              <span className="ml-2 text-sm">{subItem.label}</span>
                            </button>
                          ) : (
                            <Link
                              to={subItem.path}
                              className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900"
                              onClick={() => windowWidth < 768 && setIsOpen(false)}
                            >
                              {subItem.icon}
                              <span className="ml-2 text-sm">{subItem.label}</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className="group flex items-center justify-center p-2 rounded-xl relative"
                  style={{ 
                    backgroundColor: isActive(item.path) ? colors.activeBg : 'transparent',
                  }}
                  onClick={() => windowWidth < 768 && setIsOpen(false)}
                >
                  {item.icon}
                  <div className="absolute left-full ml-4 hidden group-hover:flex items-center">
                    <div 
                      className="relative whitespace-nowrap rounded-md bg-white px-4 py-2 font-semibold text-gray-900 drop-shadow-lg border border-gray-200"
                      style={{ fontSize: tooltipTextSize }}
                    >
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45" />
                      {item.label}
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section - Always visible with sticky positioning */}
        <div className="sticky bottom-0 bg-inherit flex flex-col items-center gap-y-2 py-4 px-2 border-t mt-auto" style={{ borderColor: colors.muted }}>
          <button
            onClick={handleLogout}
            className="rounded-full bg-gray-100 flex items-center justify-center p-2 hover:bg-gray-200"
            title="Log Out"
          >
            <FiLogOut size={iconSize} className="text-gray-900" />
          </button>
        </div>
      </motion.div>

      {/* Mobile Header and Overlay - unchanged */}
      {windowWidth < 768 && (
        <div 
          className="fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm"
          style={{ backgroundColor: colors.background }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <img src="/vite.svg" alt="Logo" className="h-8" />
            <div className="flex flex-col">
              <span className="font-semibold" style={{ color: colors.primary }}>Ring & Wing</span>
              <span className="text-xs opacity-75 capitalize">{userRole}</span>
            </div>
          </motion.div>
          
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full"
            style={{ color: colors.primary }}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>
      )}

      {windowWidth < 768 && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;