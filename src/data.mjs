// 사이트 문구·이미지 데이터 — 문구를 바꾸려면 이 파일만 고치고 `npm run build` 하면 됩니다.

const img = (query, w, h, seq, orientation) =>
  `https://readdy.ai/api/search-image?query=${encodeURIComponent(query)}&width=${w}&height=${h}&seq=${seq}&orientation=${orientation}`;

export const images = {
  hero: img('Elegant quiet private concierge lounge with linen armchairs and low wooden table holding white orchids, floor to ceiling window looking onto a lush green garden, soft morning daylight, warm ivory and sage palette, understated luxury interior photography, calm and refined atmosphere', 1200, 1500, 'carebridge-hero-lounge-01', 'portrait'),
  tea: img('Refined tea service on a stone terrace beside a green courtyard garden, handmade ceramic cup and linen napkin on a low travertine table, soft dappled afternoon light through leaves, muted sage and ivory tones, editorial hospitality photography', 1100, 1400, 'carebridge-garden-tea-02', 'portrait'),
  journey: img('Softly blurred green garden foliage in low evening light, deep shadowed tones, minimal abstract natural texture, editorial moody photography with restrained colors', 1800, 1000, 'carebridge-journey-texture-03', 'landscape'),
};

export const gallery = [
  { src: img('Private car arriving at a quiet Seoul clinic entrance lined with trees, a concierge opening the door, soft autumn afternoon light, muted ivory and deep green palette, restrained editorial documentary photography', 1600, 1000, 'carebridge-visual-arrival-21', 'landscape'), caption: 'Arrival, arranged quietly' },
  { src: img('Calm private waiting room in a Seoul medical centre with wooden slat walls, linen chairs and a single green plant, diffused daylight through paper blinds, warm neutral tones, quiet luxury interior photography', 1600, 1000, 'carebridge-visual-waiting-22', 'landscape'), caption: 'A familiar face in the waiting room' },
  { src: img('A linen bound notebook with neat handwritten appointment notes beside a ceramic cup on a light wood table, soft window light, minimal still life editorial photography, ivory and sage tones', 1600, 1000, 'carebridge-visual-notes-23', 'landscape'), caption: 'A written summary after every visit' },
];

export const stats = [
  { value: '48', suffix: '+', label: 'Partner hospitals & clinics' },
  { value: '12', suffix: '', label: 'Languages supported' },
  { value: '1', suffix: ':1', label: 'A dedicated concierge per guest' },
  { value: '2', suffix: ' days', label: 'Average response to enquiries' },
];

export const attention = [
  { icon: 'ri-chat-smile-2-line', title: 'A dedicated English-speaking concierge', text: 'One person who knows your itinerary, your preferences and your correspondence from beginning to end.' },
  { icon: 'ri-user-follow-line', title: 'By your side at every appointment', text: 'A familiar face in the waiting room, interpreting the small details as well as the important ones.' },
  { icon: 'ri-shield-check-line', title: 'Considered around your privacy', text: 'Discreet coordination, confidential records and a service designed for absolute discretion.' },
];

export const journey = [
  { number: '01', title: 'We listen', text: 'A private conversation about your priorities, preferences and travel plans.', icon: 'ri-chat-voice-line' },
  { number: '02', title: 'We prepare', text: 'A tailored itinerary, appointment coordination and clear service arrangements.', icon: 'ri-calendar-check-line' },
  { number: '03', title: 'We accompany', text: 'Personal support on the ground, from arrival through your hospital visits.', icon: 'ri-walk-line' },
  { number: '04', title: 'We stay connected', text: 'Help coordinating follow-up communication after you return home.', icon: 'ri-mail-send-line' },
];

export const reviews = [
  { quote: 'I arrived not knowing how the week would work. By the time I left, everything had been arranged so quietly that I only had to think about my appointments.', name: 'Eleanor W.', location: 'London, United Kingdom', service: 'Medical coordination' },
  { quote: 'My companion stayed through every consultation and wrote a summary the same evening. It is the first time I have left a hospital understanding everything.', name: 'Daniel K.', location: 'San Francisco, United States', service: 'Personal accompaniment' },
  { quote: 'The transfer, the apartment, the small things in between — all of it was considered before I thought to ask. It made the city feel familiar very quickly.', name: 'Sophie L.', location: 'Paris, France', service: 'A seamless stay' },
  { quote: 'There was one person to write to, and they always knew the answer. For my mother, that calm was worth more than any arrangement.', name: 'Hiroshi T.', location: 'Tokyo, Japan', service: 'Personal accompaniment' },
  { quote: 'Discreet, unhurried and genuinely kind. Nothing felt like a service being delivered — more like being looked after by someone who had done this before.', name: 'Amelia R.', location: 'Melbourne, Australia', service: 'Medical coordination' },
];

export const services = [
  {
    slug: 'medical-coordination', number: '01', title: 'Medical coordination',
    tagline: 'Thoughtful appointment planning, shaped around your needs.',
    summary: 'Thoughtful appointment planning, hospital communication and document coordination, shaped around your needs.',
    detail: 'Appointment planning · Hospital liaison · Records & documents',
    intro: 'Before you travel, the practical work begins. We gather your preferences, speak with the hospital on your behalf and prepare the documents that make each visit straightforward. Nothing urgent, nothing rushed — simply the details arranged well in advance.',
    image: img('Quiet consultation desk with neatly arranged documents, a linen folder and a ceramic cup, soft window light, warm neutral interior, minimal editorial hospitality photography, calm and orderly atmosphere', 1400, 1000, 'carebridge-detail-coordination-11', 'landscape'),
    inclusions: ['Appointment planning aligned with your travel dates', 'Communication with the hospital before your arrival', 'Coordination of medical records and required documents', 'A written summary of your itinerary and next steps'],
    flow: [
      { title: 'An initial conversation', text: 'We learn your priorities, preferred dates and any existing correspondence with the hospital.' },
      { title: 'Arrangements in detail', text: 'Appointments are requested and confirmed, and a clear schedule is prepared for your review.' },
      { title: 'A confirmed itinerary', text: 'You receive one document with times, addresses, contacts and what to bring on the day.' },
    ],
    note: 'Coordination only. Medical assessment, diagnosis and treatment decisions remain with the licensed provider.',
  },
  {
    slug: 'personal-accompaniment', number: '02', title: 'Personal accompaniment',
    tagline: 'An English-speaking companion at the hospital.',
    summary: 'An English-speaking companion at the hospital, helping you navigate each visit with clarity and confidence.',
    detail: 'On-site support · Interpretation · Visit summaries',
    intro: 'Hospitals ask a great deal of attention. A familiar, English-speaking companion stays with you through registration, waiting rooms and consultations, so that the conversation is understood the first time and nothing is left to interpretation afterwards.',
    image: img('A calm companion walking beside a visitor through a light filled modern hospital corridor with warm wood walls and green plants, seen from behind, soft natural daylight, understated editorial photography, reassuring quiet mood', 1400, 1000, 'carebridge-detail-accompaniment-12', 'landscape'),
    inclusions: ['Accompaniment from arrival through departure each day', 'English interpretation during consultations', 'Support with forms, payments and hospital navigation', 'A short written summary after each visit'],
    flow: [
      { title: 'We meet before the visit', text: 'A short conversation to review the appointment, your questions and anything you hope to raise.' },
      { title: 'We stay with you', text: 'Your companion remains present through registration, consultation and any follow-up steps.' },
      { title: 'We close the loop', text: 'A brief written summary helps you remember what was discussed and what comes next.' },
    ],
    note: 'Interpretation and support only. Clinical advice is provided by the treating healthcare professionals.',
  },
  {
    slug: 'a-seamless-stay', number: '03', title: 'A seamless stay',
    tagline: 'Private transfer and accommodation, considered.',
    summary: 'Private transfer and accommodation coordination, with the practical details of your time in Korea considered.',
    detail: 'Transfers · Accommodation · Daily arrangements',
    intro: 'Time in an unfamiliar city should not feel like administration. We arrange your arrival, your accommodation and the small movements in between, so the days around your appointments stay unhurried.',
    image: img('Serene hotel suite in Seoul with linen bedding, a low wooden bench and a large window showing soft city greenery, warm neutral palette, quiet luxury interior photography, restful afternoon light', 1400, 1000, 'carebridge-detail-stay-13', 'landscape'),
    inclusions: ['Private airport transfer on arrival and departure', 'Accommodation options selected around your appointments', 'Daily transfers between your hotel and the hospital', 'Considered suggestions for the hours in between'],
    flow: [
      { title: 'Your arrival', text: 'A driver meets you at the airport and takes you directly to your accommodation.' },
      { title: 'Your days in Seoul', text: 'Transfers are timed around appointments, with space kept for rest.' },
      { title: 'Your departure', text: 'A final transfer is arranged with enough time for a calm departure.' },
    ],
    note: 'Travel and accommodation coordination only. Third-party supplier terms and availability apply.',
  },
];

export const serviceOptions = ['Medical coordination', 'Personal accompaniment', 'A seamless stay', 'Not sure yet'];
