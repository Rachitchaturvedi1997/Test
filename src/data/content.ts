// All copy below is taken from the Moholla app itself (assets/demo.json inside
// Moholla-native-v4.2.0.apk). Nothing here is invented for the website.

export const S = (name: string) => `./screens/${name}.webp`
export const P = (name: string) => `./photos/photo-${name}.webp`

export type Post = {
  id: string
  author: string
  role: string
  kicker: string
  head: string
  body: string
  time: string
  likes: number
  comments: number
  img?: string
  art: [string, string]
}

export const POSTS: Post[] = [
  {
    id: 'd3', author: 'Ward Office', role: 'Official notice', kicker: 'Official · BBMP ward 84',
    head: 'Water supply pause on Thursday, 9am–4pm',
    body: 'Pipeline replacement work near the main junction. Store water on Wednesday night. Tankers will be stationed at the park entrance.',
    time: '8 h', likes: 76, comments: 31, art: ['#4F8F6D', '#1E4F3C'],
  },
  {
    id: 'd1', author: 'Priya Sharma', role: 'Neighbourhood voice', kicker: 'Needs help today',
    head: 'Anyone know a reliable electrician nearby?',
    body: 'Short circuit in our kitchen switchboard since morning. We need someone tonight if possible.',
    time: '2 h', likes: 34, comments: 12, img: P('electrician'), art: ['#E97C4B', '#B8442B'],
  },
  {
    id: 'd4', author: 'Karthik Gowda', role: 'Organiser', kicker: 'This Sunday · 7 am',
    head: 'Community cricket at the ground, all ages welcome',
    body: 'Bring your own bat if you have one. Chai and bananas sponsored by the corner shop.',
    time: '1 d', likes: 92, comments: 40, img: P('news-cricket'), art: ['#8B7BB5', '#4E3F7A'],
  },
  {
    id: 'd2', author: "Siri's Tiffin Room", role: 'Local kitchen', kicker: '3 neighbours recommend',
    head: 'Homely meals at ₹80, packed fresh at 7am',
    body: 'Ragi mudde, bisi bele bath and chapati boxes. Free delivery inside the layout for anyone ordering before 6am.',
    time: '5 h', likes: 128, comments: 24, img: P('thali'), art: ['#C9963F', '#8A5C1D'],
  },
]

export const ALERTS = [
  { id: 'a1', sev: 'high', title: 'Power outage in Sector 2', body: 'Transformer maintenance until about 1pm. BESCOM crew is on site.', status: 'Active', time: 'Just now', confirms: 12 },
  { id: 'a2', sev: 'med', title: 'Water tanker delay', body: "Today's tanker is running about two hours late near 3rd cross.", status: 'Open', time: '2 h', confirms: 5 },
  { id: 'a3', sev: 'low', title: 'Pothole filled near junction', body: 'Reported last week, fixed this morning. Thanks to everyone who confirmed.', status: 'Resolved', time: '1 d', confirms: 23 },
] as const

export const EVENTS = [
  { id: 'e1', title: 'Community cricket', day: '21', mon: 'Sep', time: '7:00 AM', place: 'Layout ground', host: 'Karthik G', going: 18, art: ['#5C7FA8', '#2C4A6B'] },
  { id: 'e2', title: 'Ganesha utsava practice', day: '23', mon: 'Sep', time: '6:30 PM', place: 'Temple hall', host: 'Committee', going: 42, art: ['#C9963F', '#8A5C1D'] },
  { id: 'e3', title: 'Free health camp', day: '27', mon: 'Sep', time: '9:00 AM', place: 'Community centre', host: 'Ward Office', going: 76, art: ['#4F8F6D', '#1E4F3C'] },
  { id: 'e4', title: 'Morning walk group', day: 'Daily', mon: '5:30', time: '5:30 AM', place: 'Lake gate', host: 'Morning Walkers', going: 148, art: ['#6FA88C', '#2F6B54'], img: P('walk') },
] as const

export const SOCIETY = {
  name: 'Sunrise Apartments · Block A',
  area: 'Angondhalli',
  members: 24,
  alert: { head: 'Lift B under maintenance till 6 PM', body: 'Please use the staircase or Lift A. Technician is on site.', time: '1 h' },
  post: { author: 'Priya Sharma', head: 'Carrom evening on the terrace?', body: 'Bringing my board Saturday 5 PM. Who is in?', time: '5 h' },
  roster: [
    { name: 'Demo Secretary', role: 'secretary' },
    { name: 'Priya Sharma', role: 'member' },
    { name: 'Karthik Gowda', role: 'member' },
  ],
}

// The noise we are replacing: a typical overflowing society group chat.
export const GROUP_NOISE = [
  'Good morning all',
  'Is water coming today?',
  'Forwarded as received…',
  'Who parked in B-204 slot??',
  'Anyone has plumber number',
  'Good morning',
  'Lift not working again',
  'Pls check above msg',
  'Diwali event meeting when?',
  'Happy birthday Sharma ji',
  'Did anyone see a brown dog',
  'Water supply pause Thursday?',
]

export const VERSE = {
  ref: 'Bhagavad Gita 6.5',
  sa: ['उद्धरेदात्मनाऽऽत्मानं नात्मानमवसादयेत्।', 'आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥'],
  en: 'Lift yourself by yourself. You are your own best friend.',
}

export const POSES = ['Tadasana', 'Vrikshasana', 'Adho Mukha', 'Balasana', 'Bhujangasana', 'Virabhadrasana I', 'Trikonasana', 'Setu Bandhasana', 'Sukhasana', 'Savasana']

export const MESH_POINTS = [
  'Phones running Moholla connect to each other over Bluetooth, no internet or SIM needed.',
  'Messages hop phone-to-phone (up to 7 hops) to reach someone out of range.',
  'Every message is end-to-end encrypted.',
]
