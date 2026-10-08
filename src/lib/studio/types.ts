export type Mode =
  | "chat"
  | "code"
  | "image"
  | "video"
  | "agent"
  | "projects"
  | "memory"
  | "history"
  | "settings"
  | "help"
  | "links";

export type ProviderId = "grok" | "dahl" | "gonka" | "sambanova";

export type ChatRoute = {
  provider: ProviderId;
  key: string;
  model: string;
};

export type McpEndpoint = {
  id: string;
  name: string;
  url: string;
  token: string;
};

export type StudioLinks = {
  provider: ProviderId;
  dahlKey: string;
  dahlModel: string;
  gonkaKey: string;
  gonkaModel: string;
  sambanovaKey: string;
  sambanovaModel: string;
  codekitKey: string;
  githubToken: string;
  appUrl: string;
  mcp: McpEndpoint[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type StudioFile = {
  path: string;
  content: string;
};

export type GalleryItem = {
  id: string;
  prompt: string;
  url: string;
  createdAt: number;
};

export type Scene = {
  title: string;
  camera: string;
  action: string;
  visual: string;
};

export type Storyboard = {
  title: string;
  aspect: string;
  duration: number;
  voiceover: string;
  music: string;
  scenes: Scene[];
};

export type Prefs = {
  language: string;
  tone: string;
  notes: string;
};

export type Project = {
  id: string;
  name: string;
  updatedAt: number;
  messages: ChatMessage[];
  files: StudioFile[];
  activePath: string;
  images: GalleryItem[];
  storyboard: Storyboard | null;
};

export type Persisted = {
  activeId: string;
  prefs: Prefs;
  projects: Project[];
  links: StudioLinks;
};

export type CodeAction = "explain" | "fix" | "optimize" | "tests" | "debug" | "custom";
