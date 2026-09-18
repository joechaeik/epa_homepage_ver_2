import Link from "next/link";
import { adminIdentity } from "@/lib/admin-auth";
import { adminContent } from "@/lib/store";
import { chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import AdminWorkspace from "@/components/admin/workspace";
import { ArrowUpRight, ShieldCheck, ArrowLeft } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const { user, allowed, local } = await adminIdentity();
  if (!allowed)
    return (
      <main lang="ko" className="admin-login">
        <Link className="wordmark" href="/">
          EPA<span>LAB</span>
        </Link>
        <div className="login-card">
          <span className="login-icon">
            <ShieldCheck size={30} />
          </span>
          <p className="eyebrow">LABORATORY CONTENT STUDIO</p>
          <h1>
            연구실의 이야기를
            <br />
            관리하는 공간
          </h1>
          <p>
            논문과 소식, 구성원, 사진부터
            <br />홈 화면까지 한 곳에서 업데이트하세요.
          </p>
          {!user ? (
            <>
              <a
                className="button"
                target="_top"
                href={chatGPTSignInPath("/admin")}
              >
                ChatGPT로 관리자 로그인 <ArrowUpRight size={18} />
              </a>
              <p className="login-note">
                지정된 관리자 계정만 콘텐츠를 수정할 수 있습니다.
                {import.meta.env.DEV
                  ? " 이 로컬 미리보기에서는 테스트 관리자 계정으로 로그인됩니다."
                  : ""}
              </p>
            </>
          ) : (
            <>
              <p className="form-error">
                로그인한 계정은 관리자로 등록되지 않았습니다.
              </p>
              <p className="login-note">
                사이트 소유자가 배포 환경에 이 계정의 관리자 권한을 지정해야
                합니다.
              </p>
              <code className="identity-code">{user.userId}</code>
              <a
                className="text-link"
                target="_top"
                href={chatGPTSignOutPath("/admin")}
              >
                다른 계정으로 로그인
              </a>
            </>
          )}
          <Link className="login-back" href="/">
            <ArrowLeft size={15} />
            사이트로 돌아가기
          </Link>
        </div>
        <span className="login-footer">EPA LAB · KENTECH</span>
      </main>
    );
  return (
    <AdminWorkspace
      initial={await adminContent()}
      displayName={local ? "로컬 관리자" : user!.displayName}
      local={local}
    />
  );
}
