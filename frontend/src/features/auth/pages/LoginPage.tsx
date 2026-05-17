import { useState } from 'react';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { BrandMark } from '../../../components/brand/BrandMark';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Field';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,0.68fr)]">
      <section className="relative hidden overflow-hidden bg-foreground px-10 py-10 text-primary-foreground lg:grid">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(42_82%_72%/.28),transparent_28%),linear-gradient(135deg,hsl(210_9%_13%),hsl(210_10%_24%))]" />
        <div className="relative grid content-between">
          <BrandMark size="lg" showWordmark />
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">Sales readiness workspace</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Train, review, and certify sales teams before real customer calls.</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-primary-foreground/72">
              เข้าสู่ Pitchsmith เพื่อดู dashboard, quality review, voice Senario, playbook และ onboarding track ของทีมขาย
            </p>
          </div>
        </div>
      </section>

      <section className="grid content-center px-5 py-10 sm:px-8">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="lg:hidden">
            <BrandMark size="md" showWordmark />
          </div>

          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 p-6 sm:p-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sign in</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">ใช้บัญชีองค์กรเพื่อเข้าสู่ mock platform</p>
              </div>

              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate(routes.dashboard);
                }}
              >
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  <span>Email</span>
                  <span className="relative block">
                    <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="email" defaultValue="pim@pitchsmith.ai" autoComplete="email" />
                  </span>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  <span>Password</span>
                  <span className="relative block">
                    <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9 pr-11"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="pitchsmith-demo"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="inline-flex items-center gap-2 font-medium text-muted-foreground">
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input accent-primary" />
                    Remember me
                  </label>
                  <button type="button" className="font-semibold text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full">
                  Login
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            New to Pitchsmith? <Link to={routes.home} className="font-semibold text-primary hover:underline">View product overview</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
