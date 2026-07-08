#!/usr/bin/env node

const checks = [
  ['marketing home', 'http://localhost:3020/'],
  ['marketing blog', 'http://localhost:3020/blog'],
  ['marketing blog post', 'http://localhost:3020/blog/event-driven-user-onboarding'],
  ['marketing pricing', 'http://localhost:3020/pricing'],
  ['marketing docs', 'http://localhost:3020/docs'],
  ['marketing sitemap', 'http://localhost:3020/sitemap.xml'],
  ['marketing rss', 'http://localhost:3020/rss.xml'],
  ['dashboard overview', 'http://localhost:3015/dashboard/overview'],
  ['dashboard analytics', 'http://localhost:3015/dashboard/analytics'],
  ['dashboard feature flags', 'http://localhost:3015/dashboard/feature-flags'],
  ['dashboard auth setup', 'http://localhost:3015/auth/setup-required'],
  ['dashboard products api', 'http://localhost:3015/api/products']
];

async function checkRoute([name, url]) {
  const response = await fetch(url, { redirect: 'manual' });
  const body = await response.text();
  const ok = response.status >= 200 && response.status < 400;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${response.status} ${url} bytes=${body.length}`);
  return ok;
}

async function main() {
  const results = [];
  for (const check of checks) {
    try {
      results.push(await checkRoute(check));
    } catch (error) {
      console.log(`FAIL ${check[0]} request-error ${check[1]} ${error.message}`);
      results.push(false);
    }
  }

  if (results.some((ok) => !ok)) {
    process.exitCode = 1;
    return;
  }
  console.log('Preview route verification passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
