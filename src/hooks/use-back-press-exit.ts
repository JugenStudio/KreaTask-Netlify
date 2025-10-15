
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/providers/language-provider';

/**
 * Hook to implement "press back again to exit" functionality on mobile.
 * When the user presses the back button on a target page, it shows a toast.
 * If they press back again within 2 seconds, it navigates them to the root ('/').
 */
export function useBackPressExit() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const backPressCount = useRef(0);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Increment the press count
      backPressCount.current += 1;

      // If this is the first press
      if (backPressCount.current === 1) {
        // Show a toast asking the user to press again
        toast({
          description: t('common.exit_prompt'),
          duration: 2000, // Toast duration
        });

        // Use pushState to "cancel" the back navigation by re-adding the current page to history
        history.pushState(null, '', location.href);

        // Set a timer to reset the count after 2 seconds
        setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);
      } else if (backPressCount.current === 2) {
        // If pressed twice, navigate to the root/exit page
        router.push('/');
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('popstate', handlePopState);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [toast, t, router]); // Dependencies for the effect
}
