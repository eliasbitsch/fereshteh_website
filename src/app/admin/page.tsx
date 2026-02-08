"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import * as SiIcons from "react-icons/si";
import { TextEditor } from "~/components/admin/rich-text-editor";
import { Button } from "~/components/ui/button";
import { Icons as AllIcons, type Icon, Icons } from "~/components/ui/icons";
import type {
  ContentData,
  ExperienceContent,
  SkillContent,
} from "~/lib/content";
import { withBasePath } from "~/lib/get-base-path";

// Available icons with their display names and search keywords
const availableIcons: {
  key: string;
  name: string;
  keywords: string[];
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "Figma",
    name: "Figma",
    keywords: ["figma", "design", "ui"],
    Icon: SiIcons.SiFigma,
  },
  {
    key: "AdobeXD",
    name: "Adobe XD",
    keywords: ["adobe", "xd", "design"],
    Icon: SiIcons.SiAdobexd,
  },
  {
    key: "Photoshop",
    name: "Photoshop",
    keywords: ["adobe", "photoshop", "ps", "photo"],
    Icon: SiIcons.SiAdobephotoshop,
  },
  {
    key: "Illustrator",
    name: "Illustrator",
    keywords: ["adobe", "illustrator", "ai", "vector"],
    Icon: SiIcons.SiAdobeillustrator,
  },
  {
    key: "AfterEffects",
    name: "After Effects",
    keywords: ["adobe", "after", "effects", "ae", "motion"],
    Icon: SiIcons.SiAdobeaftereffects,
  },
  {
    key: "Premiere",
    name: "Premiere Pro",
    keywords: ["adobe", "premiere", "video"],
    Icon: SiIcons.SiAdobepremierepro,
  },
  {
    key: "InDesign",
    name: "InDesign",
    keywords: ["adobe", "indesign", "layout"],
    Icon: SiIcons.SiAdobeindesign,
  },
  {
    key: "Sketch",
    name: "Sketch",
    keywords: ["sketch", "design", "mac"],
    Icon: SiIcons.SiSketch,
  },
  {
    key: "Canva",
    name: "Canva",
    keywords: ["canva", "design"],
    Icon: SiIcons.SiCanva,
  },
  {
    key: "Blender",
    name: "Blender",
    keywords: ["blender", "3d", "modeling"],
    Icon: SiIcons.SiBlender,
  },
  {
    key: "Unity",
    name: "Unity",
    keywords: ["unity", "game", "3d"],
    Icon: SiIcons.SiUnity,
  },
  {
    key: "UnrealEngine",
    name: "Unreal Engine",
    keywords: ["unreal", "game", "3d", "engine"],
    Icon: SiIcons.SiUnrealengine,
  },
  {
    key: "Arduino",
    name: "Arduino",
    keywords: ["arduino", "hardware", "iot"],
    Icon: SiIcons.SiArduino,
  },
  {
    key: "RaspberryPi",
    name: "Raspberry Pi",
    keywords: ["raspberry", "pi", "hardware", "iot"],
    Icon: SiIcons.SiRaspberrypi,
  },
  {
    key: "HTML",
    name: "HTML",
    keywords: ["html", "html5", "web"],
    Icon: SiIcons.SiHtml5,
  },
  {
    key: "CSS",
    name: "CSS",
    keywords: ["css", "css3", "web", "style"],
    Icon: SiIcons.SiCss3,
  },
  {
    key: "JavaScript",
    name: "JavaScript",
    keywords: ["javascript", "js", "web"],
    Icon: SiIcons.SiJavascript,
  },
  {
    key: "TypeScript",
    name: "TypeScript",
    keywords: ["typescript", "ts", "web"],
    Icon: SiIcons.SiTypescript,
  },
  {
    key: "React",
    name: "React",
    keywords: ["react", "reactjs", "web", "frontend"],
    Icon: SiIcons.SiReact,
  },
  {
    key: "Vue",
    name: "Vue.js",
    keywords: ["vue", "vuejs", "web", "frontend"],
    Icon: SiIcons.SiVuedotjs,
  },
  {
    key: "Angular",
    name: "Angular",
    keywords: ["angular", "web", "frontend"],
    Icon: SiIcons.SiAngular,
  },
  {
    key: "Svelte",
    name: "Svelte",
    keywords: ["svelte", "web", "frontend"],
    Icon: SiIcons.SiSvelte,
  },
  {
    key: "NextJS",
    name: "Next.js",
    keywords: ["next", "nextjs", "react", "web"],
    Icon: SiIcons.SiNextdotjs,
  },
  {
    key: "NodeJS",
    name: "Node.js",
    keywords: ["node", "nodejs", "backend", "javascript"],
    Icon: SiIcons.SiNodedotjs,
  },
  {
    key: "Python",
    name: "Python",
    keywords: ["python", "py"],
    Icon: SiIcons.SiPython,
  },
  { key: "Java", name: "Java", keywords: ["java"], Icon: SiIcons.SiOpenjdk },
  {
    key: "CSharp",
    name: "C#",
    keywords: ["c#", "csharp", "dotnet"],
    Icon: SiIcons.SiDotnet,
  },
  {
    key: "CPlusPlus",
    name: "C++",
    keywords: ["c++", "cpp"],
    Icon: SiIcons.SiCplusplus,
  },
  { key: "Go", name: "Go", keywords: ["go", "golang"], Icon: SiIcons.SiGo },
  { key: "Rust", name: "Rust", keywords: ["rust"], Icon: SiIcons.SiRust },
  {
    key: "Swift",
    name: "Swift",
    keywords: ["swift", "ios", "apple"],
    Icon: SiIcons.SiSwift,
  },
  {
    key: "Kotlin",
    name: "Kotlin",
    keywords: ["kotlin", "android"],
    Icon: SiIcons.SiKotlin,
  },
  {
    key: "PHP",
    name: "PHP",
    keywords: ["php", "web", "backend"],
    Icon: SiIcons.SiPhp,
  },
  {
    key: "Ruby",
    name: "Ruby",
    keywords: ["ruby", "rails"],
    Icon: SiIcons.SiRuby,
  },
  {
    key: "TailwindCSS",
    name: "Tailwind CSS",
    keywords: ["tailwind", "css", "utility"],
    Icon: SiIcons.SiTailwindcss,
  },
  {
    key: "Bootstrap",
    name: "Bootstrap",
    keywords: ["bootstrap", "css", "framework"],
    Icon: SiIcons.SiBootstrap,
  },
  {
    key: "Sass",
    name: "Sass",
    keywords: ["sass", "scss", "css"],
    Icon: SiIcons.SiSass,
  },
  {
    key: "Git",
    name: "Git",
    keywords: ["git", "version", "control"],
    Icon: SiIcons.SiGit,
  },
  {
    key: "GitHub",
    name: "GitHub",
    keywords: ["github", "git"],
    Icon: SiIcons.SiGithub,
  },
  {
    key: "GitLab",
    name: "GitLab",
    keywords: ["gitlab", "git"],
    Icon: SiIcons.SiGitlab,
  },
  {
    key: "Docker",
    name: "Docker",
    keywords: ["docker", "container"],
    Icon: SiIcons.SiDocker,
  },
  {
    key: "Kubernetes",
    name: "Kubernetes",
    keywords: ["kubernetes", "k8s", "container"],
    Icon: SiIcons.SiKubernetes,
  },
  {
    key: "AWS",
    name: "AWS",
    keywords: ["aws", "amazon", "cloud"],
    Icon: SiIcons.SiAmazonwebservices,
  },
  {
    key: "GoogleCloud",
    name: "Google Cloud",
    keywords: ["google", "cloud", "gcp"],
    Icon: SiIcons.SiGooglecloud,
  },
  {
    key: "Azure",
    name: "Azure",
    keywords: ["azure", "microsoft", "cloud"],
    Icon: (props) => (
      <span {...props} className={`font-bold text-[0.5em] ${props.className}`}>
        Az
      </span>
    ),
  },
  {
    key: "Firebase",
    name: "Firebase",
    keywords: ["firebase", "google", "backend"],
    Icon: SiIcons.SiFirebase,
  },
  {
    key: "MongoDB",
    name: "MongoDB",
    keywords: ["mongodb", "database", "nosql"],
    Icon: SiIcons.SiMongodb,
  },
  {
    key: "PostgreSQL",
    name: "PostgreSQL",
    keywords: ["postgresql", "postgres", "database", "sql"],
    Icon: SiIcons.SiPostgresql,
  },
  {
    key: "MySQL",
    name: "MySQL",
    keywords: ["mysql", "database", "sql"],
    Icon: SiIcons.SiMysql,
  },
  {
    key: "Redis",
    name: "Redis",
    keywords: ["redis", "cache", "database"],
    Icon: SiIcons.SiRedis,
  },
  {
    key: "GraphQL",
    name: "GraphQL",
    keywords: ["graphql", "api"],
    Icon: SiIcons.SiGraphql,
  },
  {
    key: "Vercel",
    name: "Vercel",
    keywords: ["vercel", "deploy", "hosting"],
    Icon: SiIcons.SiVercel,
  },
  {
    key: "Netlify",
    name: "Netlify",
    keywords: ["netlify", "deploy", "hosting"],
    Icon: SiIcons.SiNetlify,
  },
  {
    key: "Jira",
    name: "Jira",
    keywords: ["jira", "project", "management"],
    Icon: SiIcons.SiJira,
  },
  {
    key: "Confluence",
    name: "Confluence",
    keywords: ["confluence", "docs", "wiki"],
    Icon: SiIcons.SiConfluence,
  },
  {
    key: "Notion",
    name: "Notion",
    keywords: ["notion", "docs", "notes"],
    Icon: SiIcons.SiNotion,
  },
  {
    key: "Slack",
    name: "Slack",
    keywords: ["slack", "chat", "communication"],
    Icon: SiIcons.SiSlack,
  },
  {
    key: "Discord",
    name: "Discord",
    keywords: ["discord", "chat", "communication"],
    Icon: SiIcons.SiDiscord,
  },
  {
    key: "Trello",
    name: "Trello",
    keywords: ["trello", "project", "kanban"],
    Icon: SiIcons.SiTrello,
  },
  {
    key: "Miro",
    name: "Miro",
    keywords: ["miro", "whiteboard", "collaboration"],
    Icon: SiIcons.SiMiro,
  },
  {
    key: "InVision",
    name: "InVision",
    keywords: ["invision", "prototype", "design"],
    Icon: SiIcons.SiInvision,
  },
  {
    key: "Framer",
    name: "Framer",
    keywords: ["framer", "prototype", "design"],
    Icon: SiIcons.SiFramer,
  },
  {
    key: "Webflow",
    name: "Webflow",
    keywords: ["webflow", "nocode", "design"],
    Icon: SiIcons.SiWebflow,
  },
  {
    key: "WordPress",
    name: "WordPress",
    keywords: ["wordpress", "cms", "blog"],
    Icon: SiIcons.SiWordpress,
  },
  {
    key: "Shopify",
    name: "Shopify",
    keywords: ["shopify", "ecommerce"],
    Icon: SiIcons.SiShopify,
  },
  {
    key: "Stripe",
    name: "Stripe",
    keywords: ["stripe", "payment"],
    Icon: SiIcons.SiStripe,
  },
  {
    key: "Linux",
    name: "Linux",
    keywords: ["linux", "os"],
    Icon: SiIcons.SiLinux,
  },
  {
    key: "Ubuntu",
    name: "Ubuntu",
    keywords: ["ubuntu", "linux"],
    Icon: SiIcons.SiUbuntu,
  },
  {
    key: "Windows",
    name: "Windows",
    keywords: ["windows", "microsoft"],
    Icon: (props) => (
      <span {...props} className={`font-bold text-[0.5em] ${props.className}`}>
        W
      </span>
    ),
  },
  {
    key: "Apple",
    name: "Apple",
    keywords: ["apple", "mac", "ios"],
    Icon: SiIcons.SiApple,
  },
  {
    key: "Android",
    name: "Android",
    keywords: ["android", "mobile"],
    Icon: SiIcons.SiAndroid,
  },
  {
    key: "Ros",
    name: "ROS",
    keywords: ["ros", "robot", "robotics"],
    Icon: SiIcons.SiRos,
  },
  {
    key: "Matlab",
    name: "MATLAB",
    keywords: ["matlab", "math", "simulation"],
    Icon: (props) => (
      <span {...props} className={`font-bold text-[0.6em] ${props.className}`}>
        M
      </span>
    ),
  },
  {
    key: "R",
    name: "R",
    keywords: ["r", "statistics", "data"],
    Icon: SiIcons.SiR,
  },
  {
    key: "Tensorflow",
    name: "TensorFlow",
    keywords: ["tensorflow", "ml", "ai"],
    Icon: SiIcons.SiTensorflow,
  },
  {
    key: "Pytorch",
    name: "PyTorch",
    keywords: ["pytorch", "ml", "ai"],
    Icon: SiIcons.SiPytorch,
  },
  {
    key: "OpenAI",
    name: "OpenAI",
    keywords: ["openai", "ai", "gpt"],
    Icon: SiIcons.SiOpenai,
  },
  {
    key: "Npm",
    name: "npm",
    keywords: ["npm", "package", "node"],
    Icon: SiIcons.SiNpm,
  },
  {
    key: "Yarn",
    name: "Yarn",
    keywords: ["yarn", "package", "node"],
    Icon: SiIcons.SiYarn,
  },
  {
    key: "Vite",
    name: "Vite",
    keywords: ["vite", "build", "bundler"],
    Icon: SiIcons.SiVite,
  },
  {
    key: "Webpack",
    name: "Webpack",
    keywords: ["webpack", "build", "bundler"],
    Icon: SiIcons.SiWebpack,
  },
  {
    key: "ESLint",
    name: "ESLint",
    keywords: ["eslint", "lint", "code"],
    Icon: SiIcons.SiEslint,
  },
  {
    key: "Prettier",
    name: "Prettier",
    keywords: ["prettier", "format", "code"],
    Icon: SiIcons.SiPrettier,
  },
  {
    key: "Jest",
    name: "Jest",
    keywords: ["jest", "test", "javascript"],
    Icon: SiIcons.SiJest,
  },
  {
    key: "Cypress",
    name: "Cypress",
    keywords: ["cypress", "test", "e2e"],
    Icon: SiIcons.SiCypress,
  },
  {
    key: "Storybook",
    name: "Storybook",
    keywords: ["storybook", "ui", "component"],
    Icon: SiIcons.SiStorybook,
  },
  {
    key: "ShadcnUI",
    name: "Shadcn UI",
    keywords: ["shadcn", "ui", "component"],
    Icon: SiIcons.SiShadcnui,
  },
  {
    key: "MUI",
    name: "Material UI",
    keywords: ["material", "mui", "ui", "component"],
    Icon: SiIcons.SiMui,
  },
  {
    key: "ChakraUI",
    name: "Chakra UI",
    keywords: ["chakra", "ui", "component"],
    Icon: SiIcons.SiChakraui,
  },
  {
    key: "Prisma",
    name: "Prisma",
    keywords: ["prisma", "orm", "database"],
    Icon: SiIcons.SiPrisma,
  },
  {
    key: "Supabase",
    name: "Supabase",
    keywords: ["supabase", "backend", "database"],
    Icon: SiIcons.SiSupabase,
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<ContentData | null>(null);
  const [originalContent, setOriginalContent] = useState<ContentData | null>(
    null
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hero" | "about" | "experiences" | "projects"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-active-tab");
      if (
        saved &&
        ["hero", "about", "experiences", "projects"].includes(saved)
      ) {
        return saved as "hero" | "about" | "experiences" | "projects";
      }
    }
    return "hero";
  });
  const [editingExperience, setEditingExperience] =
    useState<ExperienceContent | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Project PDFs state
  const [projectPdfs, setProjectPdfs] = useState<
    {
      title: string;
      pdfPath: string;
      imagePath: string;
      thumbnailPath: string;
    }[]
  >([]);
  const [projectPdfsOrder, setProjectPdfsOrder] = useState<string[]>([]);
  const [draggedPdfIndex, setDraggedPdfIndex] = useState<number | null>(null);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState<number | null>(
    null
  );
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
    null
  );
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(
    null
  );
  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<{
    file: File;
    url: string;
    title: string;
  } | null>(null);
  const [editingPdf, setEditingPdf] = useState<{
    key: string;
    title: string;
    subtitle?: string | null;
    pdfPath: string;
  } | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillContent | null>(null);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null
  );
  const [_uploadingSkillIcon, setUploadingSkillIcon] = useState(false);
  const skillIconInputRef = useRef<HTMLInputElement | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  // Auto-detect icon from availableIcons using name and keywords
  const autoDetectIcon = (name: string): string => {
    const lowerName = name.toLowerCase().trim();

    // First, try exact name match
    const exactMatch = availableIcons.find(
      (icon) =>
        icon.name.toLowerCase() === lowerName ||
        icon.key.toLowerCase() === lowerName
    );
    if (exactMatch) {
      return exactMatch.key;
    }

    // Then, try keyword match
    const keywordMatch = availableIcons.find((icon) =>
      icon.keywords.some(
        (keyword) => keyword === lowerName || lowerName.includes(keyword)
      )
    );
    if (keywordMatch) {
      return keywordMatch.key;
    }

    // Finally, try partial name match
    const partialMatch = availableIcons.find(
      (icon) =>
        icon.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(icon.name.toLowerCase())
    );
    if (partialMatch) {
      return partialMatch.key;
    }

    return "";
  };

  const openThumbnailPicker = (title: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.webp,.avif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setThumbnailPreview({ file, url, title });
    };

    // trigger file picker
    input.click();
  };

  const uploadThumbnail = async () => {
    if (!thumbnailPreview) {
      return;
    }

    setUploadingThumbnail(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", thumbnailPreview.file);
    formData.append("title", thumbnailPreview.title);

    try {
      const res = await fetch("/api/content/projects/thumbnail", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await loadProjectPdfs();
        await revalidateCache("/"); // Revalidate after thumbnail change
        setMessage({ type: "success", text: "Thumbnail updated!" });
        setTimeout(() => setMessage(null), 2000);
        // Clean up preview
        URL.revokeObjectURL(thumbnailPreview.url);
        setThumbnailPreview(null);
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.error || "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload thumbnail" });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const cancelThumbnailUpload = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview.url);
      setThumbnailPreview(null);
    }
  };

  const hasUnsavedChanges =
    content && originalContent
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

  // Trigger cache revalidation after content updates
  const revalidateCache = async (path?: string) => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch (error) {
      console.error("Failed to revalidate cache:", error);
    }
  };

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
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProjectPdfs = useCallback(async () => {
    try {
      const res = await fetch("/api/content/projects/pdfs");
      if (res.ok) {
        const data = await res.json();
        setProjectPdfs(data.items || []);
        setProjectPdfsOrder(
          data.items?.map((item: { title: string }) => item.title) || []
        );
      }
    } catch (error) {
      console.error("Failed to load project PDFs:", error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "projects") {
      loadProjectPdfs();
    }
  }, [activeTab, loadProjectPdfs]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const saveAllContent = async () => {
    if (!content) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Save all sections
      const sections = [
        { name: "hero", data: content.hero },
        { name: "about", data: content.about },
        { name: "site", data: content.site },
        {
          name: "location",
          data: content.location || { city: "", country: "" },
        },
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
      await revalidateCache("/"); // Revalidate homepage after content changes
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
    if (!confirm("Are you sure you want to delete this experience?")) {
      return;
    }

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Failed to load content</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-bg/80 backdrop-blur-sm">
        <div className="container flex h-16 max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl">Content Manager</h1>
            {hasUnsavedChanges && (
              <span className="text-sm text-warning">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              isDisabled={saving || !hasUnsavedChanges}
              onPress={saveAllContent}
            >
              <Icons.Save className="mr-2 size-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <a
              className="flex items-center gap-1 text-muted-fg text-sm hover:text-fg"
              href="/"
              rel="noopener"
              target="_blank"
            >
              <Icons.Eye className="size-4" />
              View Site
            </a>
            <Button onPress={handleLogout} size="sm" variant="ghost">
              <Icons.LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`fixed top-20 right-4 z-50 rounded-lg p-4 shadow-lg ${
            message.type === "success"
              ? "border border-success/20 bg-success/10 text-success"
              : "border border-danger/20 bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="container max-w-6xl py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b">
          {(["hero", "projects", "experiences", "about"] as const).map(
            (tab) => (
              <button
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-primary border-b-2 text-primary"
                    : "text-muted-fg hover:text-fg"
                }`}
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  localStorage.setItem("admin-active-tab", tab);
                }}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Hero Section */}
        {activeTab === "hero" && (
          <div className="space-y-8">
            <h2 className="font-bold text-2xl">Hero Section</h2>

            {/* Basic Information */}
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="mb-4 font-semibold text-lg">Basic Information</h3>

              <div>
                <label className="mb-2 block font-medium text-sm">Name</label>
                <input
                  className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, name: e.target.value },
                    })
                  }
                  type="text"
                  value={content.hero.name}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm">Bio</label>
                <TextEditor
                  onChange={(value) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, bio: value },
                    })
                  }
                  rows={4}
                  value={content.hero.bio}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="mb-4 font-semibold text-lg">Profile Picture</h3>

              <div className="flex items-start gap-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border">
                  <img
                    alt="Profile"
                    className="h-full w-full object-cover"
                    src={
                      profilePreviewUrl ||
                      withBasePath("/profile-picture/fereshteh_portrait.avif")
                    }
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <input
                    accept=".png,.jpg,.jpeg,.webp,.avif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      setSelectedProfileFile(file);
                      try {
                        const url = URL.createObjectURL(file);
                        setProfilePreviewUrl(url);
                      } catch {
                        setProfilePreviewUrl(null);
                      }
                    }}
                    ref={(el) => {
                      profileInputRef.current = el;
                    }}
                    type="file"
                  />

                  <div className="flex items-center gap-2">
                    <Button
                      onPress={() => profileInputRef.current?.click()}
                      variant="outline"
                    >
                      Choose image
                    </Button>

                    <Button
                      isDisabled={
                        !selectedProfileFile || uploadingProfilePicture
                      }
                      onPress={async () => {
                        if (!selectedProfileFile) {
                          return;
                        }
                        setUploadingProfilePicture(true);
                        setMessage(null);

                        try {
                          const formData = new FormData();
                          formData.append("file", selectedProfileFile);

                          const res = await fetch(
                            "/api/content/site/profile-picture",
                            {
                              method: "POST",
                              body: formData,
                            }
                          );

                          if (res.ok) {
                            setMessage({
                              type: "success",
                              text: "Profile picture uploaded!",
                            });
                            setSelectedProfileFile(null);
                            setTimeout(() => setMessage(null), 3000);
                            setTimeout(() => setProfilePreviewUrl(null), 500);
                          } else {
                            const error = await res.json();
                            setMessage({
                              type: "error",
                              text: error.error || "Upload failed",
                            });
                          }
                        } catch {
                          setMessage({
                            type: "error",
                            text: "Failed to upload profile picture",
                          });
                        } finally {
                          setUploadingProfilePicture(false);
                        }
                      }}
                    >
                      {uploadingProfilePicture ? "Uploading..." : "Upload"}
                    </Button>
                  </div>

                  {selectedProfileFile && (
                    <p className="text-muted-fg text-sm">
                      Selected: {selectedProfileFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CV / Resume */}
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="mb-4 font-semibold text-lg">CV / Resume</h3>

              <div className="space-y-3">
                <input
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setSelectedCvFile(file);
                  }}
                  ref={(el) => {
                    cvInputRef.current = el;
                  }}
                  type="file"
                />

                <div className="flex items-center gap-2">
                  <Button
                    onPress={() => cvInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose PDF
                  </Button>

                  <Button
                    isDisabled={!selectedCvFile || uploadingCv}
                    onPress={async () => {
                      if (!selectedCvFile) {
                        return;
                      }
                      setUploadingCv(true);
                      setMessage(null);

                      try {
                        const formData = new FormData();
                        formData.append("file", selectedCvFile);

                        const res = await fetch("/api/content/cv", {
                          method: "POST",
                          body: formData,
                        });

                        if (res.ok) {
                          setMessage({
                            type: "success",
                            text: "CV uploaded successfully!",
                          });
                          setSelectedCvFile(null);
                          setTimeout(() => setMessage(null), 3000);
                        } else {
                          const error = await res.json();
                          setMessage({
                            type: "error",
                            text: error.error || "Upload failed",
                          });
                        }
                      } catch {
                        setMessage({
                          type: "error",
                          text: "Failed to upload CV",
                        });
                      } finally {
                        setUploadingCv(false);
                      }
                    }}
                  >
                    {uploadingCv ? "Uploading..." : "Upload"}
                  </Button>
                </div>

                {selectedCvFile && (
                  <p className="text-muted-fg text-sm">
                    Selected: {selectedCvFile.name}
                  </p>
                )}

                <p className="text-muted-fg text-sm">
                  Current:{" "}
                  <a
                    className="underline hover:text-primary"
                    href="/documents/cv_Fereshteh_Hosseini.pdf"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    cv_Fereshteh_Hosseini.pdf
                  </a>
                </p>

                <div className="flex items-center gap-3 border-t pt-2">
                  <input
                    checked={content.hero.showResumeButton}
                    className="size-4"
                    id="showResumeButton"
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: {
                          ...content.hero,
                          showResumeButton: e.target.checked,
                        },
                      })
                    }
                    type="checkbox"
                  />
                  <label
                    className="font-medium text-sm"
                    htmlFor="showResumeButton"
                  >
                    Show resume button on homepage
                  </label>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="mb-4 font-semibold text-lg">Display Options</h3>

              <div className="flex items-center gap-3">
                <input
                  checked={content.hero.availableForWork}
                  className="size-4"
                  id="availableForWork"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        availableForWork: e.target.checked,
                      },
                    })
                  }
                  type="checkbox"
                />
                <label
                  className="font-medium text-sm"
                  htmlFor="availableForWork"
                >
                  Available for work
                </label>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl">About Section</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Section Title
                </label>
                <input
                  className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: { ...content.about, title: e.target.value },
                    })
                  }
                  type="text"
                  value={content.about.title}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm">
                  Description
                </label>
                <TextEditor
                  onChange={(value) =>
                    setContent({
                      ...content,
                      about: { ...content.about, description: value },
                    })
                  }
                  rows={6}
                  value={content.about.description}
                />
              </div>

              <hr className="my-6 border-border" />

              <h3 className="font-bold text-xl">Site Settings</h3>

              <div>
                <label className="mb-2 block font-medium text-sm">
                  Site Name
                </label>
                <input
                  className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      site: { ...content.site, name: e.target.value },
                    })
                  }
                  type="text"
                  value={content.site.name}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm">
                  Site Description
                </label>
                <TextEditor
                  onChange={(value) =>
                    setContent({
                      ...content,
                      site: { ...content.site, description: value },
                    })
                  }
                  rows={3}
                  value={content.site.description}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm">Email</label>
                <input
                  className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      site: { ...content.site, email: e.target.value },
                    })
                  }
                  type="email"
                  value={content.site.email}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm">
                  LinkedIn URL
                </label>
                <input
                  className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setContent({
                      ...content,
                      site: { ...content.site, linkedIn: e.target.value },
                    })
                  }
                  type="url"
                  value={content.site.linkedIn}
                />
              </div>

              <hr className="my-6 border-border" />

              <h3 className="font-bold text-xl">Location</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-sm">City</label>
                  <input
                    className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setContent({
                        ...content,
                        location: {
                          ...content.location,
                          city: e.target.value,
                          country: content.location?.country || "",
                        },
                      })
                    }
                    placeholder="e.g., Vienna"
                    type="text"
                    value={content.location?.city || ""}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-sm">
                    Country
                  </label>
                  <input
                    className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setContent({
                        ...content,
                        location: {
                          ...content.location,
                          city: content.location?.city || "",
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Austria"
                    type="text"
                    value={content.location?.country || ""}
                  />
                </div>
              </div>

              <hr className="my-6 border-border" />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl">Skills</h3>
                  <p className="text-muted-fg text-sm">Drag to reorder</p>
                </div>
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
                  <Icons.Plus className="mr-2 size-4" />
                  Add Skill
                </Button>
              </div>

              {editingSkill && (
                <div className="space-y-4 rounded-lg border bg-secondary/10 p-6">
                  <h4 className="font-semibold text-lg">
                    {editingSkill.name ? "Edit Skill" : "Add Skill"}
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Name
                      </label>
                      <input
                        className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => {
                          const newName = e.target.value;
                          const detectedIcon = autoDetectIcon(newName);
                          // Only auto-set icon if no custom icon and either no icon set or icon was auto-detected
                          if (
                            !editingSkill.customIcon &&
                            (detectedIcon || !editingSkill.icon)
                          ) {
                            setEditingSkill({
                              ...editingSkill,
                              name: newName,
                              icon: detectedIcon,
                            });
                          } else {
                            setEditingSkill({ ...editingSkill, name: newName });
                          }
                        }}
                        placeholder="e.g., Figma"
                        type="text"
                        value={editingSkill.name}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        URL
                      </label>
                      <input
                        className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) =>
                          setEditingSkill({
                            ...editingSkill,
                            url: e.target.value,
                          })
                        }
                        placeholder="e.g., https://figma.com"
                        type="url"
                        value={editingSkill.url}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Icon
                    </label>

                    {/* Current selected icon */}
                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg border-2 bg-bg">
                        {editingSkill.customIcon ? (
                          <img
                            alt="Custom icon"
                            className="size-8"
                            src={withBasePath(editingSkill.customIcon)}
                          />
                        ) : editingSkill.icon ? (
                          (() => {
                            const iconData = availableIcons.find(
                              (i) => i.key === editingSkill.icon
                            );
                            if (iconData) {
                              return <iconData.Icon className="size-8" />;
                            }
                            // Fallback to built-in icons
                            const IconComponent =
                              editingSkill.icon in AllIcons
                                ? AllIcons[editingSkill.icon as Icon]
                                : null;
                            return IconComponent ? (
                              <IconComponent className="size-8" />
                            ) : (
                              <span className="font-medium text-sm">
                                {editingSkill.name.slice(0, 2)}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-muted-fg text-xs">None</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {editingSkill.icon || editingSkill.customIcon
                            ? "Selected"
                            : "No icon selected"}
                        </p>
                        <p className="text-muted-fg text-xs">
                          {editingSkill.customIcon
                            ? "Custom SVG"
                            : editingSkill.icon ||
                              "Choose from below or upload custom"}
                        </p>
                      </div>
                      <Button
                        onPress={() => skillIconInputRef.current?.click()}
                        size="sm"
                        variant="outline"
                      >
                        <Icons.Upload className="mr-2 size-4" />
                        Upload SVG
                      </Button>
                    </div>

                    {/* Icon search */}
                    <input
                      className="mb-3 w-full rounded-lg border bg-bg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                      onChange={(e) => setIconSearchQuery(e.target.value)}
                      placeholder="Search icons..."
                      type="text"
                      value={iconSearchQuery}
                    />

                    {/* Icon grid */}
                    <div className="max-h-48 overflow-y-auto rounded-lg border bg-bg p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {availableIcons
                          .filter((icon) => {
                            const query = iconSearchQuery.toLowerCase();
                            if (!query) {
                              return true;
                            }
                            return (
                              icon.name.toLowerCase().includes(query) ||
                              icon.keywords.some((k) => k.includes(query))
                            );
                          })
                          .map((icon) => (
                            <button
                              className={`flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-secondary/50 ${
                                editingSkill.icon === icon.key &&
                                !editingSkill.customIcon
                                  ? "bg-primary/20 ring-2 ring-primary"
                                  : ""
                              }`}
                              key={icon.key}
                              onClick={() =>
                                setEditingSkill({
                                  ...editingSkill,
                                  icon: icon.key,
                                  customIcon: undefined,
                                })
                              }
                              title={icon.name}
                              type="button"
                            >
                              <icon.Icon className="size-6" />
                            </button>
                          ))}
                      </div>
                      {availableIcons.filter((icon) => {
                        const query = iconSearchQuery.toLowerCase();
                        if (!query) {
                          return true;
                        }
                        return (
                          icon.name.toLowerCase().includes(query) ||
                          icon.keywords.some((k) => k.includes(query))
                        );
                      }).length === 0 && (
                        <p className="py-4 text-center text-muted-fg text-sm">
                          No icons found. Try uploading a custom SVG.
                        </p>
                      )}
                    </div>

                    <input
                      accept=".svg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!(file && editingSkill.name)) {
                          return;
                        }

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
                            setEditingSkill({
                              ...editingSkill,
                              customIcon: data.iconPath,
                              icon: "",
                            });
                          } else {
                            setMessage({
                              type: "error",
                              text: "Failed to upload icon",
                            });
                          }
                        } catch {
                          setMessage({
                            type: "error",
                            text: "Failed to upload icon",
                          });
                        } finally {
                          setUploadingSkillIcon(false);
                          e.target.value = "";
                        }
                      }}
                      ref={skillIconInputRef}
                      type="file"
                    />
                    {!editingSkill.name && (
                      <p className="mt-1 text-muted-fg text-xs">
                        Enter a name first to upload a custom icon
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      isDisabled={!editingSkill.name}
                      onPress={() => {
                        if (!editingSkill.name) {
                          return;
                        }
                        const skills = [...(content.skills || [])];

                        if (
                          editingSkillIndex !== null &&
                          editingSkillIndex >= 0
                        ) {
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
                    >
                      <Icons.Save className="mr-2 size-4" />
                      Save Skill
                    </Button>
                    <Button
                      onPress={() => {
                        setEditingSkill(null);
                        setEditingSkillIndex(null);
                      }}
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(content.skills || []).map((skill, index) => (
                  <div
                    className={`flex cursor-move items-center justify-between rounded-lg border bg-secondary/10 p-4 transition-all ${
                      draggedSkillIndex === index
                        ? "opacity-50"
                        : "hover:bg-secondary/20"
                    }`}
                    draggable
                    key={skill.name}
                    onDragEnd={() => setDraggedSkillIndex(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDragStart={() => setDraggedSkillIndex(index)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (
                        draggedSkillIndex === null ||
                        draggedSkillIndex === index
                      ) {
                        return;
                      }

                      const skills = [...(content.skills || [])];
                      const [movedSkill] = skills.splice(draggedSkillIndex, 1);
                      skills.splice(index, 0, movedSkill);

                      setContent({ ...content, skills });
                      setDraggedSkillIndex(null);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <Icons.GripVertical className="size-5 shrink-0 text-muted-fg" />
                      <div className="flex size-10 items-center justify-center rounded-lg border bg-bg">
                        {skill.customIcon ? (
                          <img
                            alt={skill.name}
                            className="size-6"
                            src={withBasePath(skill.customIcon)}
                          />
                        ) : skill.icon && skill.icon in AllIcons ? (
                          (() => {
                            const IconComponent = AllIcons[skill.icon as Icon];
                            return IconComponent ? (
                              <IconComponent className="size-6" />
                            ) : null;
                          })()
                        ) : (
                          <span className="font-medium text-xs">
                            {skill.name.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{skill.name}</h4>
                        <p className="max-w-[200px] truncate text-muted-fg text-xs">
                          {skill.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onPress={() => {
                          setEditingSkill(skill);
                          setEditingSkillIndex(index);
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Icons.Edit className="size-4" />
                      </Button>
                      <Button
                        onPress={() => {
                          const skills = (content.skills || []).filter(
                            (_, i) => i !== index
                          );
                          setContent({ ...content, skills });
                        }}
                        size="sm"
                        variant="ghost"
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
            <h2 className="font-bold text-2xl">Experiences Section</h2>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Section Title
              </label>
              <input
                className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) =>
                  setContent({
                    ...content,
                    sections: {
                      ...content.sections,
                      experienceTitle: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Experience"
                type="text"
                value={content.sections?.experienceTitle || ""}
              />
            </div>

            <hr className="my-6 border-border" />

            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl">Experiences</h3>
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
                <Icons.Plus className="mr-2 size-4" />
                Add Experience
              </Button>
            </div>

            {editingExperience && (
              <ExperienceEditor
                experience={editingExperience}
                onCancel={() => setEditingExperience(null)}
                onSave={saveExperience}
                saving={saving}
              />
            )}

            <div className="space-y-4">
              {content.experiences.map((exp) => (
                <div
                  className="rounded-lg border bg-secondary/10 p-4"
                  key={exp.id}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-muted-fg text-sm">{exp.company}</p>
                      <p className="mt-1 text-muted-fg text-xs">
                        {new Date(exp.startedAt).toLocaleDateString()} -{" "}
                        {exp.endedAt
                          ? new Date(exp.endedAt).toLocaleDateString()
                          : "Present"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onPress={() => setEditingExperience(exp)}
                        size="sm"
                        variant="ghost"
                      >
                        <Icons.Edit className="size-4" />
                      </Button>
                      <Button
                        onPress={() => deleteExperience(exp.id)}
                        size="sm"
                        variant="ghost"
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
            <h2 className="font-bold text-2xl">Projects Section</h2>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Section Title
              </label>
              <input
                className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) =>
                  setContent({
                    ...content,
                    sections: {
                      ...content.sections,
                      portfolioTitle: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Portfolio"
                type="text"
                value={content.sections?.portfolioTitle || ""}
              />
            </div>

            <hr className="my-6 border-border" />

            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl">Project PDFs</h3>
            </div>

            {/* Upload Area */}
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDraggingPdf
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragLeave={() => setIsDraggingPdf(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPdf(true);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDraggingPdf(false);

                const files = Array.from(e.dataTransfer.files);
                const pdfFiles = files.filter((f) =>
                  f.name.toLowerCase().endsWith(".pdf")
                );

                if (pdfFiles.length === 0) {
                  setMessage({
                    type: "error",
                    text: "Please drop PDF files only",
                  });
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
                      setMessage({
                        type: "error",
                        text: error.error || "Upload failed",
                      });
                    }
                  } catch {
                    setMessage({
                      type: "error",
                      text: `Failed to upload ${file.name}`,
                    });
                  }
                }

                setUploadingPdf(false);
                await loadProjectPdfs();
                await revalidateCache("/"); // Revalidate after PDF upload
                setMessage({
                  type: "success",
                  text: "Files uploaded! Image conversion running in background.",
                });
                setTimeout(() => setMessage(null), 5000);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Icons.Upload className="size-12 text-muted-fg" />
                <div>
                  <p className="font-medium">
                    {uploadingPdf
                      ? "Uploading..."
                      : "Drag and drop PDF files here"}
                  </p>
                  <p className="mt-1 text-muted-fg text-sm">
                    or click to browse
                  </p>
                </div>
                <input
                  accept=".pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={uploadingPdf}
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) {
                      return;
                    }

                    setUploadingPdf(true);
                    setMessage(null);

                    for (const file of files) {
                      try {
                        const formData = new FormData();
                        formData.append("file", file);

                        const res = await fetch(
                          "/api/content/projects/upload",
                          {
                            method: "POST",
                            body: formData,
                          }
                        );

                        if (!res.ok) {
                          const error = await res.json();
                          setMessage({
                            type: "error",
                            text: error.error || "Upload failed",
                          });
                        }
                      } catch {
                        setMessage({
                          type: "error",
                          text: `Failed to upload ${file.name}`,
                        });
                      }
                    }

                    setUploadingPdf(false);
                    await loadProjectPdfs();
                    await revalidateCache("/"); // Revalidate after PDF upload
                    setMessage({
                      type: "success",
                      text: "Files uploaded! Image conversion running in background.",
                    });
                    setTimeout(() => setMessage(null), 5000);
                    e.target.value = "";
                  }}
                  type="file"
                />
              </div>
            </div>

            {/* Project PDFs with Drag to Reorder */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Project PDFs</h3>
                <p className="text-muted-fg text-sm">Drag to reorder</p>
              </div>

              <div className="space-y-2">
                {(projectPdfsOrder.length > 0
                  ? projectPdfsOrder
                      .map((title) =>
                        projectPdfs.find((item) => item.title === title)
                      )
                      .filter(
                        (
                          item
                        ): item is {
                          title: string;
                          pdfPath: string;
                          imagePath: string;
                          thumbnailPath: string;
                        } => item !== undefined
                      )
                      .concat(
                        projectPdfs.filter(
                          (item) => !projectPdfsOrder.includes(item.title)
                        )
                      )
                  : projectPdfs
                ).map((item, index) => (
                  <div
                    className={`cursor-move rounded-lg border bg-secondary/10 p-4 transition-all ${
                      draggedPdfIndex === index
                        ? "opacity-50"
                        : "hover:bg-secondary/20"
                    }`}
                    draggable
                    key={item.title}
                    onDragEnd={() => setDraggedPdfIndex(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDragStart={() => setDraggedPdfIndex(index)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      if (
                        draggedPdfIndex === null ||
                        draggedPdfIndex === index
                      ) {
                        return;
                      }

                      const currentOrder =
                        projectPdfsOrder.length > 0
                          ? projectPdfsOrder
                              .map((title) =>
                                projectPdfs.find((item) => item.title === title)
                              )
                              .filter(
                                (
                                  item
                                ): item is {
                                  title: string;
                                  pdfPath: string;
                                  imagePath: string;
                                  thumbnailPath: string;
                                } => item !== undefined
                              )
                              .concat(
                                projectPdfs.filter(
                                  (item) =>
                                    !projectPdfsOrder.includes(item.title)
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
                        setMessage({
                          type: "error",
                          text: "Failed to save order",
                        });
                      }

                      setDraggedPdfIndex(null);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <Icons.GripVertical className="mt-1 size-5 shrink-0 text-muted-fg" />

                      {/* Thumbnail Preview */}
                      <div className="group relative shrink-0">
                        <div className="h-28 w-20 overflow-hidden rounded border bg-secondary/20">
                          {item.thumbnailPath && (
                            <img
                              alt={`${item.title} thumbnail`}
                              className="h-full w-full object-cover"
                              src={item.thumbnailPath}
                            />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="truncate text-muted-fg text-xs">
                          {item.pdfPath}
                        </p>
                        <p className="mt-1 text-muted-fg text-xs">
                          {item.thumbnailPath.includes("projects-thumbnails")
                            ? "Custom thumbnail"
                            : "Using generated image"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="px-4 py-2.5"
                          isDisabled={uploadingThumbnail}
                          onPress={() => openThumbnailPicker(item.title)}
                          variant="outline"
                        >
                          <Icons.Image className="mr-2 size-4" />
                          Set custom thumbnail
                        </Button>

                        <Button
                          className="px-4 py-2.5"
                          onPress={() => {
                            // derive key from pdf filename
                            try {
                              const parts = (item.pdfPath || "").split("/");
                              const file = parts.at(-1) || item.title;
                              const key = file.replace(/\.pdf$/i, "");
                              setEditingPdf({
                                key,
                                title: item.title,
                                subtitle: (item as any).subtitle || null,
                                pdfPath: item.pdfPath,
                              });
                            } catch {
                              setEditingPdf({
                                key: item.title,
                                title: item.title,
                                subtitle: (item as any).subtitle || null,
                                pdfPath: item.pdfPath,
                              });
                            }
                          }}
                          variant="outline"
                        >
                          <Icons.Edit className="mr-2 size-4" />
                          Edit metadata
                        </Button>

                        <Button
                          className="px-4 py-2.5"
                          onPress={async () => {
                            if (!confirm(`Delete "${item.title}"?`)) {
                              return;
                            }

                            try {
                              const res = await fetch(
                                "/api/content/projects/pdfs",
                                {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ title: item.title }),
                                }
                              );

                              if (res.ok) {
                                await loadProjectPdfs();
                                await revalidateCache("/"); // Revalidate after deletion
                                setMessage({
                                  type: "success",
                                  text: "Deleted!",
                                });
                                setTimeout(() => setMessage(null), 2000);
                              }
                            } catch {
                              setMessage({
                                type: "error",
                                text: "Failed to delete",
                              });
                            }
                          }}
                          variant="outline"
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
              <div className="mt-6 space-y-4 rounded-lg border bg-secondary/10 p-6">
                <h3 className="font-semibold text-lg">Edit PDF Metadata</h3>

                <div>
                  <label className="mb-2 block font-medium text-sm">
                    Title
                  </label>
                  <input
                    className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setEditingPdf({ ...editingPdf, title: e.target.value })
                    }
                    type="text"
                    value={editingPdf.title}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-sm">
                    Subtitle
                  </label>
                  <input
                    className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setEditingPdf({ ...editingPdf, subtitle: e.target.value })
                    }
                    type="text"
                    value={editingPdf.subtitle || ""}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    isDisabled={saving}
                    onPress={async () => {
                      if (!editingPdf) {
                        return;
                      }
                      setSaving(true);
                      setMessage(null);
                      try {
                        const res = await fetch(
                          "/api/content/projects/metadata",
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              key: editingPdf.key,
                              data: {
                                title: editingPdf.title,
                                subtitle: editingPdf.subtitle || "",
                              },
                            }),
                          }
                        );

                        if (res.ok) {
                          await loadProjectPdfs();
                          await revalidateCache("/"); // Revalidate after metadata update
                          setEditingPdf(null);
                          setMessage({
                            type: "success",
                            text: "Metadata saved!",
                          });
                          setTimeout(() => setMessage(null), 2000);
                        } else {
                          setMessage({
                            type: "error",
                            text: "Failed to save metadata",
                          });
                        }
                      } catch {
                        setMessage({
                          type: "error",
                          text: "Failed to save metadata",
                        });
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <Icons.Save className="mr-2 size-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>

                  <Button onPress={() => setEditingPdf(null)} variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Preview Dialog */}
      {thumbnailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl rounded-lg border bg-bg p-6 shadow-lg">
            <h3 className="mb-4 font-bold text-xl">Preview Thumbnail</h3>

            <div className="mb-4">
              <p className="mb-2 text-muted-fg text-sm">
                Project:{" "}
                <span className="font-semibold">{thumbnailPreview.title}</span>
              </p>
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg border bg-secondary/10">
                <img
                  alt="Thumbnail preview"
                  className="h-full w-full object-cover"
                  src={thumbnailPreview.url}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                isDisabled={uploadingThumbnail}
                onPress={cancelThumbnailUpload}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button isDisabled={uploadingThumbnail} onPress={uploadThumbnail}>
                <Icons.Upload className="mr-2 size-4" />
                {uploadingThumbnail ? "Uploading..." : "Upload Thumbnail"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
    <div className="space-y-4 rounded-lg border bg-secondary/10 p-6">
      <h3 className="font-semibold text-lg">
        {experience.id.startsWith("exp-new") ? "Add" : "Edit"} Experience
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-sm">Job Title</label>
          <input
            className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setExp({ ...exp, title: e.target.value })}
            placeholder="e.g., UX Designer"
            type="text"
            value={exp.title}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm">Company</label>
          <input
            className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setExp({ ...exp, company: e.target.value })}
            placeholder="e.g., Acme Inc."
            type="text"
            value={exp.company}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm">Start Date</label>
          <input
            className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setExp({ ...exp, startedAt: e.target.value })}
            type="date"
            value={exp.startedAt?.split("T")[0] || ""}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm">
            End Date (leave empty for current)
          </label>
          <input
            className="w-full rounded-lg border bg-bg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) =>
              setExp({ ...exp, endedAt: e.target.value || null })
            }
            type="date"
            value={exp.endedAt?.split("T")[0] || ""}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-medium text-sm">Description</label>
        <TextEditor
          onChange={(value) => setExp({ ...exp, description: value })}
          rows={4}
          value={exp.description}
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-sm">Skills</label>
        <div className="mb-2 flex gap-2">
          <input
            className="flex-1 rounded-lg border bg-bg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSkill())
            }
            placeholder="Add a skill and press Enter"
            type="text"
            value={skillInput}
          />
          <Button onPress={addSkill} type="button" variant="secondary">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {exp.skills.map((skill) => (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
              key={skill}
            >
              {skill}
              <button
                className="hover:text-danger"
                onClick={() => removeSkill(skill)}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button isDisabled={saving} onPress={() => onSave(exp)}>
          <Icons.Save className="mr-2 size-4" />
          {saving ? "Saving..." : "Save Experience"}
        </Button>
        <Button onPress={onCancel} variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
}
