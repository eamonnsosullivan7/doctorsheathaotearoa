export interface NavItem {
  label: string
  href: string
  external?: boolean
}

export const navigation: NavItem[] = [
  {label: 'About', href: '/about'},
  {label: 'News', href: '/news'},
  {label: 'Events', href: '/events'},
  {label: 'Support', href: '/support'},
  {
    label: "Doctors' Health and Wellbeing Curriculum",
    href: 'https://doctorshealthalliance.org.au/doctors-health-and-wellbeing-curriculum',
    external: true,
  },
  {label: 'Contact', href: '/contact'},
  {label: 'Donate', href: '/donate'},
]

export const footerNavigation: {title: string; links: NavItem[]}[] = [
  {
    title: 'About',
    links: [
      {label: 'Mission', href: '/about#mission'},
      {label: 'History', href: '/about#history'},
      {label: 'Team', href: '/about#team'},
    ],
  },
  {
    title: 'Events',
    links: [
      {label: 'Upcoming events', href: '/events'},
      {label: 'List an event', href: '/events#list-an-event'},
    ],
  },
  {
    title: 'Support',
    links: [
      {label: 'Services', href: '/support'},
      {label: 'Resources & podcasts', href: '/support#articles-podcasts-books'},
    ],
  },
  {
    title: 'Contact',
    links: [
      {label: 'Send us a message', href: '/contact'},
      {label: 'Donate & support', href: '/donate'},
    ],
  },
]
