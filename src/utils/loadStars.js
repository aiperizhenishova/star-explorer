// src/utils/loadStars.js

const VIZIER_URL = 'https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync';

const QUERY = `
  SELECT HIP, RAhms, DEdms, Vmag, Plx, pmRA, pmDE, SpType,
         RAICRS AS RAdeg, DEICRS AS DEdeg, "V-I" AS VI
  FROM "I/239/hip_main"
  WHERE Vmag <= 8.0
  AND Plx > 0
`;

async function fetchFromVizier() {
  const url = VIZIER_URL + '?' + new URLSearchParams({
    REQUEST: 'doQuery',
    LANG: 'ADQL',
    FORMAT: 'csv',
    QUERY: QUERY
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`VizieR error: ${res.status}`);
  return await res.text();
}

async function fetchFromLocal() {
  const res = await fetch('/hipparcos-voidmain.csv');
  if (!res.ok) throw new Error('local file not found');
  return await res.text();
}

export async function loadStarsCSV() {
  try {
    console.log('Loading from VizieR API...');
    const csv = await fetchFromVizier();
    console.log('VizieR: data received!');
    return csv;
  } catch (err) {
    console.warn('VizieR is unavailable, falling back to local file:', err);
    return await fetchFromLocal();
  }
}