import { useEffect, useState, useMemo } from "react";

type StockQuote = {
  symbol: string;
  price: number;
  changePct: number;
};

function App() {
  // list of tickers to show
  const TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"];

  const [data, setData] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const API_KEY = "d3v8jo1r01qt2ctokct0d3v8jo1r01qt2ctokctg"; // <-- put your Finnhub API key

        const requests = TICKERS.map(async (symbol) => {
          const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
          const res = await fetch(url);

          if (!res.ok) {
            throw new Error(`Failed to fetch ${symbol}`);
          }

          const json = await res.json();
          return {
            symbol,
            price: json.c,
            changePct: json.dp,
          } as StockQuote;
        });

        const results = await Promise.all(requests);
        setData(results);
      } catch (err: any) {
        setError(err.message || "Failed to load stock data.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, []);

  const filteredData = useMemo(() => {
    const lower = search.toLowerCase().trim();
    if (!lower) return data;
    return data.filter((row) => row.symbol.toLowerCase().includes(lower));
  }, [data, search]);

  return (
    <main className="px-4 py-8 max-w-4xl mx-auto">
      {/* Card container */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6">
        {/* Header / title */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Stock Price Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              Live quotes for popular tickers (demo).
            </p>
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64">
            <input
              className="w-full rounded-xl bg-gray-800 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search ticker (e.g. NVDA)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* Content area */}
        <section className="mt-6">
          {loading ? (
            // Loading state
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-transparent mb-3" />
              <p>Fetching latest market data…</p>
            </div>
          ) : error ? (
            // Error state
            <div className="bg-red-900/30 text-red-300 text-sm border border-red-700 rounded-xl p-4">
              <p className="font-medium mb-1">Error loading data</p>
              <p className="text-red-400">{error}</p>
              <p className="text-xs text-red-500 mt-2">
                (Check your API key / rate limit.)
              </p>
            </div>
          ) : (
            // Table
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-200">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-gray-700">
                    <th className="py-3 pr-6 font-medium">Symbol</th>
                    <th className="py-3 pr-6 font-medium">Price ($)</th>
                    <th className="py-3 pr-6 font-medium">% Change (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr
                      key={row.symbol}
                      className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3 pr-6 font-semibold text-white">
                        {row.symbol}
                      </td>
                      <td className="py-3 pr-6 tabular-nums">
                        {row.price ? row.price.toFixed(2) : "—"}
                      </td>
                      <td className="py-3 pr-6">
                        <span
                          className={
                            "inline-flex rounded-lg px-2 py-1 text-xs font-medium tabular-nums " +
                            (row.changePct > 0
                              ? "bg-green-900/30 text-green-300 border border-green-700/50"
                              : row.changePct < 0
                              ? "bg-red-900/30 text-red-300 border border-red-700/50"
                              : "bg-gray-800 text-gray-300 border border-gray-700/50")
                          }
                        >
                          {row.changePct
                            ? row.changePct.toFixed(2) + "%"
                            : "0.00%"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-10 text-gray-500 text-sm"
                      >
                        No matches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* tiny footer */}
        <footer className="mt-6 text-[11px] text-gray-500 text-center">
          Demo app • Data from Finnhub • Built with React + TypeScript +
          Tailwind
        </footer>
      </div>
    </main>
  );
}

export default App;
