import { FiBookOpen } from 'react-icons/fi';
import { MockPage } from '../../../components/dashboard/MockPage';

export function PlaybooksPage() {
  return (
    <MockPage
      eyebrow="Knowledge Management"
      title="จัดการ Playbook และ Playbook Section"
      description="Mock UI สำหรับบริหาร knowledge source ที่ Ask ใช้ตอบ เช่น FAQ, Product, Promotion, Competitor, Objection, Compliance และ Talk Track โดยใช้ tags/effective date แทน RAG ใน MVP"
      icon={FiBookOpen}
      primaryAction="New Section"
      stats={[
        { label: 'Published Sections', value: '84', tone: 'success' },
        { label: 'In Review', value: '12', tone: 'warning' },
        { label: 'Expired Promotion', value: '3', tone: 'danger' },
        { label: 'Unanswered Questions', value: '27', tone: 'muted' },
      ]}
      panels={[
        {
          title: 'Promotion Governance',
          description: 'ข้อมูล promotion ต้องมี validity ก่อนนำไปใช้ตอบ',
          items: ['Q2 SME bundle expires 2026-06-30', 'Campaign eligibility requires owner review', 'Expired sections hidden from production answer'],
        },
        {
          title: 'Section Taxonomy',
          description: 'หัวข้อหลักสำหรับจัด content',
          items: ['FAQ, Product, Pricing, Promotion', 'Competitor, Objection, Compliance', 'Talk Track และ Persona Notes'],
        },
        {
          title: 'Search Strategy',
          description: 'MVP ใช้ full-text search/BM25',
          items: ['No vector/RAG in MVP', 'Answer with citation only', 'Abstain when approved source is missing'],
        },
      ]}
    />
  );
}
