import type { Project } from "@/lib/studio/types";

export function projectForAccount(project: Project): Project {
  return {
    ...project,
    name: project.name.slice(0, 80),
    messages: project.messages.slice(-80).map((message) => ({ ...message, content: message.content.slice(0, 6000) })),
    files: project.files.slice(0, 24).map((file) => ({
      path: file.path.slice(0, 120),
      content: file.content.slice(0, 60_000),
    })),
    images: project.images.slice(-8).map((image) => ({
      ...image,
      prompt: image.prompt.slice(0, 500),
      url: image.url.startsWith("https://") && image.url.length <= 300 ? image.url : "",
    })),
  };
}

function restoreImages(remote: Project, local: Project): Project {
  const localImages = new Map(local.images.map((image) => [image.id, image]));
  return {
    ...remote,
    images: remote.images.map((image) => {
      if (image.url) return image;
      const previous = localImages.get(image.id);
      return previous?.url ? { ...image, url: previous.url } : image;
    }),
  };
}

export function mergeAccountProjects(local: Project[], remote: Project[]) {
  const byId = new Map(local.map((project) => [project.id, project]));
  for (const project of remote) {
    const current = byId.get(project.id);
    if (!current || project.updatedAt > current.updatedAt) {
      byId.set(project.id, current ? restoreImages(project, current) : project);
    }
  }
  const projects = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
  const remoteById = new Map(remote.map((project) => [project.id, project]));
  const push = projects.filter((project) => {
    const current = remoteById.get(project.id);
    return !current || project.updatedAt > current.updatedAt;
  });
  return { projects, push };
}
