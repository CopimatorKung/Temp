import { FiArrowRight, FiBarChart2, FiCheckCircle, FiClock, FiFileText, FiMic, FiShield, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BrandMark } from '../../../components/brand/BrandMark';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { routes } from '../../../app/routes';

const pains = [
  { title: 'Turnover สูง', detail: 'ความรู้หายไปพร้อมคนเก่า ต้องสอนคนใหม่ซ้ำ และ manager เสียเวลาประกบ' },
  { title: 'เรียนรู้นาน', detail: 'กว่าจะเข้าใจบริษัท สินค้า คู่แข่ง และ objection ใช้เวลาหลายสัปดาห์' },
  { title: 'ลูกค้าเสียเวลา', detail: 'sales ที่ยังไม่พร้อมถามผิดจุด อธิบายไม่ตรง pain และ qualification ไม่ครบ' },
  { title: 'มาตรฐานไม่สม่ำเสมอ', detail: 'บางสายลืมแนะนำตัว ไม่ถาม pain point ไม่แจ้งเงื่อนไข หรือพูด claim เกินจริง' },
];

const benefits = [
  { icon: FiClock, title: 'ลดเวลา onboarding', detail: 'รวม training, review และ readiness tracking ไว้ใน flow เดียว' },
  { icon: FiCheckCircle, title: 'พูดตามมาตรฐานองค์กร', detail: 'ตรวจ scorecard พร้อม evidence จาก transcript ทุกข้อ' },
  { icon: FiUsers, title: 'manager coach ได้ตรงจุด', detail: 'เห็นคนที่ต้อง review, จุดอ่อนซ้ำ และ coaching task' },
  { icon: FiShield, title: 'ลด compliance risk', detail: 'คุม promotion, disclaimer, prohibited claim และคำพูดที่ห้ามใช้' },
];

const features = [
  { icon: FiFileText, title: 'Audio Quality Review', detail: 'อัปโหลดไฟล์เสียง ถอด transcript วิเคราะห์ scorecard และดู evidence' },
  { icon: FiMic, title: 'AI Training', detail: 'ฝึก recording review และ Voice Senario กับ persona ลูกค้าจำลอง' },
  { icon: FiBarChart2, title: 'Onboarding Tracker', detail: 'ติดตาม readiness จาก product knowledge, pitch, Senario และ manager sign-off' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-4 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <BrandMark size="sm" showWordmark />
          <Link to={routes.login}>
            <Button>
              Login
              <FiArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="grid min-h-[calc(100vh-73px)] content-center gap-10 px-5 py-10 lg:px-8 xl:grid-cols-[1fr_520px]">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Sale Enablement MVP</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              ลดเวลาปั้น sales ให้พร้อมขายจริง ด้วย call quality, AI training และ onboarding tracking
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              SaleSync ช่วยองค์กรแก้ pain จาก turnover สูง การเรียนรู้นาน และคุณภาพการขายที่ไม่สม่ำเสมอ
              โดยเริ่มจากไฟล์เสียงที่ upload ได้ทันที ไม่ต้องเชื่อมตู้โทรศัพท์ใน MVP
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={routes.login}>
                <Button>
                  เข้าสู่ Platform
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={routes.audioNew}>
                <Button variant="secondary">Try Audio Review</Button>
              </Link>
            </div>
          </div>

          <Card className="self-center">
            <CardContent className="grid gap-4">
              {pains.map((pain) => (
                <div key={pain.title} className="rounded-lg border border-border bg-white p-4">
                  <p className="text-sm font-semibold">{pain.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{pain.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="border-t border-border bg-card px-5 py-10 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/12 text-accent">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold">{benefit.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Core Features</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent>
                    <feature.icon className="h-6 w-6 text-primary" />
                    <p className="mt-4 text-base font-semibold">{feature.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
