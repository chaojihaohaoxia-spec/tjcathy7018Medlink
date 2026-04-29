"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building,
  Building2,
  Check,
  FlaskConical,
  Mail,
  MapPin,
  Microscope,
  Rocket,
  ShieldCheck,
  Truck,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type PartnerLocale = "en" | "zh" | "ko";
type PartnerIcon = typeof Building2;

type PartnerAudience = {
  title: string;
  description: string;
  benefit: string;
  target?: string;
  icon: PartnerIcon;
};

type PartnerPackage = {
  title: string;
  price: string;
  badge: string;
  highlighted?: boolean;
  features: string[];
  button: string;
};

type PartnerReason = {
  title: string;
  description: string;
  icon: PartnerIcon;
};

type OrganisationType = {
  value: string;
  title: string;
};

type PartnerCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  heroCards: string[];
  audienceEyebrow: string;
  audienceTitle: string;
  learnMore: string;
  packagesEyebrow: string;
  packagesTitle: string;
  packagesSubtitle: string;
  reasonsEyebrow: string;
  reasonsTitle: string;
  contactTitle: string;
  contactDescription: string;
  organisationName: string;
  organisationType: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  demoNote: string;
  toast: string;
  audiences: PartnerAudience[];
  packages: PartnerPackage[];
  reasons: PartnerReason[];
  organisationTypes: OrganisationType[];
};

const partnerCopy: Record<PartnerLocale, PartnerCopy> = {
  en: {
    heroEyebrow: "MedLink Partner Consortium",
    heroTitle: "Build the Future of Connected Healthcare With MedLink",
    heroDescription:
      "We are seeking pilot partners across hospital networks, pharmaceutical supply chains, and research institutions. Join the MedLink consortium and help reshape patient care coordination in China.",
    primaryCta: "Apply for Pilot Partnership",
    secondaryCta: "View Service Packages",
    heroCards: ["Hospital network pilot", "Drug batch certification", "PIPL-ready research data", "Regulator-facing compliance"],
    audienceEyebrow: "Who We Work With",
    audienceTitle: "Built for healthcare operators, supply-chain owners, and research teams.",
    learnMore: "Learn More",
    packagesEyebrow: "Service Packages & Pricing",
    packagesTitle: "Transparent Pricing for Every Partner Type",
    packagesSubtitle: "All prices are indicative for pilot phase. Enterprise contracts available.",
    reasonsEyebrow: "Why Partner Now",
    reasonsTitle: "Pilot partners help shape the operating standard.",
    contactTitle: "Apply for Partnership or Request a Demo",
    contactDescription: "Tell us about your organisation and partnership interest.",
    organisationName: "Organisation name",
    organisationType: "Organisation type",
    contactName: "Contact name",
    email: "Email",
    phone: "Phone (optional)",
    message: "Message / specific interest",
    submit: "Submit Partnership Inquiry",
    demoNote: "This is an academic prototype. Form submissions are stored locally for demonstration purposes only.",
    toast: "Thank you. A MedLink partnerships team member will be in touch within 2 business days.",
    audiences: [
      {
        title: "Class A Tertiary Hospitals",
        description: "Reduce duplicate examinations, improve cross-hospital referral efficiency, and access complete patient histories at point of care.",
        benefit: "Average 31% reduction in duplicate tests in pilot simulations",
        icon: Building2
      },
      {
        title: "Class B Secondary Hospitals",
        description: "Become a node in the MedLink referral network. Receive AI-triaged referrals from primary care clinics with authorized medical summaries.",
        benefit: "Standardized FHIR integration; no HIS replacement required",
        icon: Building
      },
      {
        title: "Primary Care Clinics",
        description: "Connect to the referral network, share visit summaries when authorized, and improve triage capability with AI-assisted routing.",
        benefit: "Free pilot entry for community care sites",
        icon: MapPin
      },
      {
        title: "Pharmaceutical Distributors",
        description: "Certify each drug batch, meet traceability requirements, reduce liability exposure, and provide hospitals with verified provenance records.",
        target: "Sinopharm, CR Pharma, and regional distributors",
        benefit: "¥1,000-2,000 per batch certification; compliance-ready audit evidence",
        icon: Truck
      },
      {
        title: "High-Value Drug Manufacturers",
        description: "Protect oncology, biologic, and specialty medicine brands from counterfeiting with end-to-end supply chain verification.",
        target: "Oncology targeted therapy, biologics, specialty drugs",
        benefit: "Brand protection plus optional real-world evidence access",
        icon: FlaskConical
      },
      {
        title: "Research Institutions & CROs",
        description: "Access de-identified, consent-verified real-world clinical datasets for drug development, post-market surveillance, and health economics research.",
        benefit: "PIPL-compliant data packages with consent records",
        icon: Microscope
      }
    ],
    packages: [
      {
        title: "Primary Care Clinic",
        price: "¥0 / year",
        badge: "Network Entry",
        features: ["Record summary access", "Referral voucher receiving", "Basic AI triage suggestions", "FHIR API connection"],
        button: "Apply for Free Access"
      },
      {
        title: "Class B Secondary Hospital",
        price: "¥200,000-500,000 / year",
        badge: "Most Popular",
        highlighted: true,
        features: [
          "Full MedLink integration",
          "MediRoute AI triage API",
          "Referral voucher generation",
          "Cross-hospital record retrieval",
          "FHIR HIS connector",
          "Basic compliance reporting"
        ],
        button: "Request Demo"
      },
      {
        title: "Class A Tertiary Hospital",
        price: "¥1,000,000-3,000,000 / year",
        badge: "Enterprise",
        features: [
          "Everything in Standard",
          "MediRx prescription authority routing",
          "Drug batch traceability module",
          "Hospital admin dashboard",
          "Compliance-as-a-Service",
          "Dedicated integration engineer",
          "SLA guarantee"
        ],
        button: "Contact Sales"
      },
      {
        title: "Pharma / Distributor",
        price: "¥1,000-2,000 / batch",
        badge: "Pay As You Go",
        features: ["Drug batch certification", "Provenance storage", "Regulatory audit evidence", "Tamper detection", "Optional real-world evidence access"],
        button: "Start Certification"
      }
    ],
    reasons: [
      {
        title: "First-Mover Advantage",
        description: "China's digital health market is growing rapidly. Early consortium members help set interoperability standards.",
        icon: Rocket
      },
      {
        title: "Policy Alignment",
        description: "MedLink aligns with national digital health, AI application, and healthcare data governance priorities.",
        icon: ShieldCheck
      },
      {
        title: "Pilot in Chengdu",
        description: "We are launching the first city pilot in Chengdu in 2026. Limited pilot slots are available for anchor hospitals and distributor partners.",
        icon: MapPin
      }
    ],
    organisationTypes: [
      { value: "tertiary-hospital", title: "Class A Tertiary Hospital" },
      { value: "secondary-hospital", title: "Class B Secondary Hospital" },
      { value: "primary-care", title: "Primary Care Clinic" },
      { value: "pharma-distributor", title: "Pharmaceutical Distributor" },
      { value: "manufacturer", title: "Drug Manufacturer" },
      { value: "research", title: "Research Institution" },
      { value: "regulator", title: "Regulator" },
      { value: "other", title: "Other" }
    ]
  },
  zh: {
    heroEyebrow: "MedLink 合作伙伴计划",
    heroTitle: "与 MedLink 一起建设更顺畅的医疗协同网络",
    heroDescription:
      "我们正在寻找医院网络、医药供应链和科研机构作为试点合作方，共同验证跨机构病历协同、智能分诊、转诊和药品追溯在中国大陆场景下的落地价值。",
    primaryCta: "申请试点合作",
    secondaryCta: "查看合作方案",
    heroCards: ["医院网络试点", "药品批次认证", "合规科研数据", "面向监管的证明材料"],
    audienceEyebrow: "合作对象",
    audienceTitle: "为医院运营方、医药供应链和科研团队设计。",
    learnMore: "了解更多",
    packagesEyebrow: "服务方案与价格",
    packagesTitle: "不同合作方对应清晰的试点方案",
    packagesSubtitle: "以下价格为试点阶段参考区间，正式合作可按机构规模和接入范围定制。",
    reasonsEyebrow: "为什么现在加入",
    reasonsTitle: "试点合作方可以共同定义医疗协同的运行标准。",
    contactTitle: "申请合作或预约演示",
    contactDescription: "告诉我们您的机构类型和合作兴趣，我们会尽快联系您。",
    organisationName: "机构名称",
    organisationType: "机构类型",
    contactName: "联系人姓名",
    email: "邮箱",
    phone: "电话（选填）",
    message: "留言 / 具体合作兴趣",
    submit: "提交合作咨询",
    demoNote: "这是学术原型页面。表单提交仅保存在本地，用于演示。",
    toast: "谢谢，MedLink 合作团队会在 2 个工作日内联系您。",
    audiences: [
      {
        title: "三甲医院",
        description: "减少重复检查，提高跨院转诊效率，并让医生在接诊时看到经患者授权的完整病史摘要。",
        benefit: "试点模拟中，重复检查平均减少 31%",
        icon: Building2
      },
      {
        title: "二级医院",
        description: "成为 MedLink 转诊网络节点，接收来自基层机构的智能分诊转诊，并提前获得患者授权后的病历摘要。",
        benefit: "标准化 FHIR 接入，无需替换现有 HIS 系统",
        icon: Building
      },
      {
        title: "基层医疗机构",
        description: "接入转诊网络，在患者授权后共享就诊摘要，并通过智能分诊提升首诊判断和转诊能力。",
        benefit: "基层试点机构可免费接入",
        icon: MapPin
      },
      {
        title: "医药流通企业",
        description: "为每个药品批次建立可信证明，满足追溯要求，降低责任风险，并向医院提供可核验的来源记录。",
        target: "国药、华润医药及区域医药配送企业",
        benefit: "每批次认证约 ¥1,000-2,000，可生成合规证明材料",
        icon: Truck
      },
      {
        title: "高价值药品生产企业",
        description: "保护肿瘤药、生物制剂和专科药品品牌，降低假药和渠道不透明带来的风险。",
        target: "肿瘤靶向药、生物制剂、专科药品",
        benefit: "品牌保护，并可选择接入真实世界证据能力",
        icon: FlaskConical
      },
      {
        title: "科研机构与 CRO",
        description: "在去标识化和患者授权的前提下，获取真实世界临床数据，用于药物研发、上市后监测和卫生经济学研究。",
        benefit: "符合《个人信息保护法》要求的数据包和授权记录",
        icon: Microscope
      }
    ],
    packages: [
      {
        title: "基层医疗机构",
        price: "¥0 / 年",
        badge: "网络接入",
        features: ["病历摘要读取", "接收转诊凭证", "基础智能分诊建议", "FHIR API 接入"],
        button: "申请免费接入"
      },
      {
        title: "二级医院",
        price: "¥200,000-500,000 / 年",
        badge: "推荐方案",
        highlighted: true,
        features: ["完整 MedLink 接入", "MediRoute 智能分诊 API", "转诊凭证生成", "跨院病历调阅", "FHIR HIS 连接器", "基础合规报表"],
        button: "预约演示"
      },
      {
        title: "三甲医院",
        price: "¥1,000,000-3,000,000 / 年",
        badge: "企业级",
        features: ["包含标准版全部能力", "MediRx 处方权限路由", "药品批次追溯模块", "医院管理仪表盘", "合规服务包", "专属集成工程师", "服务等级保障"],
        button: "联系销售"
      },
      {
        title: "医药企业 / 流通企业",
        price: "¥1,000-2,000 / 批次",
        badge: "按批次付费",
        features: ["药品批次认证", "来源证明存储", "监管证明材料", "篡改检测", "可选真实世界证据服务"],
        button: "开始认证"
      }
    ],
    reasons: [
      {
        title: "先发优势",
        description: "中国数字医疗市场仍在高速发展，早期试点成员可以参与制定跨机构协同和数据互通标准。",
        icon: Rocket
      },
      {
        title: "契合政策方向",
        description: "MedLink 与数字健康、人工智能应用场景和医疗数据治理方向一致，适合做城市级试点验证。",
        icon: ShieldCheck
      },
      {
        title: "成都试点",
        description: "我们计划在 2026 年启动成都首个城市试点，核心医院和医药配送合作名额有限。",
        icon: MapPin
      }
    ],
    organisationTypes: [
      { value: "tertiary-hospital", title: "三甲医院" },
      { value: "secondary-hospital", title: "二级医院" },
      { value: "primary-care", title: "基层医疗机构" },
      { value: "pharma-distributor", title: "医药流通企业" },
      { value: "manufacturer", title: "药品生产企业" },
      { value: "research", title: "科研机构" },
      { value: "regulator", title: "监管机构" },
      { value: "other", title: "其他" }
    ]
  },
  ko: {
    heroEyebrow: "MedLink 파트너 컨소시엄",
    heroTitle: "MedLink와 함께 연결된 의료 협력의 미래를 구축하세요",
    heroDescription:
      "MedLink는 병원 네트워크, 의약품 공급망, 연구기관과 함께 중국 본토 환경에서 의료 기록 공유, AI 기반 사전 분류, 의뢰, 의약품 추적의 시범 적용 가능성을 검증하고자 합니다.",
    primaryCta: "시범 파트너십 신청",
    secondaryCta: "서비스 패키지 보기",
    heroCards: ["병원 네트워크 파일럿", "의약품 배치 인증", "PIPL 대응 연구 데이터", "규제기관 대응 증빙"],
    audienceEyebrow: "협력 대상",
    audienceTitle: "병원 운영 조직, 공급망 담당자, 연구팀을 위해 설계되었습니다.",
    learnMore: "자세히 보기",
    packagesEyebrow: "서비스 패키지 및 가격",
    packagesTitle: "파트너 유형별로 명확한 시범 도입 패키지",
    packagesSubtitle: "아래 가격은 파일럿 단계의 참고 범위이며, 기관 규모와 연동 범위에 따라 기업 계약을 조정할 수 있습니다.",
    reasonsEyebrow: "지금 파트너가 되어야 하는 이유",
    reasonsTitle: "파일럿 파트너는 의료 협력의 운영 표준을 함께 설계합니다.",
    contactTitle: "파트너십 신청 또는 데모 요청",
    contactDescription: "기관 정보와 관심 있는 협력 분야를 알려 주세요.",
    organisationName: "기관명",
    organisationType: "기관 유형",
    contactName: "담당자 이름",
    email: "이메일",
    phone: "전화번호(선택)",
    message: "문의 내용 / 관심 협력 분야",
    submit: "파트너십 문의 제출",
    demoNote: "이 페이지는 학술 프로토타입입니다. 제출 내용은 시연 목적으로만 로컬에 저장됩니다.",
    toast: "감사합니다. MedLink 파트너십 팀이 영업일 기준 2일 이내에 연락드리겠습니다.",
    audiences: [
      {
        title: "3차 병원 (상급종합병원)",
        description: "중복 검사를 줄이고 병원 간 의뢰 효율을 높이며, 진료 시점에 환자가 허가한 병력 요약을 확인할 수 있습니다.",
        benefit: "파일럿 시뮬레이션에서 중복 검사 평균 31% 감소",
        icon: Building2
      },
      {
        title: "2차 병원 (일반 종합병원)",
        description: "MedLink 의뢰 네트워크의 노드가 되어 1차 병원 (의원, 보건소)에서 AI 분류를 거친 의뢰와 승인된 의료 기록 요약을 받을 수 있습니다.",
        benefit: "표준화된 FHIR 연동; 기존 HIS 교체 불필요",
        icon: Building
      },
      {
        title: "1차 병원 (의원, 보건소)",
        description: "의뢰 네트워크에 연결하고, 환자 승인 후 진료 요약을 공유하며, AI 보조 분류로 초진 판단과 의뢰 역량을 강화합니다.",
        benefit: "1차 병원 (의원, 보건소)은 파일럿 기간 무료 진입 가능",
        icon: MapPin
      },
      {
        title: "의약품 유통사",
        description: "의약품 배치별 인증을 통해 추적 요구사항을 충족하고, 책임 위험을 낮추며, 병원에 검증 가능한 출처 기록을 제공합니다.",
        target: "Sinopharm, CR Pharma 및 지역 유통사",
        benefit: "배치당 ¥1,000-2,000 인증; 규제 대응 증빙 제공",
        icon: Truck
      },
      {
        title: "고가 의약품 제조사",
        description: "항암제, 바이오의약품, 전문의약품 브랜드를 위조 및 불투명한 유통 위험으로부터 보호합니다.",
        target: "표적 항암제, 바이오의약품, 전문의약품",
        benefit: "브랜드 보호와 선택적 실제 진료 근거 접근",
        icon: FlaskConical
      },
      {
        title: "연구기관 및 CRO",
        description: "비식별화 및 환자 동의를 기반으로 실제 임상 데이터를 활용하여 신약 개발, 시판 후 감시, 보건경제 연구를 지원합니다.",
        benefit: "중국 개인정보보호법(PIPL)에 맞춘 데이터 패키지와 동의 기록",
        icon: Microscope
      }
    ],
    packages: [
      {
        title: "1차 병원 (의원, 보건소)",
        price: "¥0 / 년",
        badge: "네트워크 진입",
        features: ["진료 기록 요약 조회", "의뢰 바우처 수신", "기본 AI 분류 제안", "FHIR API 연동"],
        button: "무료 접속 신청"
      },
      {
        title: "2차 병원 (일반 종합병원)",
        price: "¥200,000-500,000 / 년",
        badge: "추천 패키지",
        highlighted: true,
        features: ["전체 MedLink 연동", "MediRoute AI 분류 API", "의뢰 바우처 생성", "병원 간 기록 조회", "FHIR HIS 커넥터", "기본 컴플라이언스 리포트"],
        button: "데모 요청"
      },
      {
        title: "3차 병원 (상급종합병원)",
        price: "¥1,000,000-3,000,000 / 년",
        badge: "엔터프라이즈",
        features: [
          "Standard 패키지 전체 기능",
          "MediRx 처방 권한 라우팅",
          "의약품 배치 추적 모듈",
          "병원 관리자 대시보드",
          "컴플라이언스 서비스 패키지",
          "전담 연동 엔지니어",
          "SLA 보장"
        ],
        button: "영업팀 문의"
      },
      {
        title: "제약사 / 유통사",
        price: "¥1,000-2,000 / 배치",
        badge: "사용량 기반",
        features: ["의약품 배치 인증", "출처 증빙 저장", "규제 대응 증빙", "변조 감지", "선택적 실제 진료 근거 접근"],
        button: "인증 시작"
      }
    ],
    reasons: [
      {
        title: "선도자 이점",
        description: "중국 디지털 헬스 시장은 빠르게 성장하고 있습니다. 초기 컨소시엄 참여자는 상호운용 표준 형성에 기여할 수 있습니다.",
        icon: Rocket
      },
      {
        title: "정책 방향과의 정합성",
        description: "MedLink는 디지털 헬스, AI 적용, 의료 데이터 거버넌스라는 정책 방향과 잘 맞아 도시 단위 파일럿에 적합합니다.",
        icon: ShieldCheck
      },
      {
        title: "청두 파일럿",
        description: "2026년에 청두에서 첫 도시 파일럿을 시작할 예정이며, 핵심 병원과 의약품 유통 파트너 자리는 제한되어 있습니다.",
        icon: MapPin
      }
    ],
    organisationTypes: [
      { value: "tertiary-hospital", title: "3차 병원 (상급종합병원)" },
      { value: "secondary-hospital", title: "2차 병원 (일반 종합병원)" },
      { value: "primary-care", title: "1차 병원 (의원, 보건소)" },
      { value: "pharma-distributor", title: "의약품 유통사" },
      { value: "manufacturer", title: "의약품 제조사" },
      { value: "research", title: "연구기관" },
      { value: "regulator", title: "규제기관" },
      { value: "other", title: "기타" }
    ]
  }
};

type ToastState = {
  visible: boolean;
  title: string;
};

function partnerLocale(language: string): PartnerLocale {
  if (language === "zh-CN" || language === "zh-TW") {
    return "zh";
  }
  if (language === "ko") {
    return "ko";
  }
  return "en";
}

export default function PartnersPage() {
  const { language } = useLanguage();
  const copy = partnerCopy[partnerLocale(language)];
  const [toast, setToast] = useState<ToastState>({ visible: false, title: "" });

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submission = Object.fromEntries(formData.entries());
    window.localStorage.setItem("medlink_partner_inquiry", JSON.stringify({ ...submission, submittedAt: new Date().toISOString() }));
    setToast({ visible: true, title: copy.toast });
    form.reset();
    window.setTimeout(() => setToast({ visible: false, title: "" }), 4500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-16 pt-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="grid min-h-[calc(100vh-8rem)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{copy.heroEyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 sm:text-6xl">{copy.heroTitle}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">{copy.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="primary-button justify-center">
                {copy.primaryCta}
              </a>
              <a href="#packages" className="glass-button justify-center px-5 py-3">
                {copy.secondaryCta}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="grid gap-4">
              {copy.heroCards.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <BadgeCheck className="h-5 w-5 text-sky-600" />
                  <span className="text-sm font-medium text-slate-900">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="who-we-serve" className="scroll-mt-24 py-12">
          <SectionHeader eyebrow={copy.audienceEyebrow} title={copy.audienceTitle} />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {copy.audiences.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <motion.article
                  key={audience.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <Icon className="h-7 w-7 text-sky-600" />
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{audience.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{audience.description}</p>
                  {audience.target ? <p className="mt-3 text-sm font-medium text-emerald-600">{audience.target}</p> : null}
                  <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm leading-6 text-sky-700">{audience.benefit}</p>
                  <a href="#contact" className="mt-5 inline-flex text-sm font-semibold text-sky-700 hover:text-slate-900">
                    {copy.learnMore}
                  </a>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section id="packages" className="scroll-mt-24 py-12">
          <SectionHeader eyebrow={copy.packagesEyebrow} title={copy.packagesTitle} subtitle={copy.packagesSubtitle} />
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {copy.packages.map((item) => (
              <article
                key={item.title}
                className={`glass-card flex rounded-2xl p-5 ${item.highlighted ? "border-sky-400 shadow-[0_0_40px_rgba(14,165,233,0.16)]" : ""}`}
              >
                <div className="flex w-full flex-col">
                  <span className="w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {item.badge}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-2xl font-semibold text-sky-700">{item.price}</p>
                  <ul className="mt-5 grid flex-1 gap-3">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm leading-6 text-slate-600">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={item.highlighted ? "primary-button mt-6 justify-center" : "glass-button mt-6 justify-center"}>
                    {item.button}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <SectionHeader eyebrow={copy.reasonsEyebrow} title={copy.reasonsTitle} />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {copy.reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <article key={reason.title} className="glass-card rounded-2xl p-5">
                  <Icon className="h-7 w-7 text-sky-600" />
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{reason.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 py-12">
          <div className="glass-card mx-auto max-w-4xl rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">{copy.contactTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">{copy.contactDescription}</p>
              </div>
            </div>

            <form onSubmit={submitForm} className="mt-8 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField name="organisationName" label={copy.organisationName} required />
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  {copy.organisationType}
                  <select name="organisationType" required className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-400">
                    {copy.organisationTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-white text-slate-900">
                        {type.title}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField name="contactName" label={copy.contactName} required />
                <TextField name="email" label={copy.email} type="email" required />
                <TextField name="phone" label={copy.phone} />
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                {copy.message}
                <textarea
                  name="message"
                  rows={5}
                  className="resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                  required
                />
              </label>
              <button type="submit" className="primary-button h-12 justify-center">
                {copy.submit}
              </button>
              <p className="text-xs leading-6 text-slate-500">{copy.demoNote}</p>
            </form>
          </div>
        </section>
      </div>

      {toast.visible ? (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl ">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Check className="h-4 w-4" />
          </div>
          <p className="text-sm leading-6 text-slate-900">{toast.title}</p>
          <button type="button" onClick={() => setToast({ visible: false, title: "" })} className="text-slate-500 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function TextField({
  name,
  label,
  type = "text",
  required = false
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
      />
    </label>
  );
}
