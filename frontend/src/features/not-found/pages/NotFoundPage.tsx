import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { routes } from '../../../app/routes';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <Card className="w-full max-w-xl">
        <CardContent className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">404 Not Found</p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">ไม่พบหน้าที่ต้องการ</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            URL นี้ยังไม่มีใน mock platform หรืออาจถูกย้ายไปอยู่ใต้ sitemap ใหม่
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <FiArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link to={routes.home}>
              <Button>
                <FiHome className="h-4 w-4" />
                Landing Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
