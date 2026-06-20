export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://mozey.uz';

// Dev default points at the local NestJS standalone API on :3333 — the same
// backend the admin panel writes to, so changes show up immediately.
// Production must override via NEXT_PUBLIC_API_BASE (e.g. https://api.mozey.uz/api/v1).
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3333/api/v1';

export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  'https://apps.apple.com/uz/app/mozeyuz/id6778881122';

export const GOOGLE_PLAY_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  'https://play.google.com/store/apps/details?id=uz.museum.app&pcampaignid=web_share';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@mozey.uz';

/* ── Theme tokens ─────────────────────────────────────────────── */
export const T = {
  canvas: '#F1EBDF',
  surface: '#FFFFFF',
  surfaceAlt: '#FAF6EE',
  sand: '#E7E1D5',
  ink: '#1E1813',
  ink2: '#736A5C',
  ink3: '#A99F8E',
  line: 'rgba(30,24,19,0.10)',
  hair: 'rgba(30,24,19,0.06)',
  primary: '#155E7A',
  primaryInk: '#FFFFFF',
  gold: '#9C6F22',
  heart: '#B0452E',
  glass: 'rgba(247,243,235,0.72)',
  glassBorder: 'rgba(30,24,19,0.07)',
} as const;

export const REGION_COLORS: Record<string, { deep: string; light: string }> = {
  'samarqand': { deep: '#0E4D66', light: '#3E9DBC' },
  'buxoro': { deep: '#0F5E58', light: '#2FA398' },
  'xorazm': { deep: '#7A4E1B', light: '#C79A4E' },
  'toshkent-shahar': { deep: '#2C3A47', light: '#6E8398' },
  'toshkent-viloyati': { deep: '#2C3A47', light: '#6E8398' },
  'qoraqalpogiston': { deep: '#7A3322', light: '#C26A4C' },
  'qashqadaryo': { deep: '#4A3B2A', light: '#8B7355' },
  'surxondaryo': { deep: '#5C3D1E', light: '#A67C52' },
  'fargona': { deep: '#2D4A3E', light: '#5A9178' },
  'navoiy': { deep: '#3D3352', light: '#7B6A94' },
  'andijon': { deep: '#3A4E2F', light: '#6F9453' },
  'jizzax': { deep: '#3E4A5C', light: '#7A8DA4' },
  'sirdaryo': { deep: '#2A4858', light: '#5A8EA4' },
  'namangan': { deep: '#4A5A2E', light: '#8AAA5E' },
};

export const REGIONS = [
  'Ташкент', 'Самарканд', 'Бухара', 'Хорезм', 'Кашкадарья',
  'Сурхандарья', 'Фергана', 'Навои', 'Андижан', 'Джизак',
  'Сырдарья', 'Каракалпакстан', 'Ташкентская обл.',
];

export const REGION_POS: Record<string, { x: number; y: number }> = {
  'Нукус': { x: 13, y: 30 },
  'Хива': { x: 21, y: 44 },
  'Бухара': { x: 40, y: 60 },
  'Самарканд': { x: 58, y: 54 },
  'Ташкент': { x: 82, y: 30 },
};

/* ── Static fallback data ─────────────────────────────────────── */
export interface MuseumItem {
  id: string;
  name: string;
  region: string;
  regionSlug: string;
  type: string;
  era: string;
  hours: string;
  price: string;
  coords: string;
  tag: string;
  short: string;
  long: string;
  photoUrl?: string;
  /** All photo URLs in display order. photoUrl is photos[0] (hero). */
  photos?: string[];
}

export const MUSEUMS: MuseumItem[] = [
  {
    id: 'savitsky', name: 'Музей Савицкого', region: 'Нукус', regionSlug: 'qoraqalpogiston', type: 'Искусство',
    era: 'Основан в 1966', hours: '09:00 – 17:00', price: 'от 50 000 сум',
    coords: '42.4612, 59.6103', tag: 'Авангард',
    short: '«Лувр в степи» — запрещённый советский авангард, спасённый в пустыне.',
    long: 'Часто называемый «Лувром в степи», музей Савицкого хранит второе по величине в мире собрание русского авангарда — тысячи полотен, вывезенных в каракалпакскую пустыню Игорем Савицким и десятилетиями укрываемых от советской цензуры.',
  },
  {
    id: 'amir-timur', name: 'Музей Амира Темура', region: 'Ташкент', regionSlug: 'toshkent-shahar', type: 'История',
    era: 'Основан в 1996', hours: '10:00 – 18:00', price: 'от 25 000 сум',
    coords: '41.3111, 69.2797', tag: 'Тимуриды',
    short: 'Купольная ротонда о завоевателе, изменившем Центральную Азию.',
    long: 'Под небесно-голубым ребристым куполом и бирюзовой изразцовой облицовкой музей рассказывает о жизни, походах и государственности Амира Темура и династии Тимуридов.',
  },
  {
    id: 'history', name: 'Государственный музей истории', region: 'Ташкент', regionSlug: 'toshkent-shahar', type: 'История',
    era: 'Основан в 1876', hours: '10:00 – 17:00', price: 'от 30 000 сум',
    coords: '41.3050, 69.2705', tag: 'Шёлковый путь',
    short: 'Двадцать пять веков Центральной Азии — от зороастрийцев до Шёлкового пути.',
    long: 'От зороастрийских реликвий и бактрийского золота до монет Шёлкового пути и буддийской скульптуры — старейший музей Узбекистана разворачивает 2500 лет истории Центральной Азии.',
  },
  {
    id: 'arts', name: 'Государственный музей искусств', region: 'Ташкент', regionSlug: 'toshkent-shahar', type: 'Искусство',
    era: 'Основан в 1918', hours: '10:00 – 18:00', price: 'от 30 000 сум',
    coords: '41.3033, 69.2870', tag: 'Изящные искусства',
    short: 'Четыре века живописи, сюзане и прикладного искусства.',
    long: 'Четыре столетия изящного и прикладного искусства охватывают узбекскую, русскую и западноевропейскую школы.',
  },
  {
    id: 'afrosiyob', name: 'Музей Афрасиаб', region: 'Самарканд', regionSlug: 'samarqand', type: 'Археология',
    era: 'Основан в 1970', hours: '09:00 – 18:00', price: 'от 40 000 сум',
    coords: '39.6700, 66.9930', tag: 'Фрески',
    short: 'Построен вокруг «Фрески послов» VII века древнего Самарканда.',
    long: 'Музей вырастает из руин Афрасиаба — древнего Самарканда — и построен вокруг «Фрески послов» VII века.',
  },
  {
    id: 'applied', name: 'Музей прикладного искусства', region: 'Ташкент', regionSlug: 'toshkent-shahar', type: 'Ремёсла',
    era: 'Основан в 1937', hours: '09:00 – 18:00', price: 'от 28 000 сум',
    coords: '41.2980, 69.2640', tag: 'Керамика',
    short: 'Керамика, резьба и вышивка в изразцовом особняке царских времён.',
    long: 'В роскошно облицованном изразцами особняке дипломата собраны лучшие образцы керамики, резьбы по ганчу, вышивки и ювелирного искусства.',
  },
];

export const PLACES: MuseumItem[] = [
  {
    id: 'registan', name: 'Регистан', region: 'Самарканд', regionSlug: 'samarqand', type: 'Ансамбль',
    era: 'XV–XVII вв.', hours: '08:00 – 20:00', price: 'от 65 000 сум',
    coords: '39.6547, 66.9758', tag: 'ЮНЕСКО',
    short: 'Три медресе вокруг площади — сердце тимуридского Самарканда.',
    long: 'Три монументальных медресе обрамляют площадь в едином захватывающем ансамбле — церемониальное сердце тимуридского Самарканда.',
  },
  {
    id: 'shah-i-zinda', name: 'Шахи Зинда', region: 'Самарканд', regionSlug: 'samarqand', type: 'Некрополь',
    era: 'XI–XIX вв.', hours: '07:00 – 19:00', price: 'от 30 000 сум',
    coords: '39.6628, 66.9883', tag: 'Мозаика',
    short: 'Аллея мавзолеев в кобальтовой и бирюзовой мозаике.',
    long: 'Восходящая аллея мавзолеев, каждый — стена из кобальтовой и бирюзовой мозаики.',
  },
  {
    id: 'gur-e-amir', name: 'Гур-Эмир', region: 'Самарканд', regionSlug: 'samarqand', type: 'Мавзолей',
    era: '1404 год', hours: '08:00 – 19:00', price: 'от 35 000 сум',
    coords: '39.6486, 66.9690', tag: 'Гробница Темура',
    short: 'Рифлёный лазурный купол над гробницей Амира Темура.',
    long: 'Рифлёный лазурный купол Гур-Эмира венчает гробницу Амира Темура и его потомков.',
  },
  {
    id: 'bibi-khanym', name: 'Мечеть Биби-Ханым', region: 'Самарканд', regionSlug: 'samarqand', type: 'Мечеть',
    era: '1399–1404', hours: '08:00 – 19:00', price: 'от 30 000 сум',
    coords: '39.6655, 66.9818', tag: 'Монумент',
    short: 'Когда-то одна из крупнейших мечетей исламского мира.',
    long: 'Возведённая Темуром после индийского похода и некогда одна из крупнейших мечетей исламского мира.',
  },
  {
    id: 'poi-kalyan', name: 'Пои-Калян', region: 'Бухара', regionSlug: 'buxoro', type: 'Ансамбль',
    era: 'XII–XVI вв.', hours: '08:00 – 19:00', price: 'от 30 000 сум',
    coords: '39.7757, 64.4143', tag: 'Минарет',
    short: '47-метровый минарет Калян, который пощадил Чингисхан.',
    long: '47-метровый минарет Калян — «башня смерти», которую Чингисхан, по преданию, пощадил за красоту.',
  },
  {
    id: 'ark', name: 'Крепость Арк', region: 'Бухара', regionSlug: 'buxoro', type: 'Цитадель',
    era: 'V век', hours: '09:00 – 18:00', price: 'от 25 000 сум',
    coords: '39.7758, 64.4097', tag: 'Царская резиденция',
    short: 'Цитадель V века, где эмиры правили до 1920 года.',
    long: 'Огромная глинобитная цитадель, впервые возведённая в V веке.',
  },
  {
    id: 'itchan-kala', name: 'Ичан-Кала', region: 'Хива', regionSlug: 'xorazm', type: 'Город-крепость',
    era: 'X век', hours: 'Свободный доступ', price: 'от 100 000 сум',
    coords: '41.3783, 60.3617', tag: 'ЮНЕСКО',
    short: 'Внутренний город минаретов — музей под открытым небом, застывший во времени.',
    long: 'За десятиметровыми глинобитными стенами внутренний город Хивы вмещает минареты, медресе, дворцы и караван-сараи.',
  },
  {
    id: 'chor-minor', name: 'Чор-Минор', region: 'Бухара', regionSlug: 'buxoro', type: 'Ворота',
    era: '1807 год', hours: '09:00 – 18:00', price: 'от 15 000 сум',
    coords: '39.7745, 64.4292', tag: 'Достопримечательность',
    short: 'Четыре бирюзовые башни — ворота исчезнувшего медресе.',
    long: 'Четыре стройные башни под бирюзовыми куполками, каждая чуть иная.',
  },
];

export const NAV_LINKS = [
  { key: 'museums', href: '#catalog' },
  { key: 'places', href: '#catalog' },
  { key: 'map', href: '#map' },
  { key: 'about', href: '#about' },
] as const;

export const STATISTICS = {
  museums: 281,
  historicalPlaces: 101,
  languages: 3,
  regions: 5,
} as const;

export const STORAGE_KEY = 'muzeylari_web_v1';
