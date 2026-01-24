"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import { TextEditor } from "~/components/admin/rich-text-editor";
import { withBasePath } from "~/lib/get-base-path";
import type { ContentData, ExperienceContent, SkillContent } from "~/lib/content";
import { Icons as AllIcons, type Icon } from "~/components/ui/icons";
import * as SiIcons from "react-icons/si";

// Available icons with their display names and search keywords
const availableIcons: { key: string; name: string; keywords: string[]; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "Figma", name: "Figma", keywords: ["figma", "design", "ui"], Icon: SiIcons.SiFigma },
  { key: "AdobeXD", name: "Adobe XD", keywords: ["adobe", "xd", "design"], Icon: SiIcons.SiAdobexd },
  { key: "Photoshop", name: "Photoshop", keywords: ["adobe", "photoshop", "ps", "photo"], Icon: SiIcons.SiAdobephotoshop },
  { key: "Illustrator", name: "Illustrator", keywords: ["adobe", "illustrator", "ai", "vector"], Icon: SiIcons.SiAdobeillustrator },
  { key: "AfterEffects", name: "After Effects", keywords: ["adobe", "after", "effects", "ae", "motion"], Icon: SiIcons.SiAdobeaftereffects },
  { key: "Premiere", name: "Premiere Pro", keywords: ["adobe", "premiere", "video"], Icon: SiIcons.SiAdobepremierepro },
  { key: "InDesign", name: "InDesign", keywords: ["adobe", "indesign", "layout"], Icon: SiIcons.SiAdobeindesign },
  { key: "Sketch", name: "Sketch", keywords: ["sketch", "design", "mac"], Icon: SiIcons.SiSketch },
  { key: "Canva", name: "Canva", keywords: ["canva", "design"], Icon: SiIcons.SiCanva },
  { key: "Blender", name: "Blender", keywords: ["blender", "3d", "modeling"], Icon: SiIcons.SiBlender },
  { key: "Unity", name: "Unity", keywords: ["unity", "game", "3d"], Icon: SiIcons.SiUnity },
  { key: "UnrealEngine", name: "Unreal Engine", keywords: ["unreal", "game", "3d", "engine"], Icon: SiIcons.SiUnrealengine },
  { key: "Arduino", name: "Arduino", keywords: ["arduino", "hardware", "iot"], Icon: SiIcons.SiArduino },
  { key: "RaspberryPi", name: "Raspberry Pi", keywords: ["raspberry", "pi", "hardware", "iot"], Icon: SiIcons.SiRaspberrypi },
  { key: "HTML", name: "HTML", keywords: ["html", "html5", "web"], Icon: SiIcons.SiHtml5 },
  { key: "CSS", name: "CSS", keywords: ["css", "css3", "web", "style"], Icon: SiIcons.SiCss3 },
  { key: "JavaScript", name: "JavaScript", keywords: ["javascript", "js", "web"], Icon: SiIcons.SiJavascript },
  { key: "TypeScript", name: "TypeScript", keywords: ["typescript", "ts", "web"], Icon: SiIcons.SiTypescript },
  { key: "React", name: "React", keywords: ["react", "reactjs", "web", "frontend"], Icon: SiIcons.SiReact },
  { key: "Vue", name: "Vue.js", keywords: ["vue", "vuejs", "web", "frontend"], Icon: SiIcons.SiVuedotjs },
  { key: "Angular", name: "Angular", keywords: ["angular", "web", "frontend"], Icon: SiIcons.SiAngular },
  { key: "Svelte", name: "Svelte", keywords: ["svelte", "web", "frontend"], Icon: SiIcons.SiSvelte },
  { key: "NextJS", name: "Next.js", keywords: ["next", "nextjs", "react", "web"], Icon: SiIcons.SiNextdotjs },
  { key: "NodeJS", name: "Node.js", keywords: ["node", "nodejs", "backend", "javascript"], Icon: SiIcons.SiNodedotjs },
  { key: "Python", name: "Python", keywords: ["python", "py"], Icon: SiIcons.SiPython },
  { key: "Java", name: "Java", keywords: ["java"], Icon: SiIcons.SiOpenjdk },
  { key: "CSharp", name: "C#", keywords: ["c#", "csharp", "dotnet"], Icon: SiIcons.SiDotnet },
  { key: "CPlusPlus", name: "C++", keywords: ["c++", "cpp"], Icon: SiIcons.SiCplusplus },
  { key: "Go", name: "Go", keywords: ["go", "golang"], Icon: SiIcons.SiGo },
  { key: "Rust", name: "Rust", keywords: ["rust"], Icon: SiIcons.SiRust },
  { key: "Swift", name: "Swift", keywords: ["swift", "ios", "apple"], Icon: SiIcons.SiSwift },
  { key: "Kotlin", name: "Kotlin", keywords: ["kotlin", "android"], Icon: SiIcons.SiKotlin },
  { key: "PHP", name: "PHP", keywords: ["php", "web", "backend"], Icon: SiIcons.SiPhp },
  { key: "Ruby", name: "Ruby", keywords: ["ruby", "rails"], Icon: SiIcons.SiRuby },
  { key: "TailwindCSS", name: "Tailwind CSS", keywords: ["tailwind", "css", "utility"], Icon: SiIcons.SiTailwindcss },
  { key: "Bootstrap", name: "Bootstrap", keywords: ["bootstrap", "css", "framework"], Icon: SiIcons.SiBootstrap },
  { key: "Sass", name: "Sass", keywords: ["sass", "scss", "css"], Icon: SiIcons.SiSass },
  { key: "Git", name: "Git", keywords: ["git", "version", "control"], Icon: SiIcons.SiGit },
  { key: "GitHub", name: "GitHub", keywords: ["github", "git"], Icon: SiIcons.SiGithub },
  { key: "GitLab", name: "GitLab", keywords: ["gitlab", "git"], Icon: SiIcons.SiGitlab },
  { key: "Docker", name: "Docker", keywords: ["docker", "container"], Icon: SiIcons.SiDocker },
  { key: "Kubernetes", name: "Kubernetes", keywords: ["kubernetes", "k8s", "container"], Icon: SiIcons.SiKubernetes },
  { key: "AWS", name: "AWS", keywords: ["aws", "amazon", "cloud"], Icon: SiIcons.SiAmazonwebservices },
  { key: "GoogleCloud", name: "Google Cloud", keywords: ["google", "cloud", "gcp"], Icon: SiIcons.SiGooglecloud },
  { key: "Azure", name: "Azure", keywords: ["azure", "microsoft", "cloud"], Icon: (props) => <span {...props} className={`font-bold text-[0.5em] ${props.className}`}>Az</span> },
  { key: "Firebase", name: "Firebase", keywords: ["firebase", "google", "backend"], Icon: SiIcons.SiFirebase },
  { key: "MongoDB", name: "MongoDB", keywords: ["mongodb", "database", "nosql"], Icon: SiIcons.SiMongodb },
  { key: "PostgreSQL", name: "PostgreSQL", keywords: ["postgresql", "postgres", "database", "sql"], Icon: SiIcons.SiPostgresql },
  { key: "MySQL", name: "MySQL", keywords: ["mysql", "database", "sql"], Icon: SiIcons.SiMysql },
  { key: "Redis", name: "Redis", keywords: ["redis", "cache", "database"], Icon: SiIcons.SiRedis },
  { key: "GraphQL", name: "GraphQL", keywords: ["graphql", "api"], Icon: SiIcons.SiGraphql },
  { key: "Vercel", name: "Vercel", keywords: ["vercel", "deploy", "hosting"], Icon: SiIcons.SiVercel },
  { key: "Netlify", name: "Netlify", keywords: ["netlify", "deploy", "hosting"], Icon: SiIcons.SiNetlify },
  { key: "Jira", name: "Jira", keywords: ["jira", "project", "management"], Icon: SiIcons.SiJira },
  { key: "Confluence", name: "Confluence", keywords: ["confluence", "docs", "wiki"], Icon: SiIcons.SiConfluence },
  { key: "Notion", name: "Notion", keywords: ["notion", "docs", "notes"], Icon: SiIcons.SiNotion },
  { key: "Slack", name: "Slack", keywords: ["slack", "chat", "communication"], Icon: SiIcons.SiSlack },
  { key: "Discord", name: "Discord", keywords: ["discord", "chat", "communication"], Icon: SiIcons.SiDiscord },
  { key: "Trello", name: "Trello", keywords: ["trello", "project", "kanban"], Icon: SiIcons.SiTrello },
  { key: "Miro", name: "Miro", keywords: ["miro", "whiteboard", "collaboration"], Icon: SiIcons.SiMiro },
  { key: "InVision", name: "InVision", keywords: ["invision", "prototype", "design"], Icon: SiIcons.SiInvision },
  { key: "Framer", name: "Framer", keywords: ["framer", "prototype", "design"], Icon: SiIcons.SiFramer },
  { key: "Webflow", name: "Webflow", keywords: ["webflow", "nocode", "design"], Icon: SiIcons.SiWebflow },
  { key: "WordPress", name: "WordPress", keywords: ["wordpress", "cms", "blog"], Icon: SiIcons.SiWordpress },
  { key: "Shopify", name: "Shopify", keywords: ["shopify", "ecommerce"], Icon: SiIcons.SiShopify },
  { key: "Stripe", name: "Stripe", keywords: ["stripe", "payment"], Icon: SiIcons.SiStripe },
  { key: "Linux", name: "Linux", keywords: ["linux", "os"], Icon: SiIcons.SiLinux },
  { key: "Ubuntu", name: "Ubuntu", keywords: ["ubuntu", "linux"], Icon: SiIcons.SiUbuntu },
  { key: "Windows", name: "Windows", keywords: ["windows", "microsoft"], Icon: (props) => <span {...props} className={`font-bold text-[0.5em] ${props.className}`}>W</span> },
  { key: "Apple", name: "Apple", keywords: ["apple", "mac", "ios"], Icon: SiIcons.SiApple },
  { key: "Android", name: "Android", keywords: ["android", "mobile"], Icon: SiIcons.SiAndroid },
  { key: "Ros", name: "ROS", keywords: ["ros", "robot", "robotics"], Icon: SiIcons.SiRos },
  { key: "Matlab", name: "MATLAB", keywords: ["matlab", "math", "simulation"], Icon: (props) => <span {...props} className={`font-bold text-[0.6em] ${props.className}`}>M</span> },
  { key: "R", name: "R", keywords: ["r", "statistics", "data"], Icon: SiIcons.SiR },
  { key: "Tensorflow", name: "TensorFlow", keywords: ["tensorflow", "ml", "ai"], Icon: SiIcons.SiTensorflow },
  { key: "Pytorch", name: "PyTorch", keywords: ["pytorch", "ml", "ai"], Icon: SiIcons.SiPytorch },
  { key: "OpenAI", name: "OpenAI", keywords: ["openai", "ai", "gpt"], Icon: SiIcons.SiOpenai },
  { key: "Npm", name: "npm", keywords: ["npm", "package", "node"], Icon: SiIcons.SiNpm },
  { key: "Yarn", name: "Yarn", keywords: ["yarn", "package", "node"], Icon: SiIcons.SiYarn },
  { key: "Vite", name: "Vite", keywords: ["vite", "build", "bundler"], Icon: SiIcons.SiVite },
  { key: "Webpack", name: "Webpack", keywords: ["webpack", "build", "bundler"], Icon: SiIcons.SiWebpack },
  { key: "ESLint", name: "ESLint", keywords: ["eslint", "lint", "code"], Icon: SiIcons.SiEslint },
  { key: "Prettier", name: "Prettier", keywords: ["prettier", "format", "code"], Icon: SiIcons.SiPrettier },
  { key: "Jest", name: "Jest", keywords: ["jest", "test", "javascript"], Icon: SiIcons.SiJest },
  { key: "Cypress", name: "Cypress", keywords: ["cypress", "test", "e2e"], Icon: SiIcons.SiCypress },
  { key: "Storybook", name: "Storybook", keywords: ["storybook", "ui", "component"], Icon: SiIcons.SiStorybook },
  { key: "ShadcnUI", name: "Shadcn UI", keywords: ["shadcn", "ui", "component"], Icon: SiIcons.SiShadcnui },
  { key: "MUI", name: "Material UI", keywords: ["material", "mui", "ui", "component"], Icon: SiIcons.SiMui },
  { key: "ChakraUI", name: "Chakra UI", keywords: ["chakra", "ui", "component"], Icon: SiIcons.SiChakraui },
  { key: "Prisma", name: "Prisma", keywords: ["prisma", "orm", "database"], Icon: SiIcons.SiPrisma },
  { key: "Supabase", name: "Supabase", keywords: ["supabase", "backend", "database"], Icon: SiIcons.SiSupabase },
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ContentData | null>(null);
  const [originalContent, setOriginalContent] = useState<ContentData | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "experiences" | "projects">("hero");
  const [editingExperience, setEditingExperience] = useState<ExperienceContent | null>(null);
  const [projectsList, setProjectsList] = useState<
    { path: string; url: string; name: string; subtitle: string | null }[]
  >([]);
  const [editingProject, setEditingProject] = useState<
    { path: string; name: string; subtitle?: string | null } | null
  >(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Project PDFs state
  const [projectPdfs, setProjectPdfs] = useState<
    { title: string; pdfPath: string; imagePath: string; thumbnailPath: string }[]
  >([]);
  const [projectPdfsOrder, setProjectPdfsOrder] = useState<string[]>([]);
  const [draggedPdfIndex, setDraggedPdfIndex] = useState<number | null>(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [editingPdf, setEditingPdf] = useState<{
    key: string;
    title: string;
    subtitle?: string | null;
    pdfPath: string;
  } | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillContent | null>(null);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [uploadingSkillIcon, setUploadingSkillIcon] = useState(false);
  const skillIconInputRef = useRef<HTMLInputElement | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  // Auto-detect icon from availableIcons using name and keywords
  const autoDetectIcon = (name: string): string => {
    const lowerName = name.toLowerCase().trim();

    // First, try exact name match
    const exactMatch = availableIcons.find(icon =>
      icon.name.toLowerCase() === lowerName || icon.key.toLowerCase() === lowerName
    );
    if (exactMatch) return exactMatch.key;

    // Then, try keyword match
    const keywordMatch = availableIcons.find(icon =>
      icon.keywords.some(keyword => keyword === lowerName || lowerName.includes(keyword))
    );
    if (keywordMatch) return keywordMatch.key;

    // Finally, try partial name match
    const partialMatch = availableIcons.find(icon =>
      icon.name.toLowerCase().includes(lowerName) || lowerName.includes(icon.name.toLowerCase())
    );
    if (partialMatch) return partialMatch.key;

    return "";
  };

  const openThumbnailPicker = (title: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.webp,.avif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploadingThumbnail(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      try {
        const res = await fetch("/api/content/projects/thumbnail", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          await loadProjectPdfs();
          setMessage({ type: "success", text: "Thumbnail updated!" });
          setTimeout(() => setMessage(null), 2000);
        } else {
          const error = await res.json();
          setMessage({ type: "error", text: error.error || "Upload failed" });
        }
      } catch {
        setMessage({ type: "error", text: "Failed to upload thumbnail" });
      } finally {
        setUploadingThumbnail(false);
        input.value = "";
      }
    };

    // trigger file picker
    input.click();
  };

  const hasUnsavedChanges = content && originalContent
    ? JSON.stringify(content) !== JSON.stringify(originalContent)
    : false;

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      setAuthenticated(true);
    } catch {
      router.push("/admin/login");
    }
  }, [router]);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        setOriginalContent(data);
      }
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    loadContent();
  }, [checkAuth, loadContent]);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (activeTab === "projects") {
      loadProjects();
      loadProjectPdfs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/content/projects");
      if (res.ok) {
        const data = await res.json();
        setProjectsList(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadProjectPdfs = async () => {
    try {
      const res = await fetch("/api/content/projects/pdfs");
      if (res.ok) {
        const data = await res.json();
        setProjectPdfs(data.items || []);
        setProjectPdfsOrder(data.items?.map((item: { title: string }) => item.title) || []);
      }
    } catch (error) {
      console.error("Failed to load project PDFs:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const saveAllContent = async () => {
    if (!content) return;

    setSaving(true);
    setMessage(null);

    try {
      // Save all sections
      const sections = [
        { name: "hero", data: content.hero },
        { name: "about", data: content.about },
        { name: "site", data: content.site },
        { name: "location", data: content.location || { city: "", country: "" } },
        { name: "sections", data: content.sections },
        { name: "skills", data: content.skills || [] },
      ];

      for (const section of sections) {
        const res = await fetch(`/api/content/${section.name}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(section.data),
        });

        if (!res.ok) {
          setMessage({ type: "error", text: `Failed to save ${section.name}` });
          return;
        }
      }

      setOriginalContent(content);
      setMessage({ type: "success", text: "All changes saved!" });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const saveExperience = async (experience: ExperienceContent) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/content/experiences", {
        method: experience.id.startsWith("exp-new") ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experience),
      });

      if (res.ok) {
        const result = await res.json();
        setContent(result.content);
        setEditingExperience(null);
        setMessage({ type: "success", text: "Experience saved!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save experience" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save experience" });
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/content/experiences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const result = await res.json();
        setContent(result.content);
        setMessage({ type: "success", text: "Experience deleted!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to load content</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-sm border-b">
        <div className="container max-w-6xl flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl">Content Manager</h1>
            {hasUnsavedChanges && (
              <span className="text-sm text-warning">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              onPress={saveAllContent}
              isDisabled={saving || !hasUnsavedChanges}
            >
              <Icons.Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <a
              href="/"
              target="_blank"
              className="text-sm text-muted-fg hover:text-fg flex items-center gap-1"
            >
              <Icons.Eye className="size-4" />
              View Site
            </a>
            <Button variant="ghost" size="sm" onPress={handleLogout}>
              <Icons.LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-danger/10 text-danger border border-danger/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="container max-w-6xl py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b overflow-x-auto">
          {(["hero", "projects", "experiences", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-fg hover:text-fg"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Hero Section</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={content.hero.name}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <TextEditor
                  value={content.hero.bio}
                  onChange={(value) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, bio: value },
                    })
                  }
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profile picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border">
                    <img
                      src={profilePreviewUrl || withBasePath("/profile-picture/fereshteh_portrait.avif")}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      ref={(el) => (profileInputRef.current = el)}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSelectedProfileFile(file);
                        try {
                          const url = URL.createObjectURL(file);
                          setProfilePreviewUrl(url);
                        } catch {
                          setProfilePreviewUrl(null);
                        }
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <Button variant="outline" onPress={() => profileInputRef.current?.click()}>
                        Choose image
                      </Button>

                      <Button
                        onPress={async () => {
                          if (!selectedProfileFile) return;
                          setUploadingProfilePicture(true);
                          setMessage(null);

                          try {
                            const formData = new FormData();
                            formData.append("file", selectedProfileFile);

                            const res = await fetch("/api/content/site/profile-picture", {
                              method: "POST",
                              body: formData,
                            });

                            if (res.ok) {
                              setMessage({ type: "success", text: "Profile picture uploaded!" });
                              setSelectedProfileFile(null);
                              setTimeout(() => setMessage(null), 3000);
                              // revoke preview and reload served image by clearing preview
                              setTimeout(() => setProfilePreviewUrl(null), 500);
                            } else {
                              const error = await res.json();
                              setMessage({ type: "error", text: error.error || "Upload failed" });
                            }
                          } catch {
                            setMessage({ type: "error", text: "Failed to upload profile picture" });
                          } finally {
                            setUploadingProfilePicture(false);
                          }
                        }}
                        isDisabled={!selectedProfileFile || uploadingProfilePicture}
                      >
                        {uploadingProfilePicture ? "Uploading..." : "Upload image"}
                      </Button>
                    </div>

                    {selectedProfileFile && (
                      <div className="text-sm text-muted-fg">Selected: {selectedProfileFile.name}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="availableForWork"
                  checked={content.hero.availableForWork}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, availableForWork: e.target.checked },
                    })
                  }
                  className="size-4"
                />
                <label htmlFor="availableForWork" className="text-sm font-medium">
                  Available for work
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showResumeButton"
                  checked={content.hero.showResumeButton}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, showResumeButton: e.target.checked },
                    })
                  }
                  className="size-4"
                />
                <label htmlFor="showResumeButton" className="text-sm font-medium">
                  Show resume button
                </label>
              </div>
            </div>

            
          </div>
        )}

        {/* About Section */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About Section</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.about.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: { ...content.about, title: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <TextEditor
                  value={content.about.description}
                  onChange={(value) =>
                    setContent({
                      ...content,
                      about: { ...content.about, description: value },
                    })
                  }
                  rows={6}
                />
              </div>

              <hr className="my-6 border-border" />

              <h3 className="text-xl font-bold">Site Settings</h3>

              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={content.site.name}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      site: { ...content.site, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Site Description</label>
                <TextEditor
                  value={content.site.description}
                  onChange={(value) =>
                    setContent({
                      ...content,
                      site: { ...content.site, description: value },
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={content.site.email}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      site: { ...content.site, email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={content.site.linkedIn}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      site: { ...content.site, linkedIn: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <hr className="my-6 border-border" />

              <h3 className="text-xl font-bold">Location</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={content.location?.city || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        location: { ...content.location, city: e.target.value, country: content.location?.country || "" },
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Vienna"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={content.location?.country || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        location: { ...content.location, city: content.location?.city || "", country: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Austria"
                  />
                </div>
              </div>

              <hr className="my-6 border-border" />

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Skills</h3>
                <Button
                  onPress={() => {
                    setEditingSkill({
                      name: "",
                      icon: "",
                      url: "",
                    });
                    setEditingSkillIndex(null);
                  }}
                >
                  <Icons.Plus className="size-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              {editingSkill && (
                <div className="p-6 rounded-lg border bg-secondary/10 space-y-4">
                  <h4 className="font-semibold text-lg">
                    {editingSkill.name ? "Edit Skill" : "Add Skill"}
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={editingSkill.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          const detectedIcon = autoDetectIcon(newName);
                          // Only auto-set icon if no custom icon and either no icon set or icon was auto-detected
                          if (!editingSkill.customIcon && (detectedIcon || !editingSkill.icon)) {
                            setEditingSkill({ ...editingSkill, name: newName, icon: detectedIcon });
                          } else {
                            setEditingSkill({ ...editingSkill, name: newName });
                          }
                        }}
                        className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g., Figma"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">URL</label>
                      <input
                        type="url"
                        value={editingSkill.url}
                        onChange={(e) => setEditingSkill({ ...editingSkill, url: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g., https://figma.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Icon</label>

                    {/* Current selected icon */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="size-12 flex items-center justify-center border-2 rounded-lg bg-bg">
                        {editingSkill.customIcon ? (
                          <img src={withBasePath(editingSkill.customIcon)} alt="Custom icon" className="size-8" />
                        ) : editingSkill.icon ? (
                          (() => {
                            const iconData = availableIcons.find(i => i.key === editingSkill.icon);
                            if (iconData) {
                              return <iconData.Icon className="size-8" />;
                            }
                            // Fallback to built-in icons
                            const IconComponent = editingSkill.icon in AllIcons ? AllIcons[editingSkill.icon as Icon] : null;
                            return IconComponent ? <IconComponent className="size-8" /> : <span className="text-sm font-medium">{editingSkill.name.slice(0, 2)}</span>;
                          })()
                        ) : (
                          <span className="text-muted-fg text-xs">None</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{editingSkill.icon || editingSkill.customIcon ? "Selected" : "No icon selected"}</p>
                        <p className="text-xs text-muted-fg">{editingSkill.customIcon ? "Custom SVG" : editingSkill.icon || "Choose from below or upload custom"}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => skillIconInputRef.current?.click()}
                      >
                        <Icons.Upload className="size-4 mr-2" />
                        Upload SVG
                      </Button>
                    </div>

                    {/* Icon search */}
                    <input
                      type="text"
                      value={iconSearchQuery}
                      onChange={(e) => setIconSearchQuery(e.target.value)}
                      placeholder="Search icons..."
                      className="w-full px-4 py-2 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none mb-3"
                    />

                    {/* Icon grid */}
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-bg">
                      <div className="grid grid-cols-8 gap-1">
                        {availableIcons
                          .filter(icon => {
                            const query = iconSearchQuery.toLowerCase();
                            if (!query) return true;
                            return icon.name.toLowerCase().includes(query) ||
                              icon.keywords.some(k => k.includes(query));
                          })
                          .map((icon) => (
                            <button
                              key={icon.key}
                              type="button"
                              onClick={() => setEditingSkill({ ...editingSkill, icon: icon.key, customIcon: undefined })}
                              className={`p-2 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-center ${
                                editingSkill.icon === icon.key && !editingSkill.customIcon
                                  ? "bg-primary/20 ring-2 ring-primary"
                                  : ""
                              }`}
                              title={icon.name}
                            >
                              <icon.Icon className="size-6" />
                            </button>
                          ))}
                      </div>
                      {availableIcons.filter(icon => {
                        const query = iconSearchQuery.toLowerCase();
                        if (!query) return true;
                        return icon.name.toLowerCase().includes(query) ||
                          icon.keywords.some(k => k.includes(query));
                      }).length === 0 && (
                        <p className="text-center text-muted-fg text-sm py-4">No icons found. Try uploading a custom SVG.</p>
                      )}
                    </div>

                    <input
                      ref={skillIconInputRef}
                      type="file"
                      accept=".svg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !editingSkill.name) return;

                        setUploadingSkillIcon(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("name", editingSkill.name);

                          const res = await fetch("/api/content/skills/icon", {
                            method: "POST",
                            body: formData,
                          });

                          if (res.ok) {
                            const data = await res.json();
                            setEditingSkill({ ...editingSkill, customIcon: data.iconPath, icon: "" });
                          } else {
                            setMessage({ type: "error", text: "Failed to upload icon" });
                          }
                        } catch {
                          setMessage({ type: "error", text: "Failed to upload icon" });
                        } finally {
                          setUploadingSkillIcon(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    {!editingSkill.name && (
                      <p className="text-xs text-muted-fg mt-1">Enter a name first to upload a custom icon</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onPress={() => {
                        if (!editingSkill.name) return;
                        const skills = [...(content.skills || [])];

                        if (editingSkillIndex !== null && editingSkillIndex >= 0) {
                          // Editing existing skill - update at index
                          skills[editingSkillIndex] = editingSkill;
                        } else {
                          // Adding new skill
                          skills.push(editingSkill);
                        }

                        setContent({ ...content, skills });
                        setEditingSkill(null);
                        setEditingSkillIndex(null);
                      }}
                      isDisabled={!editingSkill.name}
                    >
                      <Icons.Save className="size-4 mr-2" />
                      Save Skill
                    </Button>
                    <Button variant="ghost" onPress={() => { setEditingSkill(null); setEditingSkillIndex(null); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(content.skills || []).map((skill, index) => (
                  <div
                    key={skill.name}
                    className="p-4 rounded-lg border bg-secondary/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 flex items-center justify-center border rounded-lg bg-bg">
                        {skill.customIcon ? (
                          <img src={withBasePath(skill.customIcon)} alt={skill.name} className="size-6" />
                        ) : skill.icon && skill.icon in AllIcons ? (
                          (() => {
                            const IconComponent = AllIcons[skill.icon as Icon];
                            return IconComponent ? <IconComponent className="size-6" /> : null;
                          })()
                        ) : (
                          <span className="text-xs font-medium">{skill.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{skill.name}</h4>
                        <p className="text-xs text-muted-fg truncate max-w-[200px]">{skill.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onPress={() => { setEditingSkill(skill); setEditingSkillIndex(index); }}>
                        <Icons.Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          const skills = (content.skills || []).filter((_, i) => i !== index);
                          setContent({ ...content, skills });
                        }}
                      >
                        <Icons.Trash className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Experiences Section */}
        {activeTab === "experiences" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Experiences Section</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={content.sections?.experienceTitle || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    sections: { ...content.sections, experienceTitle: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., Experience"
              />
            </div>

            <hr className="my-6 border-border" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Experiences</h3>
              <Button
                onPress={() =>
                  setEditingExperience({
                    id: `exp-new-${Date.now()}`,
                    title: "",
                    company: "",
                    startedAt: new Date().toISOString().split("T")[0],
                    endedAt: null,
                    description: "",
                    skills: [],
                  })
                }
              >
                <Icons.Plus className="size-4 mr-2" />
                Add Experience
              </Button>
            </div>

            {editingExperience && (
              <ExperienceEditor
                experience={editingExperience}
                onSave={saveExperience}
                onCancel={() => setEditingExperience(null)}
                saving={saving}
              />
            )}

            <div className="space-y-4">
              {content.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-lg border bg-secondary/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-muted-fg">{exp.company}</p>
                      <p className="text-xs text-muted-fg mt-1">
                        {new Date(exp.startedAt).toLocaleDateString()} -{" "}
                        {exp.endedAt
                          ? new Date(exp.endedAt).toLocaleDateString()
                          : "Present"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setEditingExperience(exp)}
                      >
                        <Icons.Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => deleteExperience(exp.id)}
                      >
                        <Icons.Trash className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Projects Section</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={content.sections?.portfolioTitle || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    sections: { ...content.sections, portfolioTitle: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., Portfolio"
              />
            </div>

            <hr className="my-6 border-border" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Project PDFs</h3>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                isDraggingPdf
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPdf(true);
              }}
              onDragLeave={() => setIsDraggingPdf(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingPdf(false);

                const files = Array.from(e.dataTransfer.files);
                const pdfFiles = files.filter((f) => f.name.toLowerCase().endsWith(".pdf"));

                if (pdfFiles.length === 0) {
                  setMessage({ type: "error", text: "Please drop PDF files only" });
                  setTimeout(() => setMessage(null), 3000);
                  return;
                }

                setUploadingPdf(true);
                setMessage(null);

                for (const file of pdfFiles) {
                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("/api/content/projects/upload", {
                      method: "POST",
                      body: formData,
                    });

                    if (!res.ok) {
                      const error = await res.json();
                      setMessage({ type: "error", text: error.error || "Upload failed" });
                    }
                  } catch {
                    setMessage({ type: "error", text: `Failed to upload ${file.name}` });
                  }
                }

                setUploadingPdf(false);
                await loadProjectPdfs();
                setMessage({ type: "success", text: "Files uploaded! Image conversion running in background." });
                setTimeout(() => setMessage(null), 5000);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Icons.Upload className="size-12 text-muted-fg" />
                <div>
                  <p className="font-medium">
                    {uploadingPdf ? "Uploading..." : "Drag and drop PDF files here"}
                  </p>
                  <p className="text-sm text-muted-fg mt-1">or click to browse</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadingPdf}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;

                    setUploadingPdf(true);
                    setMessage(null);

                    for (const file of files) {
                      try {
                        const formData = new FormData();
                        formData.append("file", file);

                        const res = await fetch("/api/content/projects/upload", {
                          method: "POST",
                          body: formData,
                        });

                        if (!res.ok) {
                          const error = await res.json();
                          setMessage({ type: "error", text: error.error || "Upload failed" });
                        }
                      } catch {
                        setMessage({ type: "error", text: `Failed to upload ${file.name}` });
                      }
                    }

                    setUploadingPdf(false);
                    await loadProjectPdfs();
                    setMessage({ type: "success", text: "Files uploaded! Image conversion running in background." });
                    setTimeout(() => setMessage(null), 5000);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Project PDFs with Drag to Reorder */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Project PDFs</h3>
                <p className="text-sm text-muted-fg">Drag to reorder</p>
              </div>

              <div className="space-y-2">
                {(projectPdfsOrder.length > 0
                  ? projectPdfsOrder
                      .map((title) => projectPdfs.find((item) => item.title === title))
                      .filter((item): item is { title: string; pdfPath: string; imagePath: string; thumbnailPath: string } => item !== undefined)
                      .concat(
                        projectPdfs.filter((item) => !projectPdfsOrder.includes(item.title))
                      )
                  : projectPdfs
                ).map((item, index) => (
                  <div
                    key={item.title}
                    draggable
                    onDragStart={() => setDraggedPdfIndex(index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      if (draggedPdfIndex === null || draggedPdfIndex === index) return;

                      const currentOrder =
                        projectPdfsOrder.length > 0
                          ? projectPdfsOrder
                              .map((title) =>
                                projectPdfs.find((item) => item.title === title)
                              )
                              .filter((item): item is { title: string; pdfPath: string; imagePath: string; thumbnailPath: string } => item !== undefined)
                              .concat(
                                projectPdfs.filter(
                                  (item) => !projectPdfsOrder.includes(item.title)
                                )
                              )
                          : projectPdfs;

                      const newOrder = [...currentOrder];
                      const [movedItem] = newOrder.splice(draggedPdfIndex, 1);
                      newOrder.splice(index, 0, movedItem);

                      const orderTitles = newOrder.map((i) => i.title);
                      setProjectPdfsOrder(orderTitles);

                      try {
                        await fetch("/api/content/projects/pdfs", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ order: orderTitles }),
                        });
                        setMessage({ type: "success", text: "Order updated!" });
                        setTimeout(() => setMessage(null), 2000);
                      } catch {
                        setMessage({ type: "error", text: "Failed to save order" });
                      }

                      setDraggedPdfIndex(null);
                    }}
                    onDragEnd={() => setDraggedPdfIndex(null)}
                    className={`p-4 rounded-lg border bg-secondary/10 cursor-move transition-all ${
                      draggedPdfIndex === index ? "opacity-50" : "hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Icons.GripVertical className="size-5 text-muted-fg mt-1 shrink-0" />

                      {/* Thumbnail Preview */}
                      <div className="relative group shrink-0">
                        <div className="w-20 h-28 bg-secondary/20 rounded overflow-hidden border">
                          {item.thumbnailPath && (
                            <img
                              src={item.thumbnailPath}
                              alt={`${item.title} thumbnail`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-xs text-muted-fg truncate">{item.pdfPath}</p>
                        <p className="text-xs text-muted-fg mt-1">
                          {item.thumbnailPath.includes("projects-thumbnails")
                            ? "Custom thumbnail"
                            : "Using generated image"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => openThumbnailPicker(item.title)}
                          isDisabled={uploadingThumbnail}
                        >
                          <Icons.Image className="size-4 mr-2" />
                          Set custom thumbnail
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => {
                            // derive key from pdf filename
                            try {
                              const parts = (item.pdfPath || "").split("/");
                              const file = parts[parts.length - 1] || item.title;
                              const key = file.replace(/\.pdf$/i, "");
                              setEditingPdf({ key, title: item.title, subtitle: (item as any).subtitle || null, pdfPath: item.pdfPath });
                            } catch {
                              setEditingPdf({ key: item.title, title: item.title, subtitle: (item as any).subtitle || null, pdfPath: item.pdfPath });
                            }
                          }}
                        >
                          <Icons.Edit className="size-4 mr-2" />
                          Edit metadata
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={async () => {
                            if (!confirm(`Delete "${item.title}"?`)) return;

                            try {
                              const res = await fetch("/api/content/projects/pdfs", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ title: item.title }),
                              });

                              if (res.ok) {
                                await loadProjectPdfs();
                                setMessage({ type: "success", text: "Deleted!" });
                                setTimeout(() => setMessage(null), 2000);
                              }
                            } catch {
                              setMessage({ type: "error", text: "Failed to delete" });
                            }
                          }}
                        >
                          <Icons.Trash className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

                {/* PDF Project metadata editor */}
                {editingPdf && (
                  <div className="p-6 rounded-lg border bg-secondary/10 space-y-4 mt-6">
                    <h3 className="font-semibold text-lg">Edit PDF Metadata</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={editingPdf.title}
                        onChange={(e) => setEditingPdf({ ...editingPdf, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={editingPdf.subtitle || ""}
                        onChange={(e) => setEditingPdf({ ...editingPdf, subtitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onPress={async () => {
                          if (!editingPdf) return;
                          setSaving(true);
                          setMessage(null);
                          try {
                            const res = await fetch("/api/content/projects/metadata", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ key: editingPdf.key, data: { title: editingPdf.title, subtitle: editingPdf.subtitle || "" } }),
                            });

                            if (res.ok) {
                              await loadProjectPdfs();
                              setEditingPdf(null);
                              setMessage({ type: "success", text: "Metadata saved!" });
                              setTimeout(() => setMessage(null), 2000);
                            } else {
                              setMessage({ type: "error", text: "Failed to save metadata" });
                            }
                          } catch {
                            setMessage({ type: "error", text: "Failed to save metadata" });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        isDisabled={saving}
                      >
                        <Icons.Save className="size-4 mr-2" />
                        {saving ? "Saving..." : "Save"}
                      </Button>

                      <Button variant="ghost" onPress={() => setEditingPdf(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* MDX Projects Section */}
            {projectsList.length > 0 && (
              <>
                <hr className="my-6 border-border" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">MDX Projects</h3>
                </div>

                {editingProject && (
                  <div className="p-6 rounded-lg border bg-secondary/10 space-y-4">
                    <h3 className="font-semibold text-lg">Edit Project</h3>

                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={editingProject.subtitle || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onPress={async () => {
                          if (!editingProject) return;
                          setSaving(true);
                          setMessage(null);
                          try {
                            const res = await fetch("/api/content/projects", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ path: editingProject.path, data: { name: editingProject.name, subtitle: editingProject.subtitle || "" } }),
                            });

                            if (res.ok) {
                              await loadProjects();
                              setEditingProject(null);
                              setMessage({ type: "success", text: "Project saved!" });
                              setTimeout(() => setMessage(null), 3000);
                            } else {
                              setMessage({ type: "error", text: "Failed to save project" });
                            }
                          } catch {
                            setMessage({ type: "error", text: "Failed to save project" });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        isDisabled={saving}
                      >
                        <Icons.Save className="size-4 mr-2" />
                        {saving ? "Saving..." : "Save Project"}
                      </Button>

                      <Button variant="ghost" onPress={() => setEditingProject(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {projectsList.map((p) => (
                    <div key={p.url ?? p.path} className="p-4 rounded-lg border bg-secondary/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{p.name}</h3>
                          {p.subtitle && <p className="text-sm text-muted-fg">{p.subtitle}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onPress={() => setEditingProject({ path: p.path, name: p.name, subtitle: p.subtitle })}>
                            <Icons.Edit className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

interface ExperienceEditorProps {
  experience: ExperienceContent;
  onSave: (exp: ExperienceContent) => void;
  onCancel: () => void;
  saving: boolean;
}

function ExperienceEditor({
  experience,
  onSave,
  onCancel,
  saving,
}: ExperienceEditorProps) {
  const [exp, setExp] = useState(experience);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !exp.skills.includes(skillInput.trim())) {
      setExp({ ...exp, skills: [...exp.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setExp({ ...exp, skills: exp.skills.filter((s) => s !== skill) });
  };

  return (
    <div className="p-6 rounded-lg border bg-secondary/10 space-y-4">
      <h3 className="font-semibold text-lg">
        {experience.id.startsWith("exp-new") ? "Add" : "Edit"} Experience
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            type="text"
            value={exp.title}
            onChange={(e) => setExp({ ...exp, title: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
            placeholder="e.g., UX Designer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Company</label>
          <input
            type="text"
            value={exp.company}
            onChange={(e) => setExp({ ...exp, company: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
            placeholder="e.g., Acme Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={exp.startedAt?.split("T")[0] || ""}
            onChange={(e) => setExp({ ...exp, startedAt: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            End Date (leave empty for current)
          </label>
          <input
            type="date"
            value={exp.endedAt?.split("T")[0] || ""}
            onChange={(e) =>
              setExp({ ...exp, endedAt: e.target.value || null })
            }
            className="w-full px-4 py-3 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <TextEditor
          value={exp.description}
          onChange={(value) => setExp({ ...exp, description: value })}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Skills</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className="flex-1 px-4 py-2 rounded-lg border bg-bg focus:ring-2 focus:ring-primary outline-none"
            placeholder="Add a skill and press Enter"
          />
          <Button type="button" variant="secondary" onPress={addSkill}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {exp.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-danger"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onPress={() => onSave(exp)} isDisabled={saving}>
          <Icons.Save className="size-4 mr-2" />
          {saving ? "Saving..." : "Save Experience"}
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
