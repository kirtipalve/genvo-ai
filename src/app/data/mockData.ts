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
  shots?: Shot[];
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
    shots: [
      {
        id: "s1-1",
        order: 0,
        prompt: "Aerial establishing shot: city skyline from far above, lights twinkling",
        duration: 3,
        thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=225&fit=crop",
        status: "done",
      },
      {
        id: "s1-2",
        order: 1,
        prompt: "Sweeping descent through neon-lit skyscrapers, holographic billboards flickering",
        duration: 4,
        thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
        status: "done",
      },
      {
        id: "s1-3",
        order: 2,
        prompt: "Ground-level shot: wet street reflections, flying cars overhead",
        duration: 3,
        thumbnail: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=225&fit=crop",
        status: "done",
      },
      {
        id: "s1-4",
        order: 3,
        prompt: "Close-up neon sign sputtering, rain droplets on camera lens",
        duration: 2,
        thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop",
        status: "pending",
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
    shots: [
      {
        id: "s2-1",
        order: 0,
        prompt: "Pre-dawn horizon, dark ocean with first light traces appearing",
        duration: 4,
        thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=225&fit=crop",
        status: "done",
      },
      {
        id: "s2-2",
        order: 1,
        prompt: "Sun breaking the horizon, golden rays hitting calm water surface",
        duration: 5,
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=225&fit=crop",
        status: "done",
      },
      {
        id: "s2-3",
        order: 2,
        prompt: "Wide angle full sunrise, sky ablaze in orange and pink",
        duration: 4,
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        status: "pending",
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

export interface Comment {
  id: string;
  versionId: string;
  projectId: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
}

export const mockComments: Comment[] = [
  // Cyberpunk City Flythrough - v1
  {
    id: "cm1",
    versionId: "v1",
    projectId: "1",
    author: { name: "Sarah", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sarah" },
    text: "Great start! The neon palette is on point. Maybe push the camera angle a bit lower for more drama?",
    timestamp: "2024-01-15T12:10:00Z",
  },
  {
    id: "cm2",
    versionId: "v1",
    projectId: "1",
    author: { name: "John", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=john" },
    text: "Love the vibe. Could we try adding some holographic ads in v2?",
    timestamp: "2024-01-15T14:45:00Z",
  },
  // Cyberpunk City Flythrough - v2
  {
    id: "cm3",
    versionId: "v2",
    projectId: "1",
    author: { name: "Sarah", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sarah" },
    text: "Big improvement on v1! The wet street reflections look stunning now.",
    timestamp: "2024-01-16T10:00:00Z",
  },
  {
    id: "cm4",
    versionId: "v2",
    projectId: "1",
    author: { name: "You", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=user" },
    text: "Agreed — adding flying cars and billboards for the next version.",
    timestamp: "2024-01-16T11:30:00Z",
  },
  // Ocean Sunrise - v1
  {
    id: "cm5",
    versionId: "v1",
    projectId: "2",
    author: { name: "AuroraCreator", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=aurora" },
    text: "The golden hour lighting is perfect. This is exactly the mood I was going for.",
    timestamp: "2024-01-12T09:20:00Z",
  },
  // Abstract Fluid - v2
  {
    id: "cm6",
    versionId: "v2",
    projectId: "3",
    author: { name: "John", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=john" },
    text: "The iridescent bubble effect in v2 is mesmerizing — way better than v1!",
    timestamp: "2024-01-11T12:00:00Z",
  },
  {
    id: "cm7",
    versionId: "v2",
    projectId: "3",
    author: { name: "You", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=user" },
    text: "Thanks! Going to try a 9:16 crop for Instagram next.",
    timestamp: "2024-01-11T13:15:00Z",
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

export interface Shot {
  id: string;
  order: number;
  prompt: string;
  duration: number; // seconds
  thumbnail: string;
  status: "pending" | "generating" | "done";
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: "Cinematic" | "Product" | "Nature" | "Urban" | "Abstract";
  prompt: string;
  style: string;
  thumbnail: string;
  tags: string[];
}

export const promptTemplates: PromptTemplate[] = [
  // Cinematic
  {
    id: "t1",
    title: "Cyberpunk City Flythrough",
    category: "Cinematic",
    prompt: "A cinematic aerial flythrough of a futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic billboards, dramatic camera movement",
    style: "Cinematic",
    thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    tags: ["sci-fi", "night", "aerial"],
  },
  {
    id: "t2",
    title: "Epic Sunset Timelapse",
    category: "Cinematic",
    prompt: "A breathtaking cinematic timelapse of a golden sunset over mountain peaks, clouds moving rapidly, dramatic lighting changes, wide establishing shot",
    style: "Cinematic",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
    tags: ["sunset", "mountains", "timelapse"],
  },
  {
    id: "t3",
    title: "Underwater Discovery",
    category: "Cinematic",
    prompt: "A stunning cinematic dive through a vibrant coral reef, schools of colorful fish parting as the camera glides through, shafts of sunlight piercing crystal blue water",
    style: "Cinematic",
    thumbnail: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=400&h=225&fit=crop",
    tags: ["underwater", "ocean", "nature"],
  },
  // Product
  {
    id: "t4",
    title: "Luxury Watch Reveal",
    category: "Product",
    prompt: "A sleek product reveal of a luxury watch, slow 360-degree rotation, studio lighting with dramatic shadows, macro close-up of intricate mechanisms, minimalist white background",
    style: "Product",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop",
    tags: ["watch", "luxury", "studio"],
  },
  {
    id: "t5",
    title: "Perfume Bottle Splash",
    category: "Product",
    prompt: "Elegant perfume bottle surrounded by slow-motion flower petals falling, golden light rays, liquid pouring in macro close-up, luxury brand aesthetic",
    style: "Product",
    thumbnail: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=225&fit=crop",
    tags: ["perfume", "beauty", "macro"],
  },
  {
    id: "t6",
    title: "Tech Device Unbox",
    category: "Product",
    prompt: "Minimalist unboxing reveal of a premium tech device, clean white studio, hands lifting lid in slow motion, product catching light, subtle particle effects",
    style: "Minimalist",
    thumbnail: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=225&fit=crop",
    tags: ["tech", "unboxing", "minimal"],
  },
  // Nature
  {
    id: "t7",
    title: "Forest Morning Mist",
    category: "Nature",
    prompt: "Slow cinematic push through an ancient forest at dawn, golden morning light filtering through tall trees, ground mist swirling, birdsong, dewdrops on leaves glistening",
    style: "Natural",
    thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=225&fit=crop",
    tags: ["forest", "morning", "mist"],
  },
  {
    id: "t8",
    title: "Ocean Storm Waves",
    category: "Nature",
    prompt: "Dramatic slow-motion ocean waves crashing against rocky cliffs during a storm, spray catching sunlight, powerful and raw, wide angle and macro alternating",
    style: "Natural",
    thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=225&fit=crop",
    tags: ["ocean", "waves", "storm"],
  },
  {
    id: "t9",
    title: "Cherry Blossom Rain",
    category: "Nature",
    prompt: "Slow-motion cherry blossom petals drifting in a gentle breeze against a soft blue sky, traditional Japanese garden, peaceful and serene, handheld gentle movement",
    style: "Natural",
    thumbnail: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=225&fit=crop",
    tags: ["spring", "japan", "flowers"],
  },
  // Urban
  {
    id: "t10",
    title: "City Commute Rush Hour",
    category: "Urban",
    prompt: "Dynamic timelapse of a bustling city intersection at rush hour, pedestrians blurring into light trails, taxi cabs weaving, neon signs reflecting on wet pavement",
    style: "Cinematic",
    thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=225&fit=crop",
    tags: ["city", "timelapse", "traffic"],
  },
  {
    id: "t11",
    title: "Rooftop Sunrise View",
    category: "Urban",
    prompt: "Slow pan across a city skyline from a rooftop at sunrise, golden hour light catching glass skyscrapers, steam rising from vents, birds flying across frame",
    style: "Cinematic",
    thumbnail: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=225&fit=crop",
    tags: ["rooftop", "sunrise", "skyline"],
  },
  {
    id: "t12",
    title: "Street Food Market",
    category: "Urban",
    prompt: "Vibrant street food market at dusk, colorful stalls lit by warm Edison bulbs, steam rising from woks, busy vendors, handheld documentary style",
    style: "Natural",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=225&fit=crop",
    tags: ["food", "market", "street"],
  },
  // Abstract
  {
    id: "t13",
    title: "Liquid Color Ink Drop",
    category: "Abstract",
    prompt: "Macro close-up of vibrant ink drops dispersing in water, swirling colors mixing in slow motion, purple, orange and teal, dreamlike and hypnotic",
    style: "Abstract",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop",
    tags: ["ink", "macro", "color"],
  },
  {
    id: "t14",
    title: "Neon Geometric Pulse",
    category: "Abstract",
    prompt: "Neon geometric shapes morphing and pulsing in a dark void, electric blue and magenta, synchronized to an invisible beat, futuristic data visualization aesthetic",
    style: "Neon",
    thumbnail: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400&h=225&fit=crop",
    tags: ["neon", "geometric", "futuristic"],
  },
  {
    id: "t15",
    title: "Particle Field Dance",
    category: "Abstract",
    prompt: "Millions of glowing particles forming and dissolving into organic flowing shapes against deep black, gold and white hues, looping seamlessly",
    style: "Abstract",
    thumbnail: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop",
    tags: ["particles", "abstract", "motion"],
  },
];
