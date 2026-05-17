import type { IconType } from 'react-icons';
import { FiBookOpen, FiFileText, FiGrid, FiLayers, FiSearch } from 'react-icons/fi';

export type KnowledgeCategory = {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  tone: string;
};

export type KnowledgePage = {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'published';
  updatedAt: string;
  readTime: string;
  tags: string[];
  markdown: string;
};

export type KnowledgeTopic = {
  id: string;
  title: string;
  pages: KnowledgePage[];
};

export type KnowledgeChapter = {
  id: string;
  title: string;
  topics: KnowledgeTopic[];
};

export type KnowledgeBook = {
  id: string;
  title: string;
  categoryId: string;
  owner: string;
  author: string;
  lastVisitedBy: string;
  lastVisitedSince: string;
  lastUpdatedBy: string;
  lastUpdatedSince: string;
  ragStatus: 'synced' | 'pending' | 'blocked';
  chapters: KnowledgeChapter[];
};

export type LibraryTab = 'content' | 'favorite' | 'files' | 'media';
export type LibraryView = 'table' | 'grid';

export const categories: KnowledgeCategory[] = [
  {
    id: 'product',
    title: 'Product Documentation',
    description: 'Features, limits, setup, pricing notes',
    icon: FiFileText,
    tone: 'text-primary bg-primary/10',
  },
  {
    id: 'sales-playbook',
    title: 'Sales Playbooks',
    description: 'Talk track, discovery, value framing',
    icon: FiBookOpen,
    tone: 'text-success bg-success/12',
  },
  {
    id: 'market',
    title: 'Market Intelligence',
    description: 'Competitor, segment, buyer behavior',
    icon: FiSearch,
    tone: 'text-warning bg-warning/15',
  },
  {
    id: 'process',
    title: 'Internal Processes',
    description: 'Approval, onboarding, handoff workflow',
    icon: FiGrid,
    tone: 'text-primary bg-primary/10',
  },
  {
    id: 'battlecard',
    title: 'Competitive Battlecards',
    description: 'Objection proof and safe comparison',
    icon: FiLayers,
    tone: 'text-destructive bg-destructive/10',
  },
];

export const knowledgeBooks: KnowledgeBook[] = [
  {
    id: 'book-q2-sme',
    title: 'Q2 SME Revenue Playbook',
    categoryId: 'sales-playbook',
    owner: 'Enablement',
    author: 'Nara S.',
    lastVisitedBy: 'Pim K.',
    lastVisitedSince: 'today 09:48',
    lastUpdatedBy: 'Enablement Ops',
    lastUpdatedSince: '2026-05-16',
    ragStatus: 'synced',
    chapters: [
      {
        id: 'chapter-promotion',
        title: 'Promotion Governance',
        topics: [
          {
            id: 'topic-q2-promo',
            title: 'Q2 Promotion Terms',
            pages: [
              {
                id: 'page-q2-terms',
                title: 'Q2 Promotion Terms for SME',
                status: 'published',
                updatedAt: '2026-05-16',
                readTime: '4 min',
                tags: ['promotion', 'sme', 'compliance'],
                markdown:
                  '# Q2 Promotion Terms for SME\n\nใช้กับร้านค้ารายย่อยที่เข้าเกณฑ์ SME และมีบัญชีใหม่ในช่วงแคมเปญ\n\n## Must say\n\n- แจ้งวันหมดอายุของแคมเปญ\n- แจ้งยอดขั้นต่ำและข้อจำกัดสิทธิ์ให้ครบ\n- แนะนำให้ลูกค้าตรวจสอบ eligibility ก่อนตัดสินใจ\n\n## Do not say\n\n- ห้ามรับประกันยอดขาย\n- ห้ามบอกว่า conversion จะเพิ่มแน่นอน\n\n## Talk track\n\n“โปรนี้ช่วยเพิ่มแรงจูงใจในการทดลองซื้อ แต่ผลลัพธ์ขึ้นกับสินค้า กลุ่มลูกค้า และการติดตามผลครับ”',
              },
              {
                id: 'page-claim-guardrail',
                title: 'Promotion Claim Guardrail',
                status: 'published',
                updatedAt: '2026-05-15',
                readTime: '3 min',
                tags: ['guardrail', 'claim', 'legal'],
                markdown:
                  '# Promotion Claim Guardrail\n\nใช้เมื่อลูกค้าถามเรื่องผลลัพธ์ทางยอดขายหรือ conversion\n\n## Safe answer pattern\n\n1. ยืนยันสิ่งที่โปรทำได้จริง\n2. ระบุข้อจำกัด\n3. เสนอ metric ที่ควรติดตาม\n\n## Prohibited answers\n\n- “รับประกันยอดขายเพิ่ม”\n- “ได้ผลแน่นอนทุกธุรกิจ”\n- “ดีกว่าคู่แข่งทุกด้าน”',
              },
            ],
          },
          {
            id: 'topic-discovery',
            title: 'Budget Truth Discovery',
            pages: [
              {
                id: 'page-budget-truth',
                title: 'Budget Truth Discovery Script',
                status: 'review',
                updatedAt: '2026-05-14',
                readTime: '5 min',
                tags: ['discovery', 'budget', 'decision'],
                markdown:
                  '# Budget Truth Discovery Script\n\nเป้าหมายคือแยก budget จริงจาก budget ที่ลูกค้าพูดเพื่อเจรจา\n\n## Questions\n\n- ตอนนี้งบประมาณมี owner คนไหนเป็นผู้อนุมัติครับ\n- decision timeline ที่อยากเห็นผลคือเมื่อไร\n- ถ้าต้องเลือก 1 metric ที่สำคัญที่สุด จะเป็นอะไรครับ',
              },
            ],
          },
        ],
      },
      {
        id: 'chapter-competitor',
        title: 'Competitor Handling',
        topics: [
          {
            id: 'topic-positioning',
            title: 'Safe Comparison',
            pages: [
              {
                id: 'page-positioning',
                title: 'Competitor Positioning Guide',
                status: 'published',
                updatedAt: '2026-05-12',
                readTime: '6 min',
                tags: ['competitor', 'battlecard', 'proof'],
                markdown:
                  '# Competitor Positioning Guide\n\nตอบเปรียบเทียบคู่แข่งโดยไม่ overclaim\n\n## Positioning\n\nPitchsmith เน้น simulation แบบหลาย stakeholder และ feedback ที่อิง Playbook จริงขององค์กร\n\n## Evidence\n\nใช้ pilot, case study และ evaluation result เฉพาะบริบทที่มี source รองรับ',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'book-onboarding',
    title: 'Non-tech Onboarding Handbook',
    categoryId: 'product',
    owner: 'Product Marketing',
    author: 'Product Marketing',
    lastVisitedBy: 'Pim K.',
    lastVisitedSince: 'yesterday 17:20',
    lastUpdatedBy: 'Nara S.',
    lastUpdatedSince: '2026-05-13',
    ragStatus: 'pending',
    chapters: [
      {
        id: 'chapter-demo',
        title: 'Demo and Setup',
        topics: [
          {
            id: 'topic-simple-demo',
            title: 'Simple Demo Flow',
            pages: [
              {
                id: 'page-non-tech-onboarding',
                title: 'Non-tech Onboarding Talk Track',
                status: 'published',
                updatedAt: '2026-05-13',
                readTime: '5 min',
                tags: ['non-tech', 'onboarding', 'demo'],
                markdown:
                  '# Non-tech Onboarding Talk Track\n\nใช้คำง่ายและเลี่ยงศัพท์เทคนิค\n\n## Flow\n\n1. เริ่มจาก pain ในงานหน้าร้าน\n2. แสดงตัวอย่างการซ้อมหนึ่งบทสนทนา\n3. ให้ manager เห็น score และ coaching focus',
              },
            ],
          },
        ],
      },
    ],
  },
];

export const importQueue = [
  { name: 'pricing-matrix-emea-v3.xlsx', type: 'xlsx', status: 'mapped', target: 'Pricing / Enterprise' },
  { name: 'q2-promo-faq.md', type: 'md', status: 'synced', target: 'Promotion / Q2 SME' },
  { name: 'competitor-battlecard.pdf', type: 'pdf', status: 'review', target: 'Competitor / Battlecard' },
];

export const mediaAssets = [
  { id: 'media-hero-q2', name: 'q2-promo-hero.png', type: 'image', language: 'Thai', updated: '2026-05-16', tone: 'from-primary/80 to-success/70' },
  { id: 'media-product-demo', name: 'product-demo-flow.jpg', type: 'image', language: 'English', updated: '2026-05-15', tone: 'from-success/70 to-accent/60' },
  { id: 'media-objection', name: 'objection-map.png', type: 'diagram', language: 'Thai', updated: '2026-05-14', tone: 'from-warning/70 to-primary/60' },
  { id: 'media-onboard', name: 'onboarding-scorecard.png', type: 'image', language: 'Thai', updated: '2026-05-13', tone: 'from-secondary to-primary/70' },
  { id: 'media-competitor', name: 'competitor-table-cover.jpg', type: 'image', language: 'English', updated: '2026-05-12', tone: 'from-destructive/60 to-warning/60' },
  { id: 'media-call', name: 'call-review-waveform.png', type: 'image', language: 'Thai', updated: '2026-05-11', tone: 'from-success/70 to-secondary' },
  { id: 'media-battlecard', name: 'battlecard-summary.png', type: 'diagram', language: 'English', updated: '2026-05-10', tone: 'from-primary/60 to-muted' },
  { id: 'media-room', name: 'meeting-room-persona.png', type: 'image', language: 'Thai', updated: '2026-05-09', tone: 'from-accent/70 to-success/60' },
];

export const supportedFormats = ['pdf', 'csv', 'xlsx', 'md', 'doc', 'docx', 'txt'];
