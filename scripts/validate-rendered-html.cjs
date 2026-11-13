const fs = require('fs');

const routes = [
  { name: 'Home (/)', file: '.next/server/app/index.html' },
  { name: 'Services (/services)', file: '.next/server/app/services.html' },
  { name: 'Tariffs (/tariffs)', file: '.next/server/app/tariffs.html' },
  { name: 'Book (/book)', file: '.next/server/app/book.html' },
  { name: 'Contact (/contact)', file: '.next/server/app/contact.html' },
  { name: 'Terms (/terms)', file: '.next/server/app/terms.html' },
  { name: 'Admin (/admin)', file: '.next/server/app/admin.html' },
  { name: 'Admin Login (/admin/login)', file: '.next/server/app/admin/login.html' },
];

routes.forEach((r) => {
  console.log('====================================');
  console.log('ROUTE:', r.name);
  if (!fs.existsSync(r.file)) {
    console.log('FILE NOT FOUND:', r.file);
    return;
  }
  const html = fs.readFileSync(r.file, 'utf8');

  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'NONE');

  // Description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
  console.log('Description:', descMatch ? descMatch[1] : 'NONE');

  // Canonical
  const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  console.log('Canonical:', canonMatch ? canonMatch[1] : 'NONE');

  // Robots
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/);
  console.log('Robots:', robotsMatch ? robotsMatch[1] : 'NONE');

  // Open Graph
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
  const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/);
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
  console.log('OG Title:', ogTitle ? ogTitle[1] : 'NONE');
  console.log('OG Description:', ogDesc ? ogDesc[1] : 'NONE');
  console.log('OG URL:', ogUrl ? ogUrl[1] : 'NONE');
  console.log('OG Image:', ogImage ? ogImage[1] : 'NONE');

  // Twitter
  const twCard = html.match(/<meta\s+name="twitter:card"\s+content="([^"]*)"/);
  const twTitle = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/);
  const twDesc = html.match(/<meta\s+name="twitter:description"\s+content="([^"]*)"/);
  const twImg = html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/);
  console.log('Twitter Card:', twCard ? twCard[1] : 'NONE');
  console.log('Twitter Title:', twTitle ? twTitle[1] : 'NONE');
  console.log('Twitter Description:', twDesc ? twDesc[1] : 'NONE');
  console.log('Twitter Image:', twImg ? twImg[1] : 'NONE');

  // H1 tags
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  console.log('H1 Count:', h1Matches.length);
  h1Matches.forEach((m, i) => {
    const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`  H1 [${i + 1}]:`, text);
  });

  // JSON-LD scripts
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  console.log('JSON-LD Count:', jsonLdMatches.length);
  jsonLdMatches.forEach((m, i) => {
    try {
      const parsed = JSON.parse(m[1]);
      const types = Array.isArray(parsed) ? parsed.map((p) => p['@type']).join(', ') : parsed['@type'];
      console.log(`  JSON-LD [${i + 1}] Types:`, types);
    } catch (e) {
      console.log(`  JSON-LD [${i + 1}] PARSE ERROR:`, e.message);
    }
  });
});
