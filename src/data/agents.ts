import { Agent } from '@/components/AgentSidebar';

export const AGENTS: Agent[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Senior Real Estate Agent",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "With over 10 years of experience in luxury properties, Sarah has helped hundreds of clients find their dream homes.",
    rating: 5,
    properties: 48
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Property Consultant",
    photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Michael specializes in urban apartments and has extensive knowledge of city neighborhoods and market trends.",
    rating: 4,
    properties: 36
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Vacation Rental Specialist",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Emily is an expert in finding perfect vacation getaways, with a focus on beachfront and mountain retreat properties.",
    rating: 5,
    properties: 29
  },
  {
    id: "4",
    name: "David Washington",
    role: "Commercial Property Agent",
    photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Specializing in commercial real estate, David helps businesses find the perfect space to grow and thrive.",
    rating: 4,
    properties: 22
  },
  {
    id: "5",
    name: "Aisha Patel",
    role: "Luxury Property Specialist",
    photo: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Aisha works with high-end properties and has an exclusive portfolio of luxury homes and estates.",
    rating: 5,
    properties: 15
  },
  {
    id: "6",
    name: "James Wilson",
    role: "First-Time Buyer Specialist",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "James helps first-time homebuyers navigate the complex process of purchasing their first property.",
    rating: 4,
    properties: 27
  },
  {
    id: "11",
    name: "Olivia Thompson",
    role: "Residential Property Expert",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Olivia specializes in residential properties and has a keen eye for matching clients with their perfect homes.",
    rating: 5,
    properties: 42
  },
  {
    id: "12",
    name: "Daniel Lee",
    role: "International Property Consultant",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Daniel assists international clients with property investments and relocations across different countries.",
    rating: 5,
    properties: 38
  },
  {
    id: "7",
    name: "Sophia Martinez",
    role: "Investment Property Advisor",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Sophia specializes in helping clients build wealth through strategic real estate investments.",
    rating: 5,
    properties: 31
  },
  {
    id: "8",
    name: "Robert Taylor",
    role: "Historic Property Expert",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Robert has a passion for historic homes and specializes in the restoration and sale of period properties.",
    rating: 5,
    properties: 19
  },
  {
    id: "9",
    name: "Jennifer Kim",
    role: "New Development Specialist",
    photo: "https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Jennifer works directly with developers to help clients secure the best units in new construction projects.",
    rating: 4,
    properties: 24
  },
  {
    id: "10",
    name: "Marcus Johnson",
    role: "Relocation Specialist",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    description: "Marcus helps clients relocating to new cities find the perfect neighborhood and home for their lifestyle.",
    rating: 5,
    properties: 33
  }
];

export const AGENT_PROPERTIES = {
  "1": [1, 5, 9, 12, 15],
  "2": [2, 8, 11, 17],
  "3": [3, 6, 13],
  "4": [4, 7, 10],
  "5": [14, 16, 18],
  "6": [19, 20, 21],
  "7": [22, 23, 24, 25],
  "8": [26, 27, 28],
  "9": [29, 30, 31],
  "10": [32, 33, 34, 35],
  "11": [36, 37, 38],
  "12": [39, 40, 41]
};
