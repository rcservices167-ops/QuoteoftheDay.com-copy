import { Home, Laugh, FileText, MessageSquareQuote, Music, DollarSign, Trophy, Gamepad2 } from 'lucide-react';

interface NetworkSite {
  name: string;
  url: string;
  icon: React.ReactNode;
  emoji?: string;
}

export function FranchiseHeader() {
  const networkSites: NetworkSite[] = [
    {
      name: 'Home',
      url: 'https://AllofDay.com',
      icon: <Home className="w-5 h-5" />,
      emoji: '🌐'
    },
    {
      name: 'Joke',
      url: 'https://jokeofday.com',
      icon: <Laugh className="w-5 h-5" />,
      emoji: '😂'
    },
    {
      name: 'Fact',
      url: 'https://factofday.com',
      icon: <FileText className="w-5 h-5" />,
      emoji: '🧠'
    },
    {
      name: 'Quote',
      url: 'https://quoteofday.com',
      icon: <MessageSquareQuote className="w-5 h-5" />,
      emoji: '💬'
    },
    {
      name: 'Music',
      url: 'https://songofday.com',
      icon: <Music className="w-5 h-5" />,
      emoji: '🎵'
    },
    {
      name: 'Money',
      url: 'https://moneyofday.com',
      icon: <DollarSign className="w-5 h-5" />,
      emoji: '💰'
    },
    {
      name: 'Scores',
      url: 'https://scoresofday.com',
      icon: <Trophy className="w-5 h-5" />,
      emoji: '🏆'
    },
    {
      name: 'Game',
      url: 'https://gameofday.com',
      icon: <Gamepad2 className="w-5 h-5" />,
      emoji: '🎮'
    },
  ];

  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-2">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center gap-1 text-xs font-semibold">
            <span className="hidden sm:inline">Daily:</span>
          </div>

          <div className="flex items-center gap-1 justify-center flex-1 overflow-x-auto">
            {networkSites.map((site) => (
              <a
                key={site.name}
                href={site.url}
                className="flex items-center gap-1 px-2 py-1 hover:bg-white/20 rounded-lg transition-all duration-200 text-xs font-medium whitespace-nowrap"
                title={`Visit ${site.name} of Day`}
              >
                <span className="text-base">{site.emoji}</span>
                <span className="hidden sm:inline">{site.name}</span>
              </a>
            ))}
          </div>

          <a
            href="https://AllofDay.com"
            className="hidden lg:block px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
          >
            Visit all 8!
          </a>
        </nav>
      </div>
    </header>
  );
}
