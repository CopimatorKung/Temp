import { FiSettings } from 'react-icons/fi';
import { MockPage } from '../../../components/dashboard/MockPage';

export function AdminUsersPage() {
  return (
    <MockPage
      eyebrow="Settings"
      title="ตั้งค่า users, roles, teams และ sales profile"
      description="Mock UI สำหรับจัดการ role sales/manager/admin, team scope และ profile ที่ใช้เพื่อ coaching/onboarding ไม่ใช่ HRM"
      icon={FiSettings}
      primaryAction="Invite User"
      stats={[
        { label: 'Users', value: '58', tone: 'default' },
        { label: 'Sales', value: '44', tone: 'success' },
        { label: 'Managers', value: '9', tone: 'muted' },
        { label: 'Inactive', value: '5', tone: 'warning' },
      ]}
      panels={[
        {
          title: 'Role Boundary',
          description: 'สิทธิ์หลักในระบบ',
          items: ['Sales ใช้ training และดู feedback ตัวเอง', 'Manager review/override และดูทีม', 'Admin จัดการ system config'],
        },
        {
          title: 'Sales Profile',
          description: 'ข้อมูลที่เก็บเพื่อ enablement',
          items: ['Team, manager, product line', 'Region and language', 'Readiness status'],
        },
        {
          title: 'Out of Scope',
          description: 'ไม่ใช่ HRM',
          items: ['No payroll', 'No leave/attendance', 'No formal HR appraisal'],
        },
      ]}
    />
  );
}
