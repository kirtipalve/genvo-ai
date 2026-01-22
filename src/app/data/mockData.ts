// Mock data for demo mode

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "generating" | "completed" | "failed";
  isPublic: boolean;
  forks: number;
  views: number;
  author: {
    name: string;
    avatar: string;
  };
  versions: Version[];
  prompt: string;
  settings: GenerationSettings;
}

export interface Version {
  id: string;
  versionNumber: number;
  prompt: string;
  createdAt: string;
  videoUrl: string;
  thumbnail: string;
  settings: GenerationSettings;
}

export interface GenerationSettings {
  duration: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  style: string;
  model: string;
}

export interface Branch {
  id: string;
  name: string;
  projectId: string;
  baseVersionId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    avatar: string;
  };
  prompt: string;
  settings: GenerationSettings;
  status: "draft" | "generating" | "completed";
  thumbnail?: string;
  videoUrl?: string;
}

// Mock branches for the Cyberpunk project
export const mockBranches: Branch[] = [
  {
    id: "b1",
    name: "main",
    projectId: "1",
    baseVersionId: "v3",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-18T14:22:00Z",
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic billboards",
    settings: {
      duration: 5,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    videoUrl: "/videos/placeholder.mp4",
  },
  {
    id: "b2",
    name: "blue-lighting",
    projectId: "1",
    baseVersionId: "v2",
    createdAt: "2024-01-17T11:00:00Z",
    updatedAt: "2024-01-17T15:30:00Z",
    author: {
      name: "Sarah",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, deep blue neon lighting, cyan reflections on wet streets, moody atmosphere",
    settings: {
      duration: 5,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=225&fit=crop",
    videoUrl: "/videos/placeholder.mp4",
  },
  {
    id: "b3",
    name: "more-traffic",
    projectId: "1",
    baseVersionId: "v2",
    createdAt: "2024-01-17T12:00:00Z",
    updatedAt: "2024-01-17T16:45:00Z",
    author: {
      name: "John",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, neon lights reflecting on wet streets, heavy flying car traffic, busy aerial highways, dense urban atmosphere",
    settings: {
      duration: 5,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=225&fit=crop",
    videoUrl: "/videos/placeholder.mp4",
  },
  {
    id: "b4",
    name: "rain-effect",
    projectId: "1",
    baseVersionId: "v3",
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-18T09:00:00Z",
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, heavy rain, neon lights reflecting on wet streets, flying cars with headlights cutting through rain",
    settings: {
      duration: 5,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    status: "draft",
  },
];

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Cyberpunk City Flythrough",
    description: "A cinematic flythrough of a neon-lit cyberpunk metropolis at night",
    thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-18T14:22:00Z",
    status: "completed",
    isPublic: true,
    forks: 24,
    views: 1420,
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic billboards",
    settings: {
      duration: 5,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        prompt: "A futuristic city at night with neon lights",
        createdAt: "2024-01-15T10:30:00Z",
        videoUrl: "/videos/placeholder.mp4",
        thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
        settings: { duration: 4, aspectRatio: "16:9", style: "Default", model: "Gen-3 Alpha" },
      },
      {
        id: "v2",
        versionNumber: 2,
        prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, neon lights reflecting on wet streets",
        createdAt: "2024-01-16T09:15:00Z",
        videoUrl: "/videos/placeholder.mp4",
        thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
        settings: { duration: 5, aspectRatio: "16:9", style: "Cinematic", model: "Gen-3 Alpha" },
      },
      {
        id: "v3",
        versionNumber: 3,
        prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic billboards",
        createdAt: "2024-01-18T14:22:00Z",
        videoUrl: "/videos/placeholder.mp4",
        thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
        settings: { duration: 5, aspectRatio: "16:9", style: "Cinematic", model: "Gen-3 Alpha" },
      },
    ],
  },
  {
    id: "2",
    title: "Ocean Sunrise Timelapse",
    description: "Peaceful sunrise over calm ocean waters with gentle waves",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=225&fit=crop",
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:45:00Z",
    status: "completed",
    isPublic: true,
    forks: 12,
    views: 856,
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt: "Timelapse of a beautiful sunrise over a calm ocean, golden light spreading across the water, gentle waves lapping at the shore",
    settings: {
      duration: 6,
      aspectRatio: "16:9",
      style: "Natural",
      model: "Gen-3 Alpha",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        prompt: "Timelapse of a beautiful sunrise over a calm ocean, golden light spreading across the water, gentle waves lapping at the shore",
        createdAt: "2024-01-12T08:00:00Z",
        videoUrl: "/videos/placeholder.mp4",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=225&fit=crop",
        settings: { duration: 6, aspectRatio: "16:9", style: "Natural", model: "Gen-3 Alpha" },
      },
    ],
  },
  {
    id: "3",
    title: "Abstract Fluid Motion",
    description: "Colorful abstract fluid dynamics animation",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop",
    createdAt: "2024-01-10T16:20:00Z",
    updatedAt: "2024-01-11T11:30:00Z",
    status: "completed",
    isPublic: false,
    forks: 0,
    views: 45,
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt: "Abstract fluid dynamics with vibrant colors flowing and merging, iridescent bubbles, smooth motion",
    settings: {
      duration: 4,
      aspectRatio: "1:1",
      style: "Abstract",
      model: "Stable Video",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        prompt: "Abstract colorful fluid motion",
        createdAt: "2024-01-10T16:20:00Z",
        videoUrl: "/videos/placeholder.mp4",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop",
        settings: { duration: 3, aspectRatio: "1:1", style: "Abstract", model: "Stable Video" },
      },
      {
        id: "v2",
        versionNumber: 2,
        prompt: "Abstract fluid dynamics with vibrant colors flowing and merging, iridescent bubbles, smooth motion",
        createdAt: "2024-01-11T11:30:00Z",
        videoUrl: "/videos/placeholder.mp4",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop",
        settings: { duration: 4, aspectRatio: "1:1", style: "Abstract", model: "Stable Video" },
      },
    ],
  },
  {
    id: "4",
    title: "Product Showcase",
    description: "Elegant product rotation for e-commerce",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop",
    createdAt: "2024-01-08T13:00:00Z",
    updatedAt: "2024-01-08T13:00:00Z",
    status: "generating",
    isPublic: false,
    forks: 0,
    views: 12,
    author: {
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
    prompt: "Elegant 360-degree product rotation of a minimalist watch on a white background, soft studio lighting",
    settings: {
      duration: 3,
      aspectRatio: "1:1",
      style: "Product",
      model: "Gen-3 Alpha",
    },
    versions: [],
  },
];

export const communityProjects: Project[] = [
  {
    id: "c1",
    title: "Northern Lights Dance",
    description: "Aurora borealis dancing over snowy mountains",
    thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=225&fit=crop",
    createdAt: "2024-01-14T22:00:00Z",
    updatedAt: "2024-01-14T22:00:00Z",
    status: "completed",
    isPublic: true,
    forks: 89,
    views: 5420,
    author: {
      name: "AuroraCreator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aurora",
    },
    prompt: "Northern lights dancing over snow-covered mountains in Norway, stars visible, peaceful winter night",
    settings: {
      duration: 8,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    versions: [],
  },
  {
    id: "c2",
    title: "Tokyo Street Walk",
    description: "First-person walk through Tokyo's neon streets",
    thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop",
    createdAt: "2024-01-13T18:30:00Z",
    updatedAt: "2024-01-13T18:30:00Z",
    status: "completed",
    isPublic: true,
    forks: 156,
    views: 8932,
    author: {
      name: "TokyoDreamer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tokyo",
    },
    prompt: "First-person POV walking through Shibuya at night, neon signs, crowds, rain-slicked streets, cinematic",
    settings: {
      duration: 6,
      aspectRatio: "9:16",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    versions: [],
  },
  {
    id: "c3",
    title: "Underwater Coral Reef",
    description: "Exploring a vibrant coral reef ecosystem",
    thumbnail: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=225&fit=crop",
    createdAt: "2024-01-11T10:15:00Z",
    updatedAt: "2024-01-11T10:15:00Z",
    status: "completed",
    isPublic: true,
    forks: 67,
    views: 3211,
    author: {
      name: "OceanExplorer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ocean",
    },
    prompt: "Underwater POV swimming through a colorful coral reef, tropical fish, sunlight rays penetrating water",
    settings: {
      duration: 5,
      aspectRatio: "16:9",
      style: "Natural",
      model: "Stable Video",
    },
    versions: [],
  },
  {
    id: "c4",
    title: "Zen Garden Meditation",
    description: "Peaceful Japanese zen garden with raked sand",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=225&fit=crop",
    createdAt: "2024-01-09T07:00:00Z",
    updatedAt: "2024-01-09T07:00:00Z",
    status: "completed",
    isPublic: true,
    forks: 34,
    views: 1876,
    author: {
      name: "ZenMaster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zen",
    },
    prompt: "Japanese zen garden with raked sand patterns, stone arrangements, gentle wind moving bamboo, morning mist",
    settings: {
      duration: 10,
      aspectRatio: "16:9",
      style: "Natural",
      model: "Gen-3 Alpha",
    },
    versions: [],
  },
  {
    id: "c5",
    title: "Space Station Orbit",
    description: "View of Earth from an orbiting space station",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=225&fit=crop",
    createdAt: "2024-01-07T14:45:00Z",
    updatedAt: "2024-01-07T14:45:00Z",
    status: "completed",
    isPublic: true,
    forks: 203,
    views: 12450,
    author: {
      name: "SpaceVoyager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=space",
    },
    prompt: "POV from space station window looking at Earth, slow rotation, sunrise over the planet, stars visible",
    settings: {
      duration: 8,
      aspectRatio: "16:9",
      style: "Cinematic",
      model: "Gen-3 Alpha",
    },
    versions: [],
  },
  {
    id: "c6",
    title: "Rainy Window",
    description: "Cozy view through a rain-streaked window",
    thumbnail: "https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=400&h=225&fit=crop",
    createdAt: "2024-01-05T20:00:00Z",
    updatedAt: "2024-01-05T20:00:00Z",
    status: "completed",
    isPublic: true,
    forks: 45,
    views: 2890,
    author: {
      name: "CozyVibes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cozy",
    },
    prompt: "Raindrops on window glass, blurred city lights in background, cozy indoor atmosphere, lofi aesthetic",
    settings: {
      duration: 15,
      aspectRatio: "9:16",
      style: "Lofi",
      model: "Stable Video",
    },
    versions: [],
  },
];

export const styleOptions = [
  "Cinematic",
  "Natural",
  "Abstract",
  "Anime",
  "Product",
  "Lofi",
  "Vintage",
  "Neon",
  "Minimalist",
  "Fantasy",
];

export const modelOptions = [
  { id: "gen3", name: "Gen-3 Alpha", description: "Best quality, slower" },
  { id: "stable", name: "Stable Video", description: "Fast, good quality" },
  { id: "animate", name: "AnimateDiff", description: "Best for animation" },
];

export const aspectRatioOptions = [
  { value: "16:9", label: "16:9 Landscape" },
  { value: "9:16", label: "9:16 Portrait" },
  { value: "1:1", label: "1:1 Square" },
];
