import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function OnboardingBot({ user }) {
  const isStarted = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem('tour-done') === 'true') return;
    if (isStarted.current) return;

    isStarted.current = true;

    const tour = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Aye, Captain!',
      nextBtnText: 'Next ➔',
      prevBtnText: '⬅ Prev',
      onDestroyed: () => {
        localStorage.setItem('tour-done', 'true');
      },
      popoverClass: 'bot-popover',
      steps: [
        {
          popover: {
            title: '🐌 Den Den Mushi Bot',
            description: 'Purururu! Welcome to Sabaody Skill Exchange! Let me show you around the Grand Line! (Skip if ye know the ropes).',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-nav-home',
          popover: {
            title: '🐌 Home',
            description: 'This is the main market plaza! You can see the hottest surging skills and all available mastery listings.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-nav-my-dashboard',
          popover: {
            title: '🐌 My Dashboard',
            description: 'Your personal captain\'s quarters. Track your purchased courses and token transaction history here.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-nav-explore-skills',
          popover: {
            title: '🐌 Explore Skills',
            description: 'Filter the market to show only Skill courses. Discover new Haki, Swordsmanship, and more!',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-nav-find-mentors',
          popover: {
            title: '🐌 Find Mentors',
            description: 'Switch the market view to browse Grand Line Masters directly and see all the skills they offer.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-nav-requests',
          popover: {
            title: '🐌 Requests',
            description: 'Your Vivre Card Inbox. Check the status of skills you requested or sessions you need to complete.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-nav-fleet-admin',
          popover: {
            title: '🐌 Fleet Admin',
            description: 'For Masters! Manage incoming requests from learners, accept/decline them, and track your teachings.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-wallet',
          popover: {
            title: '🐌 Treasure Chest',
            description: 'Your Vivre Card Tokens (VCT)! Manage your token balance and view your full ledger.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-pirate-rush',
          popover: {
            title: '🐌 Pirate Rush',
            description: 'Simulate a sudden spike in demand for a skill and watch its price skyrocket instantly!',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-skill-card',
          popover: {
            title: '🐌 Skill Posters & Mentor Cards',
            description: 'These are the skill cards! See live prices, demand surges, and ratings. Book directly here! Mentor cards (in the Mentors tab) work similarly but focus on the master\'s overall reputation.',
            side: 'top',
            align: 'start'
          }
        }
      ]
    });

    // Delay slightly to ensure DOM is fully rendered
    setTimeout(() => {
      tour.drive();
    }, 1500);
    
    return () => {
      tour.destroy();
    };
  }, [user]);

  return null;
}
