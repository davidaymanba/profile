import {
  experience as staticExperience,
  profile as staticProfile,
  projects as staticProjects,
  skillGroups as staticSkillGroups,
} from "@/data/portfolio";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type {
  DbExperience,
  DbProfile,
  DbProject,
  DbSkillGroup,
  PortfolioData,
  ProfileData,
} from "@/lib/types";

function mapProfile(row: DbProfile): ProfileData {
  const phoneDigits = row.phone.replace(/\s/g, "");
  const fallbackImage = row.profile_image_url ?? "/profile.jpeg";
  const galleryFromDb = Array.isArray(row.gallery_urls)
    ? row.gallery_urls.filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];
  const galleryUrls = galleryFromDb.length > 0 ? galleryFromDb : [fallbackImage];

  return {
    name: row.full_name.split(" ").slice(0, 2).join(" ") || row.full_name,
    fullName: row.full_name,
    title: row.title,
    stackLine: row.stack_line,
    location: row.location,
    email: row.email,
    phone: row.phone,
    phoneHref: `tel:${phoneDigits.replace(/[^+\d]/g, "")}`,
    whatsapp: row.whatsapp ?? staticProfile.whatsapp,
    linkedin: row.linkedin ?? staticProfile.linkedin,
    github: row.github ?? staticProfile.github,
    summary: row.summary,
    shortPitch: row.short_pitch,
    profileImageUrl: galleryUrls[0] ?? fallbackImage,
    galleryUrls,
    cvUrl: row.cv_url ?? staticProfile.cvUrl ?? "",
    education: row.education?.length ? row.education : staticProfile.education,
  };
}

function staticPortfolioData(): PortfolioData {
  return {
    profile: {
      ...staticProfile,
      profileImageUrl: "/profile.jpeg",
      galleryUrls: ["/profile.jpeg"],
      cvUrl: staticProfile.cvUrl ?? "",
    },
    experience: staticExperience,
    projects: staticProjects,
    skillGroups: staticSkillGroups,
  };
}

export async function getPortfolioData(): Promise<PortfolioData> {
  if (!isSupabaseConfigured()) return staticPortfolioData();

  try {
    const supabase = createAdminClient();

    const [profileRes, experienceRes, projectsRes, skillsRes] =
      await Promise.all([
        supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
        supabase
          .from("experience")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("skill_groups")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

    if (!profileRes.data) return staticPortfolioData();

    const profile = mapProfile(profileRes.data as DbProfile);
    const experience = ((experienceRes.data ?? []) as DbExperience[]).map(
      (item) => ({
        id: item.id,
        company: item.company,
        role: item.role,
        period: item.period,
        location: item.location,
        stack: item.stack,
        points: item.points,
        sortOrder: item.sort_order,
      }),
    );
    const projects = ((projectsRes.data ?? []) as DbProject[]).map((item) => ({
      id: item.id,
      title: item.title,
      period: item.period,
      stack: item.stack,
      description: item.description,
      href: item.href,
      sortOrder: item.sort_order,
    }));
    const skillGroups = ((skillsRes.data ?? []) as DbSkillGroup[]).map(
      (item) => ({
        id: item.id,
        title: item.title,
        items: item.items,
        sortOrder: item.sort_order,
      }),
    );

    return {
      profile,
      experience: experience.length ? experience : staticExperience,
      projects: projects.length ? projects : staticProjects,
      skillGroups: skillGroups.length ? skillGroups : staticSkillGroups,
    };
  } catch {
    return staticPortfolioData();
  }
}

export async function seedPortfolioData() {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profile")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  if (existing) return { seeded: false, message: "Data already exists" };

  await supabase.from("profile").insert({
    id: 1,
    full_name: staticProfile.fullName,
    title: staticProfile.title,
    stack_line: staticProfile.stackLine,
    location: staticProfile.location,
    summary: staticProfile.summary,
    short_pitch: staticProfile.shortPitch,
    email: staticProfile.email,
    phone: staticProfile.phone,
    linkedin: staticProfile.linkedin,
    github: staticProfile.github,
    whatsapp: staticProfile.whatsapp,
    profile_image_url: "/profile.jpeg",
  });

  await supabase.from("experience").insert(
    staticExperience.map((item, index) => ({
      company: item.company,
      role: item.role,
      period: item.period,
      location: item.location,
      stack: item.stack,
      points: item.points,
      sort_order: index,
    })),
  );

  await supabase.from("projects").insert(
    staticProjects.map((item, index) => ({
      title: item.title,
      period: item.period,
      stack: item.stack,
      description: item.description,
      href: "href" in item ? item.href ?? null : null,
      sort_order: index,
    })),
  );

  await supabase.from("skill_groups").insert(
    staticSkillGroups.map((item, index) => ({
      title: item.title,
      items: item.items,
      sort_order: index,
    })),
  );

  return { seeded: true, message: "Portfolio data seeded successfully" };
}
