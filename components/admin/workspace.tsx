"use client";
import Link from "@/components/site-link";
import PasswordChange from "./password-change";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PanelsTopLeft,
  BookOpen,
  Newspaper,
  Users,
  FlaskConical,
  Images,
  Briefcase,
  ArrowUpRight,
  Plus,
  Search,
  PenLine,
  ArchiveRestore,
  Archive,
  Eye,
  EyeOff,
  Save,
  Check,
  LogOut,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  entrySchema,
  settingsSchema,
  kinds,
  kindLabels,
  type Kind,
  type Entry,
  type RecordItem,
  type SettingsItem,
  type MediaItem,
} from "@/lib/content-model";
import { Choice, EntryFields, categories } from "./fields";
import MediaLibrary, { type Asset } from "./media-library";
import SettingsEditor from "./settings-editor";
import ProfessorEditor from "./professor-editor";
import JoinEditor from "./join-editor";
import type { HeroPicker } from "./hero-editor";
import type { HeroPage } from "@/lib/content-model";
import { getHero, setHero, mergeSettingsScope, type SettingsScope } from "@/lib/heroes";
import { comparePublications, isUndatedInPress, publicationSortDate } from "@/lib/publication-order";
import { compareDisplayOrder, comparePeople } from "@/lib/people-order";

function publicationListDate(entry: Entry) {
  if (isUndatedInPress(entry)) return "In press";
  const label = entry.publicationSortBy === "releaseDate" ? "발행일" : "게재일";
  return `${label} ${publicationSortDate(entry) || "미입력"}`;
}

export type AdminData = {
  records: RecordItem[];
  settings: SettingsItem;
  media: MediaItem[];
  uploadsEnabled: boolean;
  activity: { action: string; target: string; createdAt: string }[];
};
type Tab = "dashboard" | "settings" | "professor" | "media" | Kind;
const menu = [
  { id: "dashboard", name: "대시보드", icon: LayoutDashboard },
  { id: "settings", name: "Hero·사이트 설정", icon: PanelsTopLeft },
  { id: "publications", name: "논문", icon: BookOpen },
  { id: "news", name: "뉴스", icon: Newspaper },
  { id: "people", name: "구성원", icon: Users },
  { id: "professor", name: "교수 프로필·성과", icon: BookOpen },
  { id: "research", name: "연구 분야", icon: FlaskConical },
  { id: "photos", name: "연구실 사진", icon: Images },
  { id: "positions", name: "모집 안내", icon: Briefcase },
  { id: "media", name: "미디어 보관함", icon: Images },
] as const;
const descriptions: Record<Tab, string> = {
  dashboard: "연구실의 최신 이야기와 사이트 현황을 한눈에 확인하세요.",
  settings: "첫인상을 만드는 문구와 이미지, 연구실 연락처를 관리합니다.",
  publications: "논문 정보, DOI, PDF를 관리하고 최신 연구를 소개합니다.",
  news: "연구 성과, 수상 소식, 연구실의 일상을 전합니다.",
  people: "교수·연구원·학생 소개와 프로필 사진을 관리합니다.",
  professor: "People의 Academic career & recognition, 학력·경력·수상과 Scholar·CV 링크를 관리합니다.",
  research: "연구 분야별 소개와 키워드, 이미지를 관리합니다.",
  photos: "Lab life 페이지의 전체 사진과 홈에 표시할 주요 사진을 관리합니다.",
  positions: "확정된 모집 조건을 등록하고 공개 여부를 관리합니다.",
  media: "사진과 논문 PDF를 업로드하고 콘텐츠에 연결하세요.",
};
function SideNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {menu.map((m) => (
        <SidebarMenuItem key={m.id}>
          <SidebarMenuButton
            className="admin-nav-button"
            isActive={tab === m.id}
            onClick={() => {
              onChange(m.id);
              setOpenMobile(false);
            }}
          >
            <m.icon size={19} />
            <span>{m.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
function status(r: RecordItem) {
  return r.archived
    ? "보관됨"
    : !r.published
      ? "초안"
      : JSON.stringify(r.draft) !== JSON.stringify(r.published)
        ? "수정 초안"
        : "공개 중";
}
async function mutate(payload: unknown) {
  const r = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await r.json()) as { error?: string };
  if (!r.ok) throw new Error(data.error || "저장하지 못했습니다.");
}
export default function AdminWorkspace({
  initial,
  displayName,
  local,
}: {
  initial: AdminData;
  displayName: string;
  local: boolean;
}) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [settingsSaveError, setSettingsSaveError] = useState<{ scope: SettingsScope; message: string } | null>(null);
  const [editing, setEditing] = useState<{
    id?: string;
    kind: Kind;
    version?: number;
    draft: Entry;
    initial: string;
  } | null>(null);
  const [settings, setSettings] = useState(initial.settings.draft);
  const [picker, setPicker] = useState<
    "image" | "pdf" | HeroPicker | "intro" | "professorCv" | "joinPhoto" | `alumni:${number}` | null
  >(null);
  const [confirm, setConfirm] = useState<{
    record: RecordItem;
    action: "archive" | "restore" | "unpublish";
  } | null>(null);
  const [discard, setDiscard] = useState<{ tab?: Tab; close?: boolean } | null>(
    null,
  );
  const settingsDirty =
    JSON.stringify(settings) !== JSON.stringify(data.settings.draft);
  const editDirty =
    !!editing && JSON.stringify(editing.draft) !== editing.initial;
  const dirty = settingsDirty || editDirty;
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function openNew(kind: Kind, title = "") {
    const draft = {
      ...entrySchema.parse({
        title: "New entry",
        category: categories[kind][0],
        year: new Date().getFullYear(),
        date: kind === "publications" ? "" : new Date().toISOString().slice(0, 10),
      }),
      title,
    };
    setEditing({ kind, draft, initial: JSON.stringify(draft) });
    setError("");
  }
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => Promise<void> | void;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: unknown) => {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    };
    register({
      name: "list_lab_content",
      description:
        "Read the visible administrator content inventory. Does not change or publish content.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () =>
        data.records.map((r) => ({
          id: r.id,
          kind: r.kind,
          title: r.draft.title,
          status: status(r),
        })),
    });
    register({
      name: "start_lab_content_draft",
      description:
        "Open an unsaved draft in the visible editor. Does not save or publish it.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", enum: [...kinds] },
          title: { type: "string", maxLength: 500 },
        },
        required: ["kind"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input: unknown) => {
        const v = input as { kind: Kind; title?: string };
        if (
          !v ||
          !kinds.includes(v.kind) ||
          typeof (v.title ?? "") !== "string" ||
          (v.title?.length ?? 0) > 500
        )
          throw new Error("Invalid draft input");
        if (dirty) throw new Error("Save or discard your current edits first.");
        openNew(v.kind, v.title || "");
        return { stage: "editor_opened", saved: false, published: false };
      },
    });
    return () => lifecycle.abort();
  }, [data.records, dirty]);
  async function refresh() {
    const r = await fetch("/api/admin/content", { cache: "no-store" });
    const result = (await r.json()) as AdminData & { error?: string };
    if (!r.ok) throw new Error(result.error);
    setData(result);
    return result as AdminData;
  }
  function changeTab(next: Tab) {
    if (settingsDirty) {
      setDiscard({ tab: next });
      return;
    }
    setTab(next);
    setQuery("");
    setFilter("active");
    setError("");
  }
  async function saveEntry(intent: "draft" | "publish") {
    if (!editing) return;
    setError("");
    const parsed = entrySchema.safeParse(editing.draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "입력을 확인해 주세요.");
      return;
    }
    if (
      editing.kind === "publications" &&
      (!parsed.data.authors || !parsed.data.journal)
    ) {
      setError("저자와 학술지를 입력해 주세요.");
      return;
    }
    if (
      editing.kind === "photos" &&
      (!parsed.data.image || !parsed.data.imageAlt)
    ) {
      setError("사진과 사진 설명을 입력해 주세요.");
      return;
    }
    setBusy(true);
    try {
      await mutate({
        operation: "save",
        id: editing.id,
        kind: editing.kind,
        version: editing.version,
        data: parsed.data,
        intent,
      });
      setEditing(null);
      toast.success(
        intent === "publish"
          ? "사이트에 공개 반영했습니다."
          : "초안을 저장했습니다.",
      );
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  async function saveSettings(intent: "draft" | "publish", scope: SettingsScope) {
    setError("");
    setSettingsSaveError(null);
    function report(message: string) {
      setError(message);
      setSettingsSaveError({ scope, message });
      toast.error(message);
    }
    const parsed = settingsSchema.safeParse(mergeSettingsScope(data.settings.draft, settings, scope));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const fieldNames: Record<string, string> = { name: "기관명", alumnus: "졸업생", logo: "로고 이미지 URL", link: "졸업생 소개 링크", alumniInterval: "배너 이동 간격 (2~15초)", alumniHeading: "배너 제목", alumniEyebrow: "배너 상단 문구" };
      const field = String(issue?.path.at(-1) || "설정");
      const prefix = issue?.path[0] === "alumniDestinations" ? `동문 배너 ${Number(issue.path[1]) + 1}번째 기관 · ` : "";
      report(`${prefix}${fieldNames[field] || field}: ${issue?.message || "입력을 확인해 주세요."}`);
      return;
    }
    setBusy(true);
    try {
      await mutate({
        operation: "settings",
        scope,
        data: parsed.data,
        version: data.settings.version,
        intent,
      });
      const latest = await refresh();
      setSettings(current => mergeSettingsScope(current, latest.settings.draft, scope));
      toast.success(
        intent === "publish"
          ? "선택한 설정을 공개 반영했습니다."
          : "설정 초안을 저장했습니다.",
      );
    } catch (e) {
      report(e instanceof Error ? e.message : "설정을 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  async function confirmAction() {
    if (!confirm) return;
    setBusy(true);
    try {
      await mutate({
        operation: confirm.action,
        id: confirm.record.id,
        version: confirm.record.version,
      });
      setConfirm(null);
      await refresh();
      toast.success("변경했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "변경하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  const currentKind = kinds.includes(tab as Kind) ? (tab as Kind) : null;
  const orderKey = currentKind === "people" ? "peopleSortDirection"
    : currentKind === "news" ? "newsSortDirection"
    : currentKind === "publications" ? "publicationsSortDirection"
    : currentKind === "photos" ? "photosSortDirection" : null;
  const orderScope = currentKind === "people" ? "peopleOrder"
    : currentKind === "news" ? "newsOrder"
    : currentKind === "publications" ? "publicationsOrder"
    : currentKind === "photos" ? "photosOrder" : null;
  const title = menu.find((m) => m.id === tab)?.name;
  const rows = data.records
    .filter(
      (r) =>
        r.kind === currentKind &&
        (filter === "archived" ? r.archived : !r.archived) &&
        (filter === "draft"
          ? !r.published || status(r) === "수정 초안"
          : filter === "published"
            ? !!r.published
            : true) &&
        `${r.draft.title} ${r.draft.authors}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => currentKind === "publications"
      ? comparePublications(a.draft, b.draft, "newest", settings.publicationsSortDirection)
      : currentKind === "people"
        ? comparePeople(a.draft, b.draft, settings.peopleSortDirection)
      : currentKind === "news"
        ? (settings.newsSortDirection === "desc" ? b.draft.sortOrder - a.draft.sortOrder : a.draft.sortOrder - b.draft.sortOrder) ||
          b.draft.date.localeCompare(a.draft.date) || a.draft.title.localeCompare(b.draft.title)
      : currentKind === "photos"
        ? compareDisplayOrder(a.draft, b.draft, settings.photosSortDirection)
      : a.draft.sortOrder - b.draft.sortOrder || b.draft.date.localeCompare(a.draft.date));
  const published = data.records.filter(
    (r) => !r.archived && r.published,
  ).length;
  const drafts = data.records.filter(
    (r) => !r.archived && status(r) !== "공개 중",
  ).length;
  const upload = (m: MediaItem) =>
    setData((d) => ({ ...d, media: [m, ...d.media] }));
  const deleteMedia = (id: string) =>
    setData((d) => ({ ...d, media: d.media.filter((item) => item.id !== id) }));
  const chooseAsset = (a: Asset) => {
    if (picker?.startsWith("hero:")) {
      const page = picker.slice(5) as HeroPage;
      setSettings(s => setHero(s, page, { ...getHero(s, page), image: a.url, imageAlt: a.alt || a.name }));
    }
    else if (picker?.startsWith("alumni:")) {
      const index = Number(picker.slice(7));
      setSettings(s => ({ ...s, alumniDestinations: s.alumniDestinations.map((item, i) => i === index ? { ...item, logo: a.url } : item) }));
    }
    else if (picker === "intro")
      setSettings((s) => ({
        ...s,
        introImage: a.url,
        introImageAlt: a.alt || a.name,
      }));
    else if (picker === "joinPhoto")
      setSettings(s => ({ ...s, joinContent: { ...s.joinContent, photo: a.url, photoAlt: a.alt || a.name } }));
    else if (picker === "professorCv")
      setSettings((s) => ({ ...s, professorCvUrl: a.url }));
    else if (editing && picker)
      setEditing({
        ...editing,
        draft: {
          ...editing.draft,
          [picker]: a.url,
          ...(picker === "image" ? { imageAlt: a.alt || a.name } : {}),
        },
      });
    setPicker(null);
  };
  return (
    <div className="admin-app" lang="ko">
      <Toaster theme="light" position="bottom-right" />
      <SidebarProvider
        style={{ "--sidebar-width": "246px" } as React.CSSProperties}
      >
        <Sidebar className="admin-sidebar">
          <SidebarHeader className="admin-brand">
            <Link className="wordmark" href="/">
              EPA<span>LAB</span>
            </Link>
            <p>CONTENT STUDIO</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>연구실 콘텐츠</SidebarGroupLabel>
              <SideNav tab={tab} onChange={changeTab} />
            </SidebarGroup>
            <div className="sidebar-tip">
              <ShieldCheck size={19} />
              <strong>안전하게 편집하세요</strong>
              <p>초안 저장은 공개 화면에 영향을 주지 않습니다.</p>
            </div>
          </SidebarContent>
          <SidebarFooter className="admin-user">
            <div className="user-avatar">E</div>
            <div>
              <strong>{displayName}</strong>
              <span>{local ? "이 컴퓨터의 미리보기" : "사이트 관리자"}</span>
            </div>
            {local ? <a aria-label="로그아웃" href="/signout-with-chatgpt?return_to=/admin"><LogOut size={16} /></a> :
              <form action="/api/admin/session" method="post">
                <input type="hidden" name="action" value="logout" />
                <button type="submit" className="icon-button" aria-label="로그아웃"><LogOut size={16} /></button>
              </form>}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="admin-topbar">
            <div>
              <SidebarTrigger />
              <span>
                EPA LAB <span>/</span> {title}
              </span>
            </div>
            <div>
              {local ? <span className="local-tag">로컬 미리보기</span> : null}
              {!local ? <PasswordChange /> : null}
              <Link
                className="text-link"
                href="/"
                target="_blank"
                rel="noreferrer"
              >
                공개 화면 보기 <ArrowUpRight size={15} />
              </Link>
            </div>
          </header>
          <section className="admin-main" aria-label="콘텐츠 관리">
            <div className="admin-page-heading">
              <div>
                <p className="eyebrow">YOUR LAB, UP TO DATE</p>
                <h1>{title}</h1>
                <p>{descriptions[tab]}</p>
              </div>
              <div>
                {tab === "dashboard" || tab === "settings" || tab === "professor" ? (
                  <Link
                    className="button outline"
                    href={tab === "professor" ? "/admin/preview?page=people" : "/admin/preview"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Eye size={17} />{tab === "professor" ? "교수 성과 초안 미리보기" : "홈 초안 미리보기"}
                  </Link>
                ) : currentKind ? (
                  <button
                    className="button"
                    onClick={() => openNew(currentKind)}
                  >
                    <Plus size={17} />
                    {kindLabels[currentKind]} 추가
                  </button>
                ) : null}
              </div>
            </div>
            {error && !editing ? (
              <div className="form-error error-box" role="alert">
                {error}
              </div>
            ) : null}
            {tab === "dashboard" ? (
              <>
                <div className="admin-welcome">
                  <div>
                    <span>WELCOME TO YOUR CONTENT STUDIO</span>
                    <h2>
                      좋은 연구가
                      <br />더 많은 사람에게 닿도록.
                    </h2>
                    <p>오늘의 발견과 연구실의 이야기를 업데이트해 보세요.</p>
                    <button
                      className="button mint"
                      onClick={() => changeTab("settings")}
                    >
                      홈 화면 편집 <ArrowRight size={17} />
                    </button>
                  </div>
                  <div
                    className="welcome-image"
                    style={{
                      backgroundImage: `url(${data.settings.published.heroImage})`,
                    }}
                  />
                </div>
                <div className="admin-stats">
                  {[
                    {
                      title: "공개 콘텐츠",
                      value: published,
                      icon: BookOpen,
                      tab: "publications",
                    },
                    {
                      title: "검토할 초안",
                      value: drafts,
                      icon: PenLine,
                      tab: "news",
                    },
                    {
                      title: "연구실 구성원",
                      value: data.records.filter(
                        (r) => r.kind === "people" && !r.archived,
                      ).length,
                      icon: Users,
                      tab: "people",
                    },
                    {
                      title: "업로드한 파일",
                      value: data.media.length,
                      icon: Images,
                      tab: "media",
                    },
                  ].map((s) => (
                    <button
                      key={s.title}
                      onClick={() => changeTab(s.tab as Tab)}
                    >
                      <span>
                        <s.icon size={18} />
                        {s.title}
                      </span>
                      <strong>
                        {s.value}
                        <ArrowUpRight size={19} />
                      </strong>
                    </button>
                  ))}
                </div>
                <div className="dashboard-columns">
                  <section className="admin-panel">
                    <div className="panel-heading">
                      <h2>빠르게 업데이트</h2>
                      <span>자주 쓰는 작업</span>
                    </div>
                    <div className="quick-actions">
                      {[
                        {
                          kind: "publications" as Kind,
                          label: "새 논문 등록",
                          text: "제목·저자·DOI와 PDF를 추가합니다.",
                          icon: BookOpen,
                        },
                        {
                          kind: "news" as Kind,
                          label: "연구실 소식 작성",
                          text: "연구 성과와 새로운 소식을 전하세요.",
                          icon: Newspaper,
                        },
                        {
                          kind: "photos" as Kind,
                          label: "연구실 사진 추가",
                          text: "홈과 구성원 페이지에 사진을 표시합니다.",
                          icon: Images,
                        },
                      ].map((a) => (
                        <button key={a.kind} onClick={() => openNew(a.kind)}>
                          <span>
                            <a.icon size={20} />
                          </span>
                          <div>
                            <strong>{a.label}</strong>
                            <p>{a.text}</p>
                          </div>
                          <Plus size={17} />
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="admin-panel">
                    <div className="panel-heading">
                      <h2>최근 변경</h2>
                      <Clock size={17} />
                    </div>
                    {data.activity.length ? (
                      <ul className="activity-list">
                        {data.activity.slice(0, 6).map((a, i) => (
                          <li key={i}>
                            <span className="activity-mark" />
                            <div>
                              <strong>
                                {data.records.find((r) => r.id === a.target)
                                  ?.draft.title || a.target}
                              </strong>
                              <p>
                                {(
                                  {
                                    draft: "초안 저장",
                                    publish: "공개 반영",
                                    archive: "보관",
                                    restore: "복원",
                                    unpublish: "공개 해제",
                                    "password-change": "비밀번호 변경",
                                  } as Record<string, string>
                                )[a.action] || a.action}{" "}
                                ·{" "}
                                {new Date(a.createdAt).toLocaleString("ko-KR", {
                                  timeZone: "Asia/Seoul",
                                })}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="activity-empty">
                        <Clock size={28} />
                        <p>첫 업데이트를 기다리고 있습니다.</p>
                        <small>
                          저장과 공개 반영 내역이 여기에 표시됩니다.
                        </small>
                      </div>
                    )}
                  </section>
                </div>
                <div className="admin-import-note">
                  <BookOpen size={21} />
                  <div>
                    <strong>기존 홈페이지 자료를 가져왔습니다.</strong>
                    <p>
                      논문은 항목마다 선택한 게재일 또는 발행일 기준으로 표시됩니다.
                      선택한 날짜가 미정인 In press 논문은 목록 맨 위에 표시됩니다.
                      이전 논문은 공개 페이지의 전체 아카이브 링크로 연결됩니다.
                      히어로는 스티치 콘셉트 이미지이며, 모집 공고는 확정 후
                      등록하세요.
                    </p>
                  </div>
                </div>
              </>
            ) : null}
            {tab === "settings" ? (
              <SettingsEditor
                value={settings}
                onChange={setSettings}
                onPick={setPicker}
                onSave={saveSettings}
                busy={busy}
                dirty={settingsDirty}
                savedSettings={data.settings}
                saveError={settingsSaveError}
              />
            ) : null}
            {tab === "professor" ? <ProfessorEditor value={settings} onChange={setSettings} onPick={() => setPicker("professorCv")} onSave={intent => saveSettings(intent, "professor")} busy={busy} /> : null}
            {tab === "positions" ? <JoinEditor value={settings} onChange={setSettings} onPick={() => setPicker("joinPhoto")} onSave={intent => saveSettings(intent, "joinContent")} busy={busy} /> : null}
            {tab === "media" ? (
              <MediaLibrary
                uploadsEnabled={data.uploadsEnabled}
                media={data.media}
                records={data.records}
                settings={data.settings}
                onUploaded={upload}
                onDeleted={deleteMedia}
              />
            ) : null}
            {currentKind ? (
              <section className="admin-panel content-panel">
                {currentKind === "photos" ? <p><Link className="text-link" href="/admin/preview?page=lab-life" target="_blank" rel="noopener noreferrer"><Eye size={17} />저장한 연구실 사진 초안 미리보기</Link> · <Link className="text-link" href="/lab-life" target="_blank" rel="noopener noreferrer">공개된 Lab life 보기 ↗</Link></p> : null}
                <div className="content-toolbar">
                  <div className="search-box">
                    <Search size={18} />
                    <input
                      aria-label="콘텐츠 검색"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`${kindLabels[currentKind]} 검색`}
                    />
                  </div>
                  <Choice
                    value={filter}
                    onChange={setFilter}
                    label="콘텐츠 상태"
                    options={[
                      { value: "active", label: "전체 콘텐츠" },
                      { value: "published", label: "공개 중" },
                      { value: "draft", label: "초안 / 수정 초안" },
                      { value: "archived", label: "보관함" },
                    ]}
                  />
                  <button
                    className="icon-button"
                    aria-label="목록 새로고침"
                    onClick={() => refresh().catch((e) => setError(e.message))}
                  >
                    <RefreshCw size={17} />
                  </button>
                </div>
                {orderKey && orderScope ? (
                  <div className="people-order-controls">
                    <div>
                      <strong>{kindLabels[currentKind!]} 표시 순서</strong>
                      <p>{currentKind === "publications" ? "날짜순과 In press 우선을 유지하고, 같은 날짜의 표시 번호 방향을 바꿉니다." : "번호는 그대로 두고 정렬 방향만 바꿉니다."} 현재 공개: {data.settings.published[orderKey] === "desc" ? "큰 숫자 먼저" : "작은 숫자 먼저"}</p>
                    </div>
                    <Choice
                      value={settings[orderKey]}
                      onChange={(value) => setSettings((current) => ({ ...current, [orderKey]: value as "asc" | "desc" }))}
                      label={`${kindLabels[currentKind!]} 표시 순서`}
                      options={[
                        { value: "asc", label: "작은 숫자 먼저" },
                        { value: "desc", label: "큰 숫자 먼저" },
                      ]}
                    />
                    <button className="button outline small" disabled={busy} onClick={() => saveSettings("draft", orderScope)}><Save size={16} />초안 저장</button>
                    <button className="button small" disabled={busy} onClick={() => saveSettings("publish", orderScope)}><Check size={16} />사이트 반영</button>
                  </div>
                ) : null}
                <div className="content-summary">
                  {rows.length}개 항목 · 공개 반영을 눌러야 사이트에 변경 사항이
                  표시됩니다.
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목 / 이름</TableHead>
                      <TableHead>분류</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="record-title">
                            {r.draft.image ? (
                              <img src={r.draft.image} alt="" />
                            ) : null}
                            <div>
                              <strong>{r.draft.title}</strong>
                              <small>
                                {currentKind === "publications"
                                  ? `${r.draft.journal} · ${publicationListDate(r.draft)}`
                                  : r.draft.role ||
                                    r.draft.date ||
                                    `표시 순서 ${r.draft.sortOrder}`}
                              </small>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="category-label">
                            {r.draft.category || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              "status-chip " +
                              (status(r) === "공개 중"
                                ? "published"
                                : status(r) === "수정 초안"
                                  ? "changed"
                                  : "")
                            }
                          >
                            {status(r)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="record-actions">
                            {r.archived ? (
                              <button
                                className="icon-button"
                                aria-label={r.draft.title + " 복원"}
                                onClick={() =>
                                  setConfirm({ record: r, action: "restore" })
                                }
                              >
                                <ArchiveRestore size={16} />
                              </button>
                            ) : (
                              <>
                                <button
                                  className="icon-button"
                                  aria-label={r.draft.title + " 편집"}
                                  onClick={() => {
                                    setEditing({
                                      id: r.id,
                                      kind: r.kind,
                                      version: r.version,
                                      draft: structuredClone(r.draft),
                                      initial: JSON.stringify(r.draft),
                                    });
                                    setError("");
                                  }}
                                >
                                  <PenLine size={16} />
                                </button>
                                {r.published ? (
                                  <button
                                    className="icon-button"
                                    aria-label={r.draft.title + " 공개 해제"}
                                    onClick={() =>
                                      setConfirm({
                                        record: r,
                                        action: "unpublish",
                                      })
                                    }
                                  >
                                    <EyeOff size={16} />
                                  </button>
                                ) : null}
                                <button
                                  className="icon-button"
                                  aria-label={r.draft.title + " 보관"}
                                  onClick={() =>
                                    setConfirm({ record: r, action: "archive" })
                                  }
                                >
                                  <Archive size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!rows.length ? (
                  <div className="admin-empty">
                    <BookOpen size={28} />
                    <h3>
                      {query
                        ? "검색 결과가 없습니다."
                        : "등록된 항목이 없습니다."}
                    </h3>
                    <p>
                      {query
                        ? "다른 검색어를 입력해 보세요."
                        : "위의 추가 버튼으로 새 콘텐츠를 작성해 보세요."}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </section>
          <footer className="admin-footer">
            EPA LAB CONTENT STUDIO <span>초안 저장 → 미리보기 → 공개 반영</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
      <Sheet
        open={!!editing}
        onOpenChange={(v) => {
          if (!v) {
            if (busy) return;
            if (editDirty) setDiscard({ close: true });
            else {
              setEditing(null);
              setError("");
            }
          }
        }}
      >
        <SheetContent className="entry-sheet">
          <SheetHeader>
            <SheetTitle>
              {editing
                ? (editing.id ? "편집 · " : "새 항목 · ") +
                  kindLabels[editing.kind]
                : ""}
            </SheetTitle>
            <SheetDescription>
              공개 사이트에 표시할 내용은 영어로 입력하세요.
            </SheetDescription>
          </SheetHeader>
          {editing ? (
            <>
              <div className="entry-sheet-body">
                <EntryFields
                  kind={editing.kind}
                  data={editing.draft}
                  sortDirection={editing.kind === "people" ? settings.peopleSortDirection : editing.kind === "news" ? settings.newsSortDirection : editing.kind === "publications" ? settings.publicationsSortDirection : settings.photosSortDirection}
                  setData={(d) => setEditing({ ...editing, draft: d })}
                  onPick={setPicker}
                  publicationOptions={data.records.filter(r => r.kind === "publications" && !r.archived && r.published).map(r => ({ id: r.id, title: r.published!.title, year: r.published!.year, image: r.published!.image, imageAlt: r.published!.imageAlt, doi: r.published!.doi }))}
                />
                {editing.kind === "research" && editing.id ? <Link className="text-link" href={`/admin/preview?page=research&topic=${encodeURIComponent(editing.id)}`} target="_blank" rel="noopener noreferrer"><Eye size={17} />저장한 연구 설명 미리보기</Link> : null}
              </div>
              <div className="entry-sheet-footer">
                {error ? (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div>
                  <span>
                    {editDirty
                      ? "저장하지 않은 변경 사항"
                      : "편집 내용을 확인하세요"}
                  </span>
                  <button
                    disabled={busy}
                    className="button outline small"
                    onClick={() => saveEntry("draft")}
                  >
                    <Save size={16} />
                    {busy ? "처리 중…" : "초안 저장"}
                  </button>
                  <button
                    disabled={busy}
                    className="button small"
                    onClick={() => saveEntry("publish")}
                  >
                    <Check size={16} />
                    공개 반영
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!picker}
        onOpenChange={(v) => {
          if (!v) setPicker(null);
        }}
      >
        <DialogContent className="media-dialog">
          <DialogHeader>
            <DialogTitle>
              {picker === "pdf" ? "논문 PDF 선택" : picker === "professorCv" ? "교수 CV PDF 선택" : "이미지 선택"}
            </DialogTitle>
            <DialogDescription>
              파일을 추가하거나 보관함에서 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <MediaLibrary
            uploadsEnabled={data.uploadsEnabled}
            media={data.media}
            records={data.records}
            settings={data.settings}
            onUploaded={upload}
            onSelect={chooseAsset}
            only={picker === "pdf" || picker === "professorCv" ? "pdf" : "image"}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirm}
        onOpenChange={(v) => {
          if (!v && !busy) setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "archive"
                ? "이 항목을 보관할까요?"
                : confirm?.action === "restore"
                  ? "이 항목을 복원할까요?"
                  : "이 항목의 공개를 해제할까요?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.record.draft.title}
              <br />
              {confirm?.action === "archive"
                ? "공개 화면에서 숨겨집니다. 보관함에서 다시 복원할 수 있습니다."
                : confirm?.action === "restore"
                  ? "초안 상태로 복원됩니다. 공개 반영을 누르면 사이트에 표시됩니다."
                  : "내용은 유지되며 공개 사이트에서만 숨겨집니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void confirmAction();
              }}
            >
              {busy ? "처리 중…" : "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!discard}
        onOpenChange={(v) => {
          if (!v) setDiscard(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              저장하지 않은 변경 사항이 있습니다.
            </AlertDialogTitle>
            <AlertDialogDescription>
              변경 사항을 버리고 이동할까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 편집</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (discard?.close) setEditing(null);
                if (discard?.tab) {
                  setSettings(data.settings.draft);
                  setTab(discard.tab);
                }
                setDiscard(null);
                setError("");
              }}
            >
              변경 사항 버리기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
