import { FiCheckSquare } from 'react-icons/fi';
import { MockPage } from '../../../components/dashboard/MockPage';

export function OnboardingPage() {
  return (
    <MockPage
      eyebrow="Onboarding Tracker"
      title="ติดตาม readiness ของ sales"
      description="Mock UI สำหรับ manager และ sales เห็น module, task, training result และ sign-off ก่อนให้รับ lead จริง"
      icon={FiCheckSquare}
      primaryAction="Assign Path"
      stats={[
        { label: 'Assigned Sales', value: '24', tone: 'default' },
        { label: 'Ready', value: '11', tone: 'success' },
        { label: 'Needs Review', value: '7', tone: 'warning' },
        { label: 'Retraining', value: '3', tone: 'danger' },
      ]}
      panels={[
        {
          title: 'Modules',
          description: 'path มาตรฐานสำหรับ sales ใหม่',
          items: ['Company and product basics', 'Customer pain and use case', 'Pitching and compliance'],
        },
        {
          title: 'Signals',
          description: 'ข้อมูลที่ใช้ประเมิน readiness',
          items: ['Audio quality score', 'Recording review result', 'Voice Senario completion'],
        },
        {
          title: 'Manager Sign-off',
          description: 'human approval ก่อนจบ onboarding',
          items: ['Review evidence', 'Assign coaching task', 'Mark ready for live lead'],
        },
      ]}
    />
  );
}
