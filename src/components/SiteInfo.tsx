import { useEffect, useState } from 'react';

interface SiteInfoProps {
  siteName: string;
  siteUrl: string;
  logoImage?: string;
  countdownDuration?: 'day' | 'quarter-hour';
}

export function SiteInfo({ siteName, siteUrl, logoImage, countdownDuration = 'day' }: SiteInfoProps) {
  const [mobileDate, setMobileDate] = useState('');
  const [desktopDate, setDesktopDate] = useState('');
  const [timeUntilUpdate, setTimeUntilUpdate] = useState('');

  useEffect(() => {
    // Mobile date: MM/DD/YY
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
    setMobileDate(today);

    // Desktop date: Full format (e.g., "Thursday, January 15, 2026")
    const fullDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    setDesktopDate(fullDate);

    const timer = setInterval(() => {
      const now = new Date();

      let targetTime: Date;

      if (countdownDuration === 'quarter-hour') {
        targetTime = new Date(now);
        const minutes = now.getMinutes();
        const nextQuarterMinutes = Math.ceil((minutes + 1) / 15) * 15;
        targetTime.setMinutes(nextQuarterMinutes, 0, 0);

        if (nextQuarterMinutes >= 60) {
          targetTime.setHours(targetTime.getHours() + 1);
          targetTime.setMinutes(0, 0, 0);
        }
      } else {
        targetTime = new Date();
        targetTime.setHours(24, 0, 0, 0);
      }

      const diff = targetTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilUpdate(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownDuration]);


return (
  /* 1) Main Wrapper: p-0 and h-fit ensure the blue border barely wraps the content */
  <div className="bg-white rounded-3xl shadow-2xl border-8 border-sky-600 p-0 overflow-hidden h-fit w-full">
    
    {/* 2) Row Container: items-stretch ensures all internal dividers reach the top and bottom borders */}
    <div className="flex flex-row items-stretch w-full">

      {/* PART 1: LOGO (50% Mobile | 33.33% Desktop) */}
      <div className="w-1/2 md:w-1/3 flex items-center justify-center bg-white">
        {logoImage ? (
          <img
            src={logoImage}
            alt={siteName}
            /* py-[5%] creates a tight 5% buffer above and below the logo image */
            className="w-full h-auto max-h-32 object-contain block py-[5%]" 
          />
        ) : (
          <h1 className="text-lg md:text-xl font-bold text-sky-900 text-center py-2">
            {siteName}
          </h1>
        )}
      </div>

      {/* MOBILE ONLY: 25% Date | 25% Timer (Totaling the other 50%) */}
      <div className="flex md:hidden w-1/2 flex-row items-stretch bg-white border-l border-sky-100">
        {/* Mobile Date Section (25% of total width) */}
        <div className="w-1/2 flex items-center justify-center px-1 text-center">
          <span className="text-[10px] font-bold text-sky-700 leading-tight">
            {mobileDate}
          </span>
        </div>
        {/* Mobile Timer Section (25% of total width) */}
        <div className="w-1/2 flex items-center justify-center border-l border-sky-100 px-1 text-center">
          <span className="text-[10px] font-mono font-bold text-sky-700 leading-tight">
            {timeUntilUpdate}
          </span>
        </div>
      </div>

      {/* DESKTOP ONLY: Middle & Right Columns (33.33% each) */}
      {/* PART 2: FULL DATE */}
      <div className="hidden md:flex md:w-1/3 items-center justify-center px-3 border-l border-sky-100 bg-white">
        <span className="text-sm font-semibold text-sky-700 text-center">
          {desktopDate}
        </span>
      </div>

      {/* PART 3: COUNTDOWN */}
      <div className="hidden md:flex md:w-1/3 items-center justify-center px-3 border-l border-sky-100 bg-white">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">Next Quote</span>
          <span className="text-sm font-mono font-semibold text-sky-700">
            {timeUntilUpdate}
          </span>
        </div>
      </div>
      
    </div>
  </div>
);
}
