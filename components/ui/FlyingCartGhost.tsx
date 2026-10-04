'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

export function FlyingCartGhost() {
  const { flyingGhosts } = useCart();
  const [targetCoords, setTargetCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const updateTarget = () => {
      const cartIcon = document.getElementById('storefront-header-cart-icon');
      if (cartIcon) {
        const rect = cartIcon.getBoundingClientRect();
        setTargetCoords({
          x: rect.left + rect.width / 2 - 20,
          y: rect.top + rect.height / 2 - 20,
        });
      } else {
        // Fallback to top right
        setTargetCoords({ x: window.innerWidth - 60, y: 24 });
      }
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {flyingGhosts.map((ghost) => (
          <motion.div
            key={ghost.id}
            initial={{
              left: ghost.startX,
              top: ghost.startY,
              scale: 1,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              left: [ghost.startX, (ghost.startX + targetCoords.x) / 2 - 40, targetCoords.x],
              top: [ghost.startY, Math.min(ghost.startY, targetCoords.y) - 60, targetCoords.y],
              scale: [1, 0.6, 0.15],
              rotate: [0, 10, 15],
              opacity: [1, 0.9, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed w-16 h-16 rounded-xl overflow-hidden shadow-floating border border-white/60 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ghost.image} alt="Ghost item" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
