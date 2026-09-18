import Link from "next/link";
import { adminIdentity } from "@/lib/admin-auth";
import { adminContent } from "@/lib/store";
import AdminWorkspace from "@/components/admin/workspace";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ login?: string }>;
}) {
  const { user, allowed, local, passwordLoginAvailable } = await adminIdentity();
  const loginStatus = (await searchParams).login;
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
          {!user && passwordLoginAvailable ? (
            <>
              <form action="/api/admin/session" method="post" className="admin-password-form">
                <label htmlFor="admin-password">관리자 비밀번호</label>
                <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
                {loginStatus === "failed" ? <p className="form-error" role="alert">비밀번호를 확인해 주세요.</p> : null}
                {loginStatus === "limited" ? <p className="form-error" role="alert">로그인 시도가 많습니다. 1분 후 다시 시도해 주세요.</p> : null}
                <button className="button" type="submit">관리자 로그인</button>
              </form>
              <p className="login-note">
                사이트 소유자가 설정한 비밀번호로 로그인하세요.
              </p>
            </>
          ) : !user ? (
            import.meta.env.DEV ? <a className="button" href={chatGPTSignInPath("/admin")}>로컬 관리자로 로그인</a> :
            <p className="login-note">관리자 로그인이 아직 설정되지 않았습니다.</p>
          ) : (
            <>
              <p className="form-error">
                로그인한 계정은 관리자로 등록되지 않았습니다.
              </p>
              <p className="login-note">관리자 비밀번호로 로그인해 주세요.</p>
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
