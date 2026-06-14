// ─── Detail Pals V2 — Vercel Serverless: Market Rates ───────────────
// GET /api/market-rates
//
// Returns industry-average detailing price benchmarks.
// Optionally fetches from PRICING_BENCHMARK_URL (24h cache); falls back
// to a curated dataset. Mirrors old project's /api/market-rates/ route.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const FALLBACK_RATES = [
  { service: 'Basic Wash & Vacuum',   low: 80,   high: 150  },
  { service: 'Interior Deep Clean',   low: 120,  high: 220  },
  { service: 'Exterior Polish & Wax', low: 150,  high: 250  },
  { service: 'Full Detail Package',   low: 250,  high: 400  },
  { service: 'Ceramic Coating',       low: 500,  high: 1200 },
  { service: 'Paint Correction',      low: 350,  high: 700  },
];

// In-memory cache (lives for the function instance lifetime, ~minutes on Vercel free tier)
let cache: { data: typeof FALLBACK_RATES; ts: number } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return res.status(200).json(cache.data);
  }

  const benchmarkUrl = process.env.PRICING_BENCHMARK_URL;

  if (benchmarkUrl) {
    try {
      const upstream = await fetch(benchmarkUrl, { signal: AbortSignal.timeout(5000) });
      if (upstream.ok) {
        const data = await upstream.json() as typeof FALLBACK_RATES;
        cache = { data, ts: Date.now() };
        return res.status(200).json(data);
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Return curated fallback
  cache = { data: FALLBACK_RATES, ts: Date.now() };
  return res.status(200).json(FALLBACK_RATES);
}
