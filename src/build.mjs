// 정적 페이지 생성기: node src/build.mjs → docs/ 폴더에 HTML 생성
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { images, gallery, stats, attention, journey, reviews, services, escortTypes } from './data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
// 파일 내용이 바뀌면 ?v= 값도 바뀌어서, 방문자 브라우저가 예전 파일을 쓰지 않게 함
const ver = (rel) => { const p = join(root, rel); return existsSync(p) ? createHash('md5').update(readFileSync(p)).digest('hex').slice(0, 8) : '0'; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// b = 사이트 루트까지의 상대경로 ('./', '../', '../../')
const home = (b, hash = '') => (b === './' ? (hash || './') : `${b}${hash}`);

const eyebrow = (text, { light = false, center = false } = {}) => `
<div class="flex items-center gap-3 ${center ? 'justify-center' : ''}"><span class="h-px w-8 ${light ? 'bg-background-50/50' : 'bg-foreground-400/60'}"></span><span class="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-label ${light ? 'text-background-100' : 'text-foreground-600'}">${esc(text)}</span></div>`;

const header = (b) => {
  const navCls = 'text-[13px] tracking-[0.12em] uppercase text-foreground-700 hover:text-primary-600 transition-colors whitespace-nowrap cursor-pointer';
  const mobCls = 'text-sm tracking-[0.12em] uppercase text-foreground-800 hover:text-primary-600 transition-colors cursor-pointer';
  const links = [
    ['Our services', `${b}services/`],
    ['Your journey', home(b, '#journey')],
    ['Guest reviews', home(b, '#reviews')],
    ['Private consultation', home(b, '#consultation')],
  ];
  return `
<header id="site-header" class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background-50/80 backdrop-blur-sm border-b border-transparent">
  <div class="w-full px-5 md:px-10">
    <div class="flex items-center justify-between h-[72px] md:h-20">
      <a class="flex items-center gap-3 md:gap-4 cursor-pointer group" href="${home(b)}" aria-label="Care Bridge — home">
        <img alt="Care Bridge" class="h-7 md:h-9 w-auto" src="${b}assets/logo.svg" width="1910" height="360">
        <span class="hidden sm:block pl-3 md:pl-4 border-l border-foreground-950/15 text-[9px] md:text-[10px] leading-tight tracking-[0.28em] text-foreground-500 uppercase font-label">Medical<br>Concierge</span>
      </a>
      <nav class="hidden lg:flex items-center gap-9">
        ${links.map(([n, h]) => `<a href="${h}" class="${navCls}">${n}</a>`).join('')}
        <a href="${home(b, '#consultation')}" class="ml-2 px-6 py-3 bg-primary-700 text-background-50 text-[12px] tracking-[0.16em] uppercase rounded-full hover:bg-primary-800 transition-colors whitespace-nowrap cursor-pointer">Enquire</a>
      </nav>
      <button id="menu-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" class="lg:hidden w-10 h-10 flex items-center justify-center text-foreground-900 cursor-pointer"><i class="text-2xl ri-menu-line"></i></button>
    </div>
  </div>
  <div id="mobile-menu" class="lg:hidden overflow-hidden transition-all duration-300 bg-background-50 border-t max-h-0 opacity-0 border-transparent">
    <div class="px-6 py-6 flex flex-col gap-5">
      ${links.map(([n, h]) => `<a href="${h}" class="${mobCls}">${n}</a>`).join('')}
      <a href="${home(b, '#consultation')}" class="mt-1 px-6 py-3 bg-primary-700 text-background-50 text-xs tracking-[0.16em] uppercase rounded-full text-center hover:bg-primary-800 transition-colors whitespace-nowrap cursor-pointer">Enquire</a>
    </div>
  </div>
</header>`;
};

const footer = (b) => {
  const li = (n, h) => `<li><a class="text-[13px] text-background-200 hover:text-background-50 transition-colors cursor-pointer" href="${h}">${n}</a></li>`;
  return `
<footer class="bg-foreground-950 text-background-100">
  <div class="mx-auto max-w-shell px-5 md:px-10 pt-14 md:pt-16 pb-8">
    <div class="grid md:grid-cols-12 gap-10 md:gap-8">
      <div class="md:col-span-6">
        <div class="flex items-center gap-4">
          <img alt="Care Bridge" class="h-8 w-auto" src="${b}assets/logo-light.svg" width="1910" height="360">
          <span class="pl-4 border-l border-background-50/20 text-[9px] leading-tight tracking-[0.28em] uppercase text-background-400">Private medical<br>concierge</span>
        </div>
        <p class="mt-6 max-w-md font-heading text-xl md:text-2xl leading-snug text-background-100">Exceptional care. A familiar presence.</p>
        <p class="mt-5 text-[11px] tracking-[0.2em] uppercase text-background-400">Seoul, Republic of Korea</p>
      </div>
      <div class="md:col-span-3">
        <h4 class="text-[10px] tracking-[0.28em] uppercase text-background-400 font-label"><a class="cursor-pointer hover:text-background-50 transition-colors" href="${b}services/">Services</a></h4>
        <ul class="mt-5 space-y-3">${services.map((s) => li(s.title, `${b}services/${s.slug}/`)).join('')}</ul>
      </div>
      <div class="md:col-span-3">
        <h4 class="text-[10px] tracking-[0.28em] uppercase text-background-400 font-label"><a class="cursor-pointer hover:text-background-50 transition-colors" href="${home(b, '#consultation')}">Enquiries</a></h4>
        <ul class="mt-5 space-y-3">${li('Our services', `${b}services/`)}${li('Your journey', home(b, '#journey'))}${li('Private consultation', home(b, '#consultation'))}</ul>
        <p class="mt-5 text-[12px] leading-relaxed text-background-400">Consultation requests are reviewed privately, one at a time.</p>
      </div>
    </div>
    <div class="mt-12 pt-7 border-t border-background-50/15">
      <p class="max-w-3xl text-[11px] leading-relaxed text-background-400">Care Bridge coordinates non-clinical support. Diagnosis, treatment and medical decisions remain with licensed healthcare providers. Services are subject to availability.</p>
      <div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-[11px] tracking-[0.1em] text-background-400">© 2026 Care Bridge. Seoul, Republic of Korea.</p>
        <p class="text-[10px] tracking-[0.22em] uppercase text-background-500">Personal attention · Absolute discretion</p>
      </div>
    </div>
  </div>
</footer>`;
};

const page = ({ b, title, description, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="icon" type="image/svg+xml" href="${b}assets/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css">
<link rel="stylesheet" href="${b}assets/styles.css?v=${ver('assets/styles.css')}">
</head>
<body>
<div class="min-h-screen bg-background-50 font-body">
${header(b)}
<main>
${body}
</main>
${footer(b)}
</div>
<script src="${b}assets/config.js?v=${ver('assets/config.js')}"></script>
<script src="${b}assets/site.js?v=${ver('assets/site.js')}"></script>
</body>
</html>
`;

// ───────────────────────── 홈 ─────────────────────────
const inputCls = 'mt-2 w-full box-border px-4 py-3 bg-background-50 border border-foreground-950/15 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500';
const labelCls = 'block text-[11px] tracking-[0.14em] uppercase text-foreground-600';

const homeBody = (b) => `
<section id="top" class="relative bg-background-50 pt-[72px] md:pt-20">
  <div class="mx-auto max-w-shell px-4 md:px-8 pt-4 md:pt-6">
    <div class="relative overflow-hidden rounded-[24px] md:rounded-[36px] border border-foreground-950/10 bg-gradient-to-br from-primary-100 via-background-100 to-accent-100">
      <div class="grid lg:grid-cols-2 items-stretch">
        <div class="px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-20 flex flex-col justify-center">
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-50/80 border border-foreground-950/10 backdrop-blur-sm text-[9px] md:text-[10px] tracking-[0.24em] uppercase text-foreground-700 w-fit"><span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>Seoul · Private medical concierge</span>
          <h1 class="mt-6 md:mt-8 font-heading text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[68px] xl:text-[76px] tracking-[-0.01em] text-foreground-950">Exceptional care.<br><span class="italic text-primary-700">A familiar presence.</span></h1>
          <p class="mt-6 max-w-[29rem] text-[14px] md:text-[15px] leading-[1.85] text-foreground-700">Your personal companion to healthcare in Korea. From the first conversation to your return home, every detail is thoughtfully taken care of.</p>
          <div class="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a href="#consultation" class="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-primary-700 text-background-50 text-[11px] tracking-[0.18em] uppercase rounded-full hover:bg-primary-800 transition-colors whitespace-nowrap cursor-pointer">Arrange a private consultation<i class="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i></a>
            <a href="${b}services/" class="inline-flex items-center justify-center gap-3 px-7 py-4 bg-background-50/70 border border-foreground-950/20 text-foreground-900 text-[11px] tracking-[0.18em] uppercase rounded-full hover:bg-background-50 transition-colors whitespace-nowrap cursor-pointer">Our services<i class="ri-arrow-right-line"></i></a>
          </div>
          <div class="mt-10 md:mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-foreground-600 font-label"><span>Personal attention</span><span class="h-px w-5 bg-foreground-400/60"></span><span>Absolute discretion</span><span class="h-px w-5 bg-foreground-400/60"></span><span>One point of contact</span></div>
        </div>
        <div class="relative w-full h-[320px] sm:h-[420px] lg:h-auto lg:min-h-[560px]">
          <img alt="A tranquil private lounge opening onto a green garden" title="Care Bridge private lounge Seoul medical concierge" class="absolute inset-0 w-full h-full object-cover object-top" src="${images.hero}">
          <div class="absolute inset-0 bg-gradient-to-t from-foreground-950/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-primary-100/70 lg:via-transparent lg:to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8"><p class="max-w-xs font-heading text-lg md:text-xl leading-snug text-background-50">A tranquil private lounge opening onto a green garden.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="bg-background-50">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-10 md:py-14">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 border-y border-foreground-950/10 py-8 md:py-10">
      ${stats.map((s) => `<div class="text-center lg:border-r lg:last:border-r-0 lg:border-foreground-950/10"><p class="flex items-baseline justify-center gap-0.5"><span class="font-heading text-4xl md:text-5xl lg:text-[56px] leading-none text-foreground-950">${s.value}</span><span class="font-heading text-lg md:text-xl text-primary-700">${esc(s.suffix)}</span></p><p class="mt-3 text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-foreground-500 font-label">${esc(s.label)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section id="attention" class="bg-background-50 border-t border-foreground-950/10">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-16 md:py-24 lg:py-28">
    <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      <div class="lg:col-span-6 lg:sticky lg:top-28">
        <div class="relative w-full h-[360px] sm:h-[460px] lg:h-[560px] bg-background-200"><img alt="Tea service beside a green garden courtyard" title="Care Bridge discreet personal attention Seoul" class="absolute inset-0 w-full h-full object-cover object-top" src="${images.tea}"></div>
      </div>
      <div class="lg:col-span-6 lg:pt-6">
        ${eyebrow('Personal attention · Absolute discretion')}
        <h2 class="mt-6 font-heading text-[2rem] leading-[1.15] sm:text-4xl lg:text-[46px] text-foreground-950">More than arrangements.<br><span class="italic text-primary-700">Reassurance.</span></h2>
        <p class="mt-6 max-w-xl text-[15px] leading-[1.9] text-foreground-600">There are practical questions, and there are quieter ones. Care Bridge is built around both — a calm, familiar presence that holds the details so you can hold your attention where it matters.</p>
        <div class="mt-10 md:mt-12 divide-y divide-foreground-950/10 border-y border-foreground-950/10">
          ${attention.map((a) => `<div class="flex gap-5 py-6 md:py-7"><span class="mt-0.5 w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary-50 text-primary-700"><i class="${a.icon} text-lg"></i></span><div><h3 class="font-heading text-xl md:text-[22px] leading-snug text-foreground-950">${esc(a.title)}</h3><p class="mt-2 text-[14px] leading-[1.8] text-foreground-600">${esc(a.text)}</p></div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section id="services" class="bg-background-100 border-t border-foreground-950/10">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-16 md:py-24 lg:py-28">
    <div class="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
      <div class="lg:col-span-7">${eyebrow('The art of being looked after')}<h2 class="mt-6 font-heading text-[2.1rem] leading-[1.12] sm:text-4xl lg:text-[52px] text-foreground-950">Our services</h2></div>
      <div class="lg:col-span-5">
        <p class="text-[15px] leading-[1.9] text-foreground-600">Three areas of support, arranged privately and adjusted to the shape of your stay. Each engagement begins with a conversation, not a package.</p>
        <a href="${b}services/" class="group mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-foreground-700 hover:text-primary-700 transition-colors whitespace-nowrap cursor-pointer">Explore all services<i class="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i></a>
      </div>
    </div>
    <div class="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground-950/10 border border-foreground-950/10">
      ${services.map((s) => `<a href="${b}services/${s.slug}/" class="group bg-background-50 p-6 md:p-8 lg:p-9 flex flex-col transition-colors duration-300 hover:bg-background-200/60 cursor-pointer"><span class="font-heading text-2xl text-accent-700">${s.number}</span><h3 class="mt-8 font-heading text-[26px] leading-tight text-foreground-950">${esc(s.title)}</h3><p class="mt-4 text-[14px] leading-[1.85] text-foreground-600 flex-1">${esc(s.summary)}</p><div class="mt-8 pt-5 border-t border-foreground-950/10 flex items-end justify-between gap-4"><p class="text-[10px] leading-relaxed tracking-[0.16em] uppercase text-foreground-500 font-label">${esc(s.detail)}</p><i class="ri-arrow-right-up-line text-lg text-foreground-500 group-hover:text-primary-700 transition-colors"></i></div></a>`).join('')}
    </div>
    <p class="mt-8 text-[12px] leading-relaxed text-foreground-500">Care Bridge coordinates non-clinical support. Diagnosis, treatment and medical decisions remain with licensed healthcare providers.</p>
  </div>
</section>

<section class="bg-background-50">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-14 md:py-20">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
      <div>${eyebrow('Inside the experience')}<h2 class="mt-5 font-heading text-[2rem] leading-[1.12] sm:text-4xl lg:text-[46px] text-foreground-950">Quietly considered,<br class="hidden sm:block"> from door to door.</h2></div>
      <p class="max-w-sm text-[14px] leading-[1.85] text-foreground-600">A few glimpses of the days we arrange — unhurried, discreet and shaped around the person rather than the schedule.</p>
    </div>
    <div class="mt-8 md:mt-10 relative">
      <div class="relative w-full h-[300px] sm:h-[420px] lg:h-[540px] rounded-[20px] md:rounded-[28px] overflow-hidden bg-background-200 group">
        <img alt="${esc(gallery[0].caption)}" title="Care Bridge private arrival Seoul" class="absolute inset-0 w-full h-full object-cover object-top" src="${gallery[0].src}">
        <div class="absolute inset-0 bg-gradient-to-t from-foreground-950/55 via-foreground-950/10 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-9 flex flex-wrap items-end justify-between gap-5">
          <div><p class="text-[9px] tracking-[0.26em] uppercase text-background-200">01 — Arrival</p><p class="mt-2 font-heading text-xl md:text-3xl text-background-50">${esc(gallery[0].caption)}</p></div>
          <button type="button" data-gallery-open="0" class="inline-flex items-center gap-3 px-5 py-3.5 rounded-full bg-background-50/95 text-foreground-900 text-[10px] tracking-[0.18em] uppercase hover:bg-background-50 transition-colors whitespace-nowrap cursor-pointer"><i class="ri-gallery-view-2 text-base"></i>View gallery</button>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-4">
        ${gallery.slice(1).map((g, i) => `<button type="button" data-gallery-open="${i + 1}" class="group relative w-full h-[130px] sm:h-[170px] rounded-[16px] overflow-hidden bg-background-200 cursor-pointer"><img alt="${esc(g.caption)}" title="Care Bridge service atmosphere Seoul" class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" src="${g.src}"><div class="absolute inset-0 bg-foreground-950/25 group-hover:bg-foreground-950/15 transition-colors"></div><span class="absolute bottom-3 left-4 right-4 text-left text-[10px] tracking-[0.14em] uppercase text-background-50">${esc(g.caption)}</span></button>`).join('')}
      </div>
    </div>
  </div>
  <div id="gallery-modal" class="hidden fixed inset-0 z-[60] bg-foreground-950/95 backdrop-blur-sm items-center justify-center p-4 md:p-10" role="dialog" aria-modal="true">
    <div class="relative w-full max-w-5xl" data-gallery-inner>
      <div class="relative w-full h-[52vh] md:h-[68vh] bg-foreground-900"><img id="gallery-img" alt="" class="absolute inset-0 w-full h-full object-contain" src=""></div>
      <div class="mt-4 flex items-center justify-between gap-4">
        <p id="gallery-caption" class="font-heading text-lg md:text-xl text-background-50"></p>
        <div class="flex items-center gap-2">
          <button type="button" data-gallery-prev aria-label="Previous image" class="w-10 h-10 flex items-center justify-center rounded-full border border-background-50/30 text-background-50 hover:bg-background-50/15 transition-colors cursor-pointer"><i class="ri-arrow-left-line"></i></button>
          <button type="button" data-gallery-next aria-label="Next image" class="w-10 h-10 flex items-center justify-center rounded-full border border-background-50/30 text-background-50 hover:bg-background-50/15 transition-colors cursor-pointer"><i class="ri-arrow-right-line"></i></button>
          <button type="button" data-gallery-close aria-label="Close gallery" class="w-10 h-10 flex items-center justify-center rounded-full bg-background-50 text-foreground-900 hover:bg-background-100 transition-colors cursor-pointer"><i class="ri-close-line text-lg"></i></button>
        </div>
      </div>
    </div>
  </div>
  <script>window.CB_GALLERY = ${JSON.stringify(gallery)};</script>
</section>

<section id="journey" class="relative bg-foreground-950 text-background-50 overflow-hidden">
  <div class="absolute inset-0 opacity-[0.12]"><img alt="" aria-hidden="true" class="w-full h-full object-cover object-top" src="${images.journey}"></div>
  <div class="relative mx-auto max-w-shell px-5 md:px-10 py-16 md:py-24">
    <div class="text-center">
      ${eyebrow('Your journey, considered', { light: true, center: true })}
      <h2 class="mt-5 font-heading text-[2rem] leading-[1.15] sm:text-4xl lg:text-[48px] text-background-50">One point of contact.<br class="sm:hidden"> <span class="italic text-accent-300">Every step of the way.</span></h2>
    </div>
    <div class="mt-9 hidden lg:flex items-center justify-center gap-3 flex-wrap">
      ${journey.map((j, i) => `<div class="flex items-center gap-3"><span class="text-[10px] tracking-[0.18em] uppercase text-background-200 px-4 py-2 rounded-full border border-background-50/25">${esc(j.title)}</span>${i < journey.length - 1 ? '<i class="ri-arrow-right-s-line text-background-400"></i>' : ''}</div>`).join('')}
    </div>
    <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      ${journey.map((j) => `<div class="group relative rounded-[18px] border border-background-50/15 bg-background-50/[0.04] backdrop-blur-sm p-6 md:p-7 hover:bg-background-50/[0.08] transition-colors"><div class="flex items-center justify-between"><span class="w-11 h-11 flex items-center justify-center rounded-full bg-accent-300/15 text-accent-200"><i class="${j.icon} text-lg"></i></span><span class="font-heading text-xl tracking-[0.14em] text-accent-300">${j.number}</span></div><h3 class="mt-6 font-heading text-2xl leading-tight text-background-50">${esc(j.title)}</h3><p class="mt-3 text-[13px] leading-[1.8] text-background-200/85">${esc(j.text)}</p></div>`).join('')}
    </div>
    <p class="mt-10 text-center text-[11px] tracking-[0.16em] uppercase text-background-400">Non-clinical coordination · Clinical care remains with licensed providers</p>
  </div>
</section>

<section id="reviews" class="bg-background-100 border-t border-foreground-950/10">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-16 md:py-24">
    <div class="text-center">
      ${eyebrow('In their words', { center: true })}
      <h2 class="mt-5 font-heading text-[2rem] leading-[1.15] sm:text-4xl lg:text-[46px] text-foreground-950">Guests who have walked this way</h2>
      <p class="mx-auto mt-4 max-w-xl text-[14px] leading-[1.85] text-foreground-600">Shared with permission, names abbreviated. Every engagement is private, and so are the details.</p>
    </div>
    <div class="relative mt-10 md:mt-14 mx-auto max-w-4xl">
      <div class="absolute -top-4 left-0 right-0 flex justify-between md:-left-4 md:-right-4 md:top-1/2 md:-translate-y-1/2">
        <button type="button" data-review-prev aria-label="Previous review" class="w-11 h-11 flex items-center justify-center rounded-full bg-background-50 border border-foreground-950/15 text-foreground-800 hover:bg-background-200 transition-colors cursor-pointer"><i class="ri-arrow-left-line text-lg"></i></button>
        <button type="button" data-review-next aria-label="Next review" class="w-11 h-11 flex items-center justify-center rounded-full bg-background-50 border border-foreground-950/15 text-foreground-800 hover:bg-background-200 transition-colors cursor-pointer"><i class="ri-arrow-right-line text-lg"></i></button>
      </div>
      <div class="bg-background-50 border border-foreground-950/10 rounded-[20px] md:rounded-[28px] px-6 py-10 md:px-14 md:py-14 text-center">
        <i class="ri-double-quotes-l text-3xl md:text-4xl text-accent-500"></i>
        <blockquote id="review-quote" class="mt-5 font-heading text-xl leading-[1.55] sm:text-2xl md:text-[30px] md:leading-[1.5] text-foreground-950">${esc(reviews[0].quote)}</blockquote>
        <div class="mt-7 flex flex-col items-center gap-1.5">
          <p id="review-name" class="text-[12px] tracking-[0.18em] uppercase text-foreground-800">${esc(reviews[0].name)}</p>
          <p id="review-location" class="text-[11px] text-foreground-500">${esc(reviews[0].location)}</p>
          <p id="review-service" class="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-[10px] tracking-[0.12em] uppercase text-primary-700">${esc(reviews[0].service)}</p>
        </div>
      </div>
      <div class="mt-6 flex items-center justify-center gap-4">
        <div id="review-dots" class="flex items-center gap-2">
          ${reviews.map((_, i) => `<button type="button" data-review-dot="${i}" aria-label="Go to review ${i + 1}" class="h-1.5 rounded-full transition-all cursor-pointer ${i === 0 ? 'w-7 bg-primary-600' : 'w-1.5 bg-foreground-300 hover:bg-foreground-400'}"></button>`).join('')}
        </div>
        <span id="review-count" class="text-[10px] tracking-[0.18em] uppercase text-foreground-500 font-label">01 / ${String(reviews.length).padStart(2, '0')}</span>
      </div>
    </div>
  </div>
  <script>window.CB_REVIEWS = ${JSON.stringify(reviews)};</script>
</section>

<section id="consultation" class="bg-background-100 border-t border-foreground-950/10">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-16 md:py-24 lg:py-28">
    <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      <div class="lg:col-span-5">
        ${eyebrow('A personal beginning')}
        <h2 class="mt-6 font-heading text-[2.1rem] leading-[1.12] sm:text-4xl lg:text-[50px] text-foreground-950">Your peace of mind<br><span class="italic text-primary-700">begins here.</span></h2>
        <p class="mt-6 max-w-md text-[15px] leading-[1.9] text-foreground-600">Share a few details and a dedicated concierge will help you explore a stay shaped around you. Consultation requests are reviewed privately, one at a time.</p>
        <div class="mt-9 divide-y divide-foreground-950/10 border-y border-foreground-950/10">
          ${[['ri-time-line', 'Response time', 'Enquiries are answered within two business days.'], ['ri-lock-line', 'Discretion', 'Details are kept confidential and never shared without your consent.'], ['ri-shield-check-line', 'Scope of service', 'Non-clinical coordination only. Clinical care remains with licensed providers.']].map(([ic, t, d]) => `<div class="flex items-start gap-4 py-4"><i class="${ic} text-lg text-primary-700 mt-0.5"></i><div><p class="text-[11px] tracking-[0.16em] uppercase text-foreground-500 font-label">${t}</p><p class="mt-1 text-[14px] leading-relaxed text-foreground-700">${d}</p></div></div>`).join('')}
        </div>
        <p class="mt-6 text-[11px] tracking-[0.2em] uppercase text-foreground-500">Consultation enquiries · Coming soon</p>
      </div>
      <div class="lg:col-span-7">
        <div class="bg-background-50 border border-foreground-950/10 p-6 md:p-9">
          <p class="text-[10px] tracking-[0.28em] uppercase text-foreground-500 font-label">Private consultation request</p>
          <div id="form-success" class="mt-6 hidden">
            <span class="inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-100 text-primary-700"><i class="ri-check-line text-xl"></i></span>
            <h3 class="mt-5 font-heading text-2xl text-foreground-950">Thank you for reaching out.</h3>
            <p class="mt-3 text-[14px] leading-[1.85] text-foreground-600">Your enquiry has been received. A dedicated concierge will review your request and respond with availability in due course.</p>
            <button type="button" id="form-again" class="mt-6 px-5 py-3 border border-foreground-950/20 text-[11px] tracking-[0.16em] uppercase text-foreground-800 hover:bg-background-100 transition-colors whitespace-nowrap cursor-pointer">Send another request</button>
          </div>
          <form id="carebridge-consultation-form" class="mt-5" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="min-w-0"><label for="cb-name" class="${labelCls}">Full name</label><input id="cb-name" name="name" type="text" required autocomplete="name" placeholder="Your name" maxlength="100" class="${inputCls}"></div>
              <div class="min-w-0"><label for="cb-email" class="${labelCls}">Email</label><input id="cb-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com" maxlength="150" class="${inputCls}"></div>
              <div class="min-w-0"><label for="cb-phone" class="${labelCls}">Phone (with country code)</label><input id="cb-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="e.g. +65 9123 4567" maxlength="40" pattern="^\\+?[0-9\\(\\)\\-\\s\\.]{7,}$" title="Please include your country code, e.g. +65 9123 4567" class="${inputCls}"></div>
              <div class="min-w-0"><label for="cb-country" class="${labelCls}">Country of residence</label><input id="cb-country" name="country" type="text" autocomplete="country-name" placeholder="e.g. Singapore" maxlength="80" class="${inputCls}"></div>
              <div class="min-w-0"><label for="cb-dates" class="${labelCls}">Approximate travel dates</label><input id="cb-dates" name="travel_dates" type="text" placeholder="e.g. March 2026" maxlength="80" class="${inputCls}"></div>
              <div class="min-w-0"><label for="cb-service" class="${labelCls}">Type of medical escort</label><select id="cb-service" name="service" class="mt-2 w-full box-border px-4 py-3 bg-background-50 border border-foreground-950/15 text-sm text-foreground-900 focus:outline-none focus:border-primary-500 cursor-pointer"><option value="" selected>Select a type of visit</option>${escortTypes.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></div>
              <div class="min-w-0 sm:col-span-2"><label for="cb-message" class="${labelCls}">How can we help?</label><textarea id="cb-message" name="message" rows="4" maxlength="500" placeholder="Share your priorities, preferences and any arrangements already in place." class="mt-2 w-full box-border px-4 py-3 bg-background-50 border border-foreground-950/15 text-sm leading-relaxed text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 resize-none"></textarea></div>
            </div>
            <div class="field-honeypot" aria-hidden="true"><label for="cb-website-alt">Company website</label><input id="cb-website-alt" name="contact_alt" type="text" tabindex="-1" autocomplete="off"></div>
            <p id="form-error" class="hidden mt-4 text-[12px] leading-relaxed text-primary-800 bg-primary-50 border border-primary-200 px-4 py-3"></p>
            <div class="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <button type="submit" id="form-submit" class="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-700 text-background-50 text-[11px] tracking-[0.18em] uppercase hover:bg-primary-800 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"><span data-label>Send request</span><i data-arrow class="ri-arrow-right-line text-sm"></i></button>
              <p class="text-[11px] leading-relaxed text-foreground-500">Your details are held privately and used only to respond to this enquiry.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ───────────────────────── 서비스 목록 ─────────────────────────
const servicesBody = (b) => `
<section class="bg-background-50 pt-[72px] md:pt-20 border-b border-foreground-950/10">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-14 md:py-20 lg:py-24">
    ${eyebrow('Seoul, South Korea · Private medical concierge')}
    <div class="mt-7 grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
      <div class="lg:col-span-7"><h1 class="font-heading text-[2.6rem] leading-[1.06] sm:text-6xl lg:text-[76px] text-foreground-950">Our services</h1></div>
      <div class="lg:col-span-5"><p class="text-[15px] leading-[1.9] text-foreground-600">The art of being looked after. Three areas of non-clinical support, arranged privately and adjusted to the shape of your stay in Korea.</p></div>
    </div>
  </div>
</section>
<section class="bg-background-50">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-14 md:py-20">
    <div class="flex flex-col gap-14 md:gap-24">
      ${services.map((s, i) => `<article class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div class="relative w-full h-[280px] sm:h-[380px] lg:h-[460px] bg-background-200 ${i % 2 ? 'lg:order-2' : ''}"><img alt="${esc(s.title)}" title="Care Bridge ${esc(s.title)} Seoul" class="absolute inset-0 w-full h-full object-cover object-top" src="${s.image}"></div>
        <div class="${i % 2 ? 'lg:order-1' : ''}">
          <div class="flex items-baseline gap-4"><span class="font-heading text-2xl text-accent-700">${s.number}</span><span class="h-px flex-1 bg-foreground-950/15"></span></div>
          <h2 class="mt-5 font-heading text-[1.9rem] leading-[1.15] sm:text-4xl lg:text-[44px] text-foreground-950">${esc(s.title)}</h2>
          <p class="mt-4 text-[15px] leading-[1.9] text-foreground-600">${esc(s.summary)}</p>
          <ul class="mt-7 space-y-3">${s.inclusions.slice(0, 3).map((x) => `<li class="flex items-start gap-3 text-[14px] leading-relaxed text-foreground-700"><i class="ri-check-line text-primary-600 mt-0.5"></i><span>${esc(x)}</span></li>`).join('')}</ul>
          <a href="${b}services/${s.slug}/" class="group mt-8 inline-flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-foreground-900 border-b border-foreground-950/30 pb-2 hover:border-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap cursor-pointer">View service details<i class="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i></a>
        </div>
      </article>`).join('')}
    </div>
    <div class="mt-16 md:mt-24 p-6 md:p-10 bg-background-100 border border-foreground-950/10">
      <div class="grid lg:grid-cols-12 gap-6 items-center">
        <div class="lg:col-span-8"><h2 class="font-heading text-2xl md:text-3xl leading-snug text-foreground-950">More than arrangements. Reassurance.</h2><p class="mt-3 max-w-2xl text-[14px] leading-[1.85] text-foreground-600">Every engagement begins with a private conversation. Tell us what would make your time in Korea feel considered, and we will shape the support around it.</p></div>
        <div class="lg:col-span-4 lg:text-right"><a href="${b}#consultation" class="inline-flex items-center gap-3 px-7 py-4 bg-primary-700 text-background-50 text-[11px] tracking-[0.18em] uppercase rounded-full hover:bg-primary-800 transition-colors whitespace-nowrap cursor-pointer">Arrange a consultation<i class="ri-arrow-right-line"></i></a></div>
      </div>
    </div>
    <p class="mt-8 text-[12px] leading-relaxed text-foreground-500">Care Bridge coordinates non-clinical support. Diagnosis, treatment and medical decisions remain with licensed healthcare providers. Services are subject to availability.</p>
  </div>
</section>`;

// ───────────────────────── 서비스 상세 ─────────────────────────
const detailBody = (b, s) => `
<section class="bg-background-50 pt-[72px] md:pt-20">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-10 md:py-14">
    <a href="${b}services/" class="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-foreground-500 hover:text-primary-700 transition-colors whitespace-nowrap cursor-pointer"><i class="ri-arrow-left-line"></i>All services</a>
    <div class="mt-8 grid lg:grid-cols-12 gap-8 lg:gap-14 items-end">
      <div class="lg:col-span-7">${eyebrow(`Service ${s.number}`)}<h1 class="mt-6 font-heading text-[2.5rem] leading-[1.06] sm:text-5xl lg:text-[68px] text-foreground-950">${esc(s.title)}</h1></div>
      <div class="lg:col-span-5"><p class="font-heading text-xl md:text-2xl leading-snug text-primary-700 italic">${esc(s.tagline)}</p></div>
    </div>
  </div>
</section>
<section class="bg-background-50">
  <div class="mx-auto max-w-shell px-5 md:px-10"><div class="relative w-full h-[300px] sm:h-[420px] lg:h-[540px] bg-background-200"><img alt="${esc(s.title)}" title="Care Bridge ${esc(s.title)} Seoul" class="absolute inset-0 w-full h-full object-cover object-top" src="${s.image}"></div></div>
</section>
<section class="bg-background-50">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-14 md:py-20">
    <div class="grid lg:grid-cols-12 gap-10 lg:gap-16">
      <div class="lg:col-span-7">
        <h2 class="font-heading text-[1.8rem] leading-snug sm:text-3xl text-foreground-950">What this looks like</h2>
        <p class="mt-5 text-[15px] leading-[2] text-foreground-600">${esc(s.intro)}</p>
        <div class="mt-10 md:mt-12">
          <p class="text-[10px] tracking-[0.28em] uppercase text-foreground-500 font-label">Included</p>
          <ul class="mt-5 divide-y divide-foreground-950/10 border-y border-foreground-950/10">${s.inclusions.map((x) => `<li class="flex items-start gap-4 py-4"><i class="ri-check-line text-primary-600 mt-0.5"></i><span class="text-[14px] leading-relaxed text-foreground-800">${esc(x)}</span></li>`).join('')}</ul>
        </div>
      </div>
      <aside class="lg:col-span-5">
        <div class="bg-background-100 border border-foreground-950/10 p-6 md:p-8">
          <p class="text-[10px] tracking-[0.28em] uppercase text-foreground-500 font-label">How it works</p>
          <div class="mt-5 space-y-6">${s.flow.map((f, i) => `<div class="flex gap-4"><span class="font-heading text-sm tracking-[0.16em] text-accent-700 mt-1">${String(i + 1).padStart(2, '0')}</span><div><h3 class="font-heading text-lg leading-snug text-foreground-950">${esc(f.title)}</h3><p class="mt-1.5 text-[13px] leading-[1.8] text-foreground-600">${esc(f.text)}</p></div></div>`).join('')}</div>
        </div>
        <div class="mt-6 p-5 border-l-2 border-primary-500 bg-primary-50/60"><p class="text-[12px] leading-[1.85] text-foreground-700">${esc(s.note)}</p></div>
        <a href="${b}#consultation" class="mt-6 inline-flex w-full items-center justify-center gap-3 px-7 py-4 bg-primary-700 text-background-50 text-[11px] tracking-[0.18em] uppercase hover:bg-primary-800 transition-colors whitespace-nowrap cursor-pointer">Arrange a private consultation<i class="ri-arrow-right-line"></i></a>
      </aside>
    </div>
  </div>
</section>
<section class="bg-background-100 border-t border-foreground-950/10">
  <div class="mx-auto max-w-shell px-5 md:px-10 py-14 md:py-20">
    <div class="flex items-end justify-between gap-6"><h2 class="font-heading text-2xl md:text-[32px] text-foreground-950">Considered alongside</h2><a href="${b}services/" class="text-[10px] tracking-[0.22em] uppercase text-foreground-600 hover:text-primary-700 transition-colors whitespace-nowrap cursor-pointer">All services</a></div>
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground-950/10 border border-foreground-950/10">
      ${services.filter((o) => o.slug !== s.slug).map((o) => `<a href="${b}services/${o.slug}/" class="group bg-background-50 p-6 md:p-8 flex flex-col hover:bg-background-200/60 transition-colors cursor-pointer"><span class="font-heading text-xl text-accent-700">${o.number}</span><h3 class="mt-4 font-heading text-2xl leading-tight text-foreground-950">${esc(o.title)}</h3><p class="mt-3 text-[14px] leading-[1.85] text-foreground-600 flex-1">${esc(o.summary)}</p><span class="mt-6 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-foreground-700">Details<i class="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i></span></a>`).join('')}
    </div>
  </div>
</section>`;

// ───────────────────────── 쓰기 ─────────────────────────
const out = (rel, html) => { const p = join(root, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); console.log('wrote', rel); };

out('index.html', page({ b: './', title: 'Care Bridge | Private Medical Concierge in Seoul, Korea', description: 'Your personal companion to healthcare in Korea. Medical coordination, English-speaking hospital accompaniment and a seamless stay in Seoul.', body: homeBody('./') }));
out('services/index.html', page({ b: '../', title: 'Our services | Care Bridge Medical Concierge, Seoul', description: 'Three areas of non-clinical support: medical coordination, personal accompaniment and a seamless stay in Korea.', body: servicesBody('../') }));
for (const s of services) {
  out(`services/${s.slug}/index.html`, page({ b: '../../', title: `${s.title} | Care Bridge Medical Concierge, Seoul`, description: s.summary, body: detailBody('../../', s) }));
}
writeFileSync(join(root, '.nojekyll'), '');
