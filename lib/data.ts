export interface StudentProject {
  id: string;
  title: string;
  category: string;
  ageGroup: string;
  institution: string;
  fundingNeeded: string;
  expectedReach: string;
  description: string;
  whySponsor: string;
  tags: string[];
  verified: boolean;
}

export interface CommunityCompetition {
  id: string;
  name: string;
  type: string;
  location: string;
  audienceSize: string;
  packages: string;
  visibilityPerks: string;
  description: string;
  tags: string[];
  verified: boolean;
}

export const studentProjects: StudentProject[] = [
  {
    id: 'sp-1',
    title: 'AI Recycling Bin',
    category: 'Environmental Sustainability',
    ageGroup: 'Ages 16–17',
    institution: 'High School',
    fundingNeeded: 'AED 5,000',
    expectedReach: 'School-wide / Local Media Coverage',
    description: 'Student-led project creating smart bins that sort waste automatically using computer vision and machine learning.',
    whySponsor: 'Aligns with CSR and innovation goals. Demonstrates commitment to environmental sustainability and youth education.',
    tags: ['CSR Impact', 'Innovation', 'Youth Engagement'],
    verified: true,
  },
  {
    id: 'sp-2',
    title: 'Solar Study Desks',
    category: 'Education & Energy',
    ageGroup: 'Ages 14–16',
    institution: 'Secondary School',
    fundingNeeded: 'AED 8,000',
    expectedReach: '2 schools, ~500 students',
    description: 'Portable solar-powered study desks with integrated LED lighting for students in areas with limited electricity access.',
    whySponsor: 'Perfect for brands focused on sustainable energy and educational equity. High visibility through school partnerships.',
    tags: ['CSR Impact', 'Youth Engagement', 'Visibility'],
    verified: true,
  },
  {
    id: 'sp-3',
    title: 'Mental Health Awareness App',
    category: 'Health & Wellbeing',
    ageGroup: 'Ages 18–22',
    institution: 'University',
    fundingNeeded: 'AED 12,000',
    expectedReach: 'Campus-wide, 3,000+ students',
    description: 'Mobile application providing mental health resources, peer support networks, and wellness tracking for university students.',
    whySponsor: 'Addresses growing mental health concerns among youth. Strong brand alignment with health and wellness sectors.',
    tags: ['CSR Impact', 'Innovation', 'Youth Engagement'],
    verified: false,
  },
  {
    id: 'sp-4',
    title: 'Community Garden Network',
    category: 'Environmental & Community',
    ageGroup: 'Ages 15–18',
    institution: 'Multiple Schools',
    fundingNeeded: 'AED 6,500',
    expectedReach: '5 neighborhoods, local press',
    description: 'Urban farming initiative connecting schools to create sustainable gardens and food education programs.',
    whySponsor: 'Tangible community impact with long-term visibility. Ideal for food, agriculture, or sustainability-focused brands.',
    tags: ['CSR Impact', 'Visibility', 'Youth Engagement'],
    verified: true,
  },
];

export const communityCompetitions: CommunityCompetition[] = [
  {
    id: 'cc-1',
    name: 'Al Barsha Football Tournament',
    type: 'Sports / Community',
    location: 'Dubai, Al Barsha',
    audienceSize: '~300 attendees per match',
    packages: 'AED 2,500 – AED 8,000',
    visibilityPerks: 'Logo on team shirts, banners, digital boards, social media coverage, and event announcements.',
    description: 'Annual youth football tournament featuring 12 local teams competing over 3 weekends. Family-friendly community event.',
    tags: ['Visibility', 'Local Reach', 'Youth Engagement'],
    verified: true,
  },
  {
    id: 'cc-2',
    name: 'Old Dubai Art Walk',
    type: 'Arts & Culture',
    location: 'Dubai, Al Fahidi District',
    audienceSize: '~500 visitors',
    packages: 'AED 3,000 – AED 10,000',
    visibilityPerks: 'Featured sponsor booth, logo on promotional materials, exhibition space, and digital campaigns.',
    description: 'Monthly cultural event showcasing local artists, traditional crafts, and heritage tours through historic Dubai neighborhoods.',
    tags: ['Visibility', 'Local Reach', 'CSR Impact'],
    verified: true,
  },
  {
    id: 'cc-3',
    name: 'Jumeirah Robotics Challenge',
    type: 'Technology / Education',
    location: 'Dubai, Jumeirah',
    audienceSize: '~400 students & parents',
    packages: 'AED 4,000 – AED 12,000',
    visibilityPerks: 'Workshop sponsorship, branded competition arena, awards ceremony presence, media exposure.',
    description: 'Regional robotics competition for students aged 10-18, featuring coding challenges and engineering showcases.',
    tags: ['Innovation', 'Youth Engagement', 'Visibility'],
    verified: false,
  },
  {
    id: 'cc-4',
    name: 'Sharjah Literary Festival',
    type: 'Education & Culture',
    location: 'Sharjah',
    audienceSize: '~600 attendees',
    packages: 'AED 5,000 – AED 15,000',
    visibilityPerks: 'Author meet-and-greet sponsorship, bookmarks and program guides, stage branding, speaking opportunities.',
    description: 'Community festival celebrating Arabic and English literature with author talks, book signings, and youth reading programs.',
    tags: ['Visibility', 'Local Reach', 'CSR Impact'],
    verified: true,
  },
];
