import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackParam = resolvedSearchParams.callbackUrl;
  const callbackUrl = Array.isArray(callbackParam) ? callbackParam[0] ?? null : callbackParam ?? null;
  const registered = resolvedSearchParams.registered !== undefined;
  const reset = resolvedSearchParams.reset !== undefined;

  return (
    <LoginForm callbackUrl={callbackUrl} registered={registered} reset={reset} />
  );
}
