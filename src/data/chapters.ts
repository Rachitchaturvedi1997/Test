import { S } from './content'

/** A camera pose for the phone on the stage. x/y are in vw/vh units. */
export type Cam = { x: number; y: number; s: number; rx: number; ry: number; rz: number }
/** A zoom into the phone's own screen: scale + focal point (percent of the screenshot). */
export type Lens = { z: number; ox: number; oy: number }

export type Chapter = {
  id: string
  dock: DockId
  label: string
  title: [string, string]
  lines: string[]
  /** Real app screenshots shown in order as the chapter progresses. */
  screens: string[]
  cam: Cam
  camMobile: Cam
  lens: Lens[]
  side: 'left' | 'right'
  mood: number // 0 = darkest environment, 1 = warmest light
  intensity: number // soundtrack energy 0..1
  caption?: string
}

export type DockId = 'home' | 'community' | 'events' | 'spiritual' | 'society'

const m = (y = 10, s = 0.78): Cam => ({ x: 0, y, s, rx: 0, ry: 0, rz: 0 })

export const CHAPTERS: Chapter[] = [
  {
    id: 'hero', dock: 'home', label: 'Moholla',
    title: ['Meet', 'your neighbours.'],
    lines: ['Your society. Your community. Your place.',
      'A simpler way to connect with your neighbours, share updates, organize events and manage your community — without the noise of endless group chats.'],
    screens: [S('03_home')],
    cam: { x: 17, y: 2, s: 1, rx: 4, ry: -14, rz: 0 }, camMobile: m(),
    lens: [{ z: 1, ox: 50, oy: 20 }],
    side: 'left', mood: 0.9, intensity: 0.18,
  },
  {
    id: 'noise', dock: 'home', label: 'The problem',
    title: ['Your society.', 'Without the noise.'],
    lines: ['Stop sending everything to the group.', 'Create a dedicated space for your community.'],
    screens: [S('03_home'), S('20_liquid_shell')],
    cam: { x: 3, y: 0, s: 0.9, rx: 0, ry: -4, rz: 0 }, camMobile: m(12, 0.72),
    lens: [{ z: 1, ox: 50, oy: 30 }, { z: 1.12, ox: 50, oy: 20 }],
    side: 'left', mood: 0.35, intensity: 0.3,
  },
  {
    id: 'posts', dock: 'community', label: 'Posts · Chaupal',
    title: ['Share what', 'matters.'],
    lines: ['Help requests, recommendations, ward notices and match days.', 'Written by the people who live around you.'],
    screens: [S('05_explore'), S('07_chaupal')],
    cam: { x: -11, y: 0, s: 1.02, rx: 2, ry: 14, rz: 0 }, camMobile: m(),
    lens: [{ z: 1.35, ox: 30, oy: 68 }, { z: 1, ox: 50, oy: 10 }],
    side: 'right', mood: 0.7, intensity: 0.4,
  },
  {
    id: 'alerts', dock: 'community', label: 'Alerts',
    title: ['Never miss', 'what matters.'],
    lines: ['Send important alerts directly to the people who need to know.'],
    screens: [S('03c_home_alerts'), S('04_home_dark')],
    cam: { x: 11, y: 0, s: 0.96, rx: 0, ry: -8, rz: 0 }, camMobile: m(),
    lens: [{ z: 1.7, ox: 50, oy: 80 }, { z: 1, ox: 50, oy: 40 }],
    side: 'left', mood: 0.12, intensity: 0.46,
  },
  {
    id: 'events', dock: 'events', label: 'Events · Baithak',
    title: ['From announcement', 'to event.'],
    lines: ['Organize events. Bring neighbours together.', 'Then drop into a Baithak, a live voice circle for the people who showed up.'],
    screens: [S('15_baithak')],
    cam: { x: -11, y: 0, s: 1, rx: -4, ry: 12, rz: 0 }, camMobile: m(),
    lens: [{ z: 1, ox: 50, oy: 30 }, { z: 1.4, ox: 50, oy: 28 }],
    side: 'right', mood: 0.65, intensity: 0.52,
  },
  {
    id: 'society', dock: 'society', label: 'Society',
    title: ['Your society.', 'In one place.'],
    lines: ['Add your flat, your society and its invite code.', 'Private posts, lift notices and a roster that knows who the secretary is.'],
    screens: [S('02_onboarding_address'), S('11_you')],
    cam: { x: 11, y: 0, s: 1, rx: 0, ry: -12, rz: 0 }, camMobile: m(),
    lens: [{ z: 1.45, ox: 50, oy: 72 }, { z: 1.3, ox: 50, oy: 38 }],
    side: 'left', mood: 0.6, intensity: 0.56,
  },
  {
    id: 'mesh', dock: 'society', label: 'Offline mesh',
    title: ['See your', 'community differently.'],
    lines: ['When the network goes down, Moholla phones find each other.', 'Messages hop neighbour to neighbour over Bluetooth, end-to-end encrypted.'],
    screens: [S('27_tour'), S('13_offline_mesh')],
    cam: { x: 0, y: 0, s: 1.12, rx: 8, ry: -22, rz: -2 }, camMobile: m(10, 0.82),
    lens: [{ z: 1.6, ox: 50, oy: 38 }, { z: 1.25, ox: 50, oy: 30 }],
    side: 'left', mood: 0.2, intensity: 0.66,
    caption: 'In the app this is called Offline mesh.',
  },
  {
    id: 'spiritual', dock: 'spiritual', label: 'Spiritual Corner',
    title: ['More than', 'a society app.'],
    lines: ['A space for reflection, learning and inspiration.', 'The day’s aarti verse, live devotional channels and guided sessions.'],
    screens: [S('09_spiritual'), S('23_meditation_player')],
    cam: { x: 11, y: 0, s: 1, rx: 0, ry: -10, rz: 0 }, camMobile: m(),
    lens: [{ z: 1.2, ox: 50, oy: 22 }, { z: 1, ox: 50, oy: 40 }],
    side: 'left', mood: 0.45, intensity: 0.34,
  },
  {
    id: 'yoga', dock: 'spiritual', label: 'Yoga & breath',
    title: ['Live better.', 'Together.'],
    lines: ['Voice-guided poses, 4-7-8 breathing and a streak your neighbours can match.'],
    screens: [S('30_coach_yoga'), S('33_pose_session'), S('31_coach_breathe')],
    cam: { x: -11, y: 0, s: 1, rx: 0, ry: 10, rz: 0 }, camMobile: m(),
    lens: [{ z: 1, ox: 50, oy: 30 }, { z: 1.08, ox: 50, oy: 40 }, { z: 1, ox: 50, oy: 50 }],
    side: 'right', mood: 0.55, intensity: 0.3,
  },
  {
    id: 'geeta', dock: 'spiritual', label: '24 hours · Live',
    title: ['24-hour', 'live Geeta.'],
    lines: ['A moment of wisdom. Anytime.'],
    screens: [S('09_spiritual')],
    cam: { x: 0, y: 0, s: 1.22, rx: 0, ry: 0, rz: 0 }, camMobile: m(8, 0.9),
    lens: [{ z: 1.9, ox: 50, oy: 64 }, { z: 1.9, ox: 50, oy: 96 }],
    side: 'left', mood: 0.05, intensity: 0.14,
    caption: 'Round-the-clock devotional radio and a Bhagavad Gita verse every day, inside Spiritual Corner.',
  },
]

export const DOCK: { id: DockId; label: string; chapter: string }[] = [
  { id: 'home', label: 'Home', chapter: 'hero' },
  { id: 'community', label: 'Community', chapter: 'posts' },
  { id: 'events', label: 'Events', chapter: 'events' },
  { id: 'spiritual', label: 'Spiritual', chapter: 'spiritual' },
  { id: 'society', label: 'Society', chapter: 'society' },
]

export const MONTAGE = [
  { word: 'Home', src: S('20_liquid_shell') },
  { word: 'Neighbours', src: S('26_welcome') },
  { word: 'Posts', src: S('05_explore') },
  { word: 'Alerts', src: S('03c_home_alerts') },
  { word: 'Events', src: S('15_baithak') },
  { word: 'Society', src: S('11_you') },
  { word: 'Mesh', src: S('13_offline_mesh') },
  { word: 'Spiritual', src: S('10_meditation') },
  { word: 'Yoga', src: S('33_pose_session') },
  { word: 'Live Geeta', src: S('09_spiritual') },
]
