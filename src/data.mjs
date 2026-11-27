// 사이트 문구·이미지 데이터 — 문구를 바꾸려면 이 파일만 고치고 `npm run build` 하면 됩니다.

// 사진: Unsplash (Unsplash License — 무료, 출처 표기 의무 없음). 공식 이미지 서버에서 크기에 맞춰 불러옵니다.
const img = (id, w, h) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=75`;

export const images = {
  hero: img('photo-1672797494267-affab75c2bc0', 1200, 1500),
  tea: img('photo-1772485718316-8cd1d3838ffa', 1100, 1400),
  journey: img('photo-1493673272479-a20888bcee10', 1800, 1000),
};

export const gallery = [
  { src: img('photo-1642552668086-ba7fb7f894ce', 1600, 1000), caption: 'Arrival, arranged quietly' },
  { src: img('photo-1762625570087-6d98fca29531', 1600, 1000), caption: 'A familiar face in the waiting room' },
  { src: img('photo-1554757387-2a28855c78fb', 1600, 1000), caption: 'A written summary after every visit' },
];

export const stats = [
  { value: '48', suffix: '+', label: 'Partner hospitals & clinics' },
  { value: '12', suffix: '', label: 'Languages supported' },
  { value: '1', suffix: ':1', label: 'A dedicated concierge per guest' },
  { value: '24', suffix: '/7', label: 'Concierges on standby · reply within 12h' },
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
    tagline: 'The right doctor, and every step around the visit, arranged.',
    summary: 'Trusted doctor and hospital recommendations, appointments and every step of the paperwork — from registration and payment to medical documents and insurance claims.',
    detail: 'Doctor & hospital matching · Appointments · Documents & insurance claims',
    intro: 'Before you travel, the practical work begins. We recommend trusted doctors and hospitals for your needs, book your appointments and speak with the hospital on your behalf. On the day, we take care of registration and payment; afterwards, we request your medical documents and help you claim from your insurer. Nothing rushed — simply every detail arranged well in advance.',
    image: img('photo-1544377193-33dcf4d68fb5', 1400, 1000),
    inclusions: [
      'Recommendations of trusted doctors and hospitals for your needs',
      'Appointment booking aligned with your travel dates',
      'Registration and payment handled on the day of your visit',
      'Requests to the hospital for medical records, certificates and other documents',
      'Insurance claim support, from paperwork to submission',
      'Communication with the hospital before your arrival',
      'A written summary of your itinerary and next steps',
    ],
    flow: [
      { title: 'The right match', text: 'We learn your needs and recommend trusted doctors and hospitals, with the reasons for each.' },
      { title: 'Booked and prepared', text: 'Appointments are confirmed and the hospital is briefed before you arrive. You receive one clear itinerary.' },
      { title: 'On the day', text: 'Registration and payment are taken care of, so your attention stays on the consultation.' },
      { title: 'Documents and claims', text: 'We request your medical documents from the hospital and help you file your insurance claim.' },
    ],
    note: 'Coordination only. Medical assessment, diagnosis and treatment decisions remain with the licensed provider. Insurance claim outcomes are decided by your insurer.',
  },
  {
    slug: 'personal-accompaniment', number: '02', title: 'Personal accompaniment',
    tagline: 'An English-speaking companion beside you, and a clear report after.',
    summary: 'An English-speaking companion who interprets between you and your doctors and nurses, followed by a written report on your results and how to look after yourself at home.',
    detail: 'Interpretation · On-site support · Results & aftercare report',
    intro: 'Hospitals ask a great deal of attention. A familiar, English-speaking companion stays with you through every visit, helping you communicate with doctors and nurses and interpreting medical explanations on the spot, so nothing is lost in translation. Afterwards, you receive a written report of your results and how to manage your care once you are home.',
    image: img('photo-1777269749032-d8d458ae594d', 1400, 1000),
    inclusions: [
      'An English-speaking companion throughout each hospital visit',
      'Smooth communication with your doctors and nurses',
      'On-the-spot interpretation of medical explanations',
      'A written report of your consultation and test results',
      'Aftercare guidance for managing your health once you are home',
      'Support with forms, payments and hospital navigation',
    ],
    flow: [
      { title: 'We meet before the visit', text: 'A short conversation to review the appointment, your questions and anything you hope to raise.' },
      { title: 'We interpret in the room', text: 'Your companion helps you speak with doctors and nurses, and interprets their medical explanations as they are given.' },
      { title: 'A report to take home', text: 'You receive a written report of your results and how to look after yourself once you return home.' },
    ],
    note: 'Interpretation and support only. Clinical advice is provided by the treating healthcare professionals; your report summarises what they explained.',
  },
  {
    slug: 'a-seamless-stay', number: '03', title: 'A seamless stay',
    tagline: 'Where to stay, how to get there, and what to enjoy in between.',
    summary: 'A shortlist of safe, well-connected places to stay, airport pick-up, and curated sights and restaurants around your appointments — with reservations made for you.',
    detail: 'Airport pick-up · Accommodation · Sights & dining',
    intro: 'Time in an unfamiliar city should not feel like administration. We shortlist safe accommodation with easy transport and plenty nearby, meet you at the airport, and suggest places to see and restaurants to enjoy before and after your appointments. If you would like a table somewhere, we will book it for you.',
    image: img('photo-1621891334481-5c14b369d9d7', 1400, 1000),
    inclusions: [
      'A shortlist of safe stays with easy transport and plenty to see nearby',
      'Airport pick-up on arrival',
      'Sightseeing spots to enjoy before and after your appointments',
      'Restaurant recommendations around your schedule',
      'Restaurant reservations made on your behalf, on request',
      'Transfers between your accommodation and the hospital',
    ],
    flow: [
      { title: 'Before you fly', text: 'We shortlist accommodation that is safe, well connected and close to things to see, and confirm your choice.' },
      { title: 'Your arrival', text: 'We meet you at the airport and take you directly to your accommodation.' },
      { title: 'Your days in Seoul', text: 'A curated list of sights and restaurants around your appointments — with tables booked for you on request.' },
    ],
    note: 'Travel and accommodation coordination only. Third-party supplier terms, prices and availability apply.',
  },
];

// 문의 폼의 '동행(에스코트) 유형' 선택지 — 순서대로 드롭다운에 표시됩니다.
export const escortTypes = [
  'Aesthetic procedures & cosmetic surgery', // 미용 시술·성형
  'Health screening & check-up',             // 정기·종합 건강검진
  'Dermatology & skin care',                 // 피부과 진료
  'Dental care',                             // 치과
  'Eye care & vision correction',            // 안과·시력교정(라식·라섹)
  'Specialist consultation & second opinion',// 전문의 진료·2차 소견
  'Surgery & major treatment',               // 수술·중증 치료(암 등)
  'Fertility & women\'s health',             // 난임·여성 건강
  'Korean medicine',                         // 한의원·한방 치료
  'Other / not sure yet',                    // 기타·미정
];
