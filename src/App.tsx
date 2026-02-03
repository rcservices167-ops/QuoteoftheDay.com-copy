import { ExternalHeader } from './components/ExternalHeader';
import { SiteInfo } from './components/SiteInfo';
import { ExternalFooter } from './components/ExternalFooter';
import { QuoteOfTheDay } from './components/QuoteOfTheDay';
import { PWAInstall } from './components/PWAInstall';
import { NotificationPrompt } from './components/NotificationPrompt';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ExternalHeader />
      <div className="px-2 md:px-4 py-1 md:py-2">
        <div className="container mx-auto max-w-7xl">
          <SiteInfo siteName="QuoteOftheDay.com" siteUrl="https://QuoteoftheDay.com" logoImage="/img/QuoteofDay_website2.png" countdownDuration="day" />
        </div>
      </div>
      <main className="flex-1">
        <QuoteOfTheDay />
        <PWAInstall />
        <NotificationPrompt />
      </main>
      <ExternalFooter />
    </div>
  );
}

export default App;
