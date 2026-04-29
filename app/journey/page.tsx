"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock3,
  ClipboardList,
  Copy as CopyIcon,
  FileCheck2,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Pill,
  Phone,
  QrCode,
  RotateCcw,
  Route,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
  X
} from "lucide-react";
import { generateTxHash } from "@/services/blockchainService";
import { useLanguage } from "@/contexts/LanguageContext";

type PatientProfile = {
  id: string;
  name: string;
  chineseName: string;
  relation?: string;
  chineseRelation?: string;
  age: number;
  condition: string;
  allergy: string;
  recent: string[];
};

type AuditEntry = {
  id: string;
  time: string;
  module: string;
  actor: string;
  action: string;
  txHash: string;
  status: "Confirmed" | "Pending" | "Verified" | "Completed";
};

type SequenceEntry = {
  label: string;
  status: "running" | "done";
};

type TriageRisk = "HIGH" | "MEDIUM" | "SPECIALIST" | "LOW-MEDIUM";

type TriageResult = {
  risk: TriageRisk;
  probabilities: string[];
  department: string;
  careLevel: string;
  explanation: string;
  redFlag?: string;
};

type CareRecommendation = {
  tone: "red" | "amber" | "green";
  signal: string;
  possible: string;
  hospital: string;
  department: string;
  slots: string;
  distance: string;
  medicine: string;
  facilityKind: FacilityKind;
  address: string;
  phone: string;
  travel: string;
  etaShort: string;
  routeAdvice: string;
  facilityLevel: string;
  availability: AvailabilitySnapshot;
  doctors: DoctorOption[];
};

type AvailabilitySnapshot = {
  summary: string;
  waitTime: string;
  registrationStatus: string;
  doctorSchedule: string;
  bedStatus: string;
};

type DoctorOption = {
  name: string;
  title: string;
  specialty: string;
  nextAvailable: string;
  waitTime: string;
};

type Voucher = {
  id: string;
  txHash: string;
};

type BatchDetail = {
  institution: string;
  drugName: string;
  batchId: string;
  manufacturer: string;
  distributor: string;
  pharmacy: string;
  ipfsCid: string;
  txHash: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type IdentityMode = "self" | "family";
type HospitalShareDecision = "shared" | "later" | null;
type CityKey = "Chengdu" | "Shanghai" | "Guangzhou" | "Shenzhen";
type FacilityKind = "primary" | "secondary" | "emergency" | "specialist" | "tertiary";
type SymptomSampleGroupId = "mild" | "moderate" | "severe";

type CityFacility = {
  enName: string;
  zhName: string;
  enAddress: string;
  zhAddress: string;
  phone: string;
  distance: string;
  enTravel: string;
  zhTravel: string;
};

type PharmacyFacility = {
  enName: string;
  zhName: string;
  levelEn: string;
  levelZh: string;
  typeEn: string;
  typeZh: string;
  distance: string;
  travelEn: string;
  travelZh: string;
  nextSlotEn: string;
  nextSlotZh: string;
};

type CityCareConfig = {
  enCity: string;
  zhCity: string;
  routeStartEn: string;
  routeStartZh: string;
  routeRoadsEn: [string, string, string];
  routeRoadsZh: [string, string, string];
  routeAdviceEn: string;
  routeAdviceZh: string;
  distributorEn: string;
  distributorZh: string;
  facilities: Record<FacilityKind, CityFacility>;
  nearbyPickups: PharmacyFacility[];
};

const selfProfile: PatientProfile = {
  id: "wang-fang",
  name: "Ms. Chen (Fang Chen)",
  chineseName: "陈芳女士",
  age: 34,
  condition: "No chronic condition",
  allergy: "Penicillin",
  recent: ["Annual checkup", "Allergy record", "Cold medicine prescription"]
};

const familyProfiles: PatientProfile[] = [
  {
    id: "wang-jianguo",
    name: "Mr. Chen (Jianguo Chen)",
    chineseName: "陈建国先生",
    relation: "Father",
    chineseRelation: "父亲",
    age: 63,
    condition: "Type 2 diabetes",
    allergy: "None",
    recent: ["HbA1c test", "Metformin prescription", "Blood pressure log"]
  },
  {
    id: "wang-xiaomei",
    name: "Ms. Wang (Xiaomei Wang)",
    chineseName: "王小美",
    relation: "Daughter",
    chineseRelation: "女儿",
    age: 5,
    condition: "No chronic condition",
    allergy: "Dust mite allergy",
    recent: ["Pediatric checkup", "Vaccination record"]
  }
];

const symptomDurations = ["<1 day", "1-3 days", "3-7 days", ">7 days"];
const severityLevels = ["mild", "moderate", "severe"];
const locations: CityKey[] = ["Chengdu", "Shanghai", "Guangzhou", "Shenzhen"];

const cityCareConfigs: Record<CityKey, CityCareConfig> = {
  Chengdu: {
    enCity: "Chengdu",
    zhCity: "成都",
    routeStartEn: "Near Chunxi Road, Jinjiang District, Chengdu",
    routeStartZh: "成都市锦江区春熙路附近",
    routeRoadsEn: ["Shudu Ave", "Renmin S Rd", "Guoxue Alley"],
    routeRoadsZh: ["蜀都大道", "人民南路", "国学巷"],
    routeAdviceEn: "Take a taxi via Shudu Avenue and Renmin South Road to the West China Hospital emergency entrance.",
    routeAdviceZh: "建议打车前往，沿蜀都大道、人民南路到华西医院急诊入口。",
    distributorEn: "Sichuan Verified Medical Distributor",
    distributorZh: "四川合规医药配送中心",
    facilities: {
      primary: {
        enName: "Chengdu Jinjiang District Community Health Center",
        zhName: "成都市锦江区社区卫生服务中心",
        enAddress: "No. 18 Jingkang Road, Jinjiang District, Chengdu",
        zhAddress: "成都市锦江区静康路18号",
        phone: "028-8451-8120",
        distance: "1.2 km",
        enTravel: "about 5 minutes by taxi",
        zhTravel: "打车约5分钟"
      },
      secondary: {
        enName: "Chengdu Jinjiang District People's Hospital",
        zhName: "成都市锦江区人民医院",
        enAddress: "No. 65 Shuwa North 2nd Street, Jinjiang District, Chengdu",
        zhAddress: "成都市锦江区暑袜北二街65号",
        phone: "028-8662-7232",
        distance: "2.0 km",
        enTravel: "about 6 minutes by taxi",
        zhTravel: "打车约6分钟"
      },
      emergency: {
        enName: "West China Hospital Emergency Department",
        zhName: "华西医院急诊",
        enAddress: "No. 37 Guoxue Alley, Wuhou District, Chengdu",
        zhAddress: "成都市武侯区国学巷37号",
        phone: "028-8542-2114",
        distance: "7.4 km",
        enTravel: "about 15 minutes by taxi",
        zhTravel: "打车约15分钟"
      },
      specialist: {
        enName: "Sichuan Cancer Hospital",
        zhName: "四川省肿瘤医院",
        enAddress: "No. 55 Section 4, Renmin South Road, Chengdu",
        zhAddress: "成都市人民南路四段55号",
        phone: "028-8542-0305",
        distance: "9.1 km",
        enTravel: "about 18 minutes by taxi",
        zhTravel: "打车约18分钟"
      },
      tertiary: {
        enName: "West China Hospital, Sichuan University",
        zhName: "四川大学华西医院",
        enAddress: "No. 37 Guoxue Alley, Wuhou District, Chengdu",
        zhAddress: "成都市武侯区国学巷37号",
        phone: "028-8542-2114",
        distance: "7.4 km",
        enTravel: "about 15 minutes by taxi",
        zhTravel: "打车约15分钟"
      }
    },
    nearbyPickups: [
      {
        enName: "Chengdu Xinhua Primary Care Clinic Pharmacy",
        zhName: "成都新华社区诊所药房",
        levelEn: "Primary care",
        levelZh: "基层",
        typeEn: "Clinic pharmacy",
        typeZh: "诊所药房",
        distance: "0.8 km",
        travelEn: "About 10 minutes on foot",
        travelZh: "步行约10分钟",
        nextSlotEn: "Today 14:40",
        nextSlotZh: "今天14:40"
      },
      {
        enName: "Yifeng Pharmacy Jinjiang Store",
        zhName: "益丰大药房锦江店",
        levelEn: "Retail pharmacy",
        levelZh: "连锁药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "1.0 km",
        travelEn: "About 12 minutes on foot",
        travelZh: "步行约12分钟",
        nextSlotEn: "Today until 21:30",
        nextSlotZh: "今天21:30前"
      }
    ]
  },
  Shanghai: {
    enCity: "Shanghai",
    zhCity: "上海",
    routeStartEn: "Near People's Square, Huangpu District, Shanghai",
    routeStartZh: "上海市黄浦区人民广场附近",
    routeRoadsEn: ["Renmin Ave", "Xizang M Rd", "Ruijin 2nd Rd"],
    routeRoadsZh: ["人民大道", "西藏中路", "瑞金二路"],
    routeAdviceEn: "Take a taxi via Renmin Avenue and Ruijin 2nd Road to Ruijin Hospital emergency entrance.",
    routeAdviceZh: "建议打车前往，沿人民大道、西藏中路、瑞金二路到瑞金医院急诊入口。",
    distributorEn: "Shanghai Verified Medical Distributor",
    distributorZh: "上海合规医药配送中心",
    facilities: {
      primary: {
        enName: "Shanghai Huangpu Ruijin 2nd Road Community Health Service Center",
        zhName: "上海市黄浦区瑞金二路街道社区卫生服务中心",
        enAddress: "Near Ruijin 2nd Road, Huangpu District, Shanghai",
        zhAddress: "上海市黄浦区瑞金二路附近",
        phone: "021-6386-4080",
        distance: "1.4 km",
        enTravel: "about 5 minutes by taxi",
        zhTravel: "打车约5分钟"
      },
      secondary: {
        enName: "Shanghai Huangpu District Central Hospital",
        zhName: "上海市黄浦区中心医院",
        enAddress: "No. 109 Sichuan Middle Road, Huangpu District, Shanghai",
        zhAddress: "上海市黄浦区四川中路109号",
        phone: "021-6321-2487",
        distance: "1.6 km",
        enTravel: "about 6 minutes by taxi",
        zhTravel: "打车约6分钟"
      },
      emergency: {
        enName: "Ruijin Hospital Emergency Department, Shanghai Jiao Tong University School of Medicine",
        zhName: "上海交通大学医学院附属瑞金医院急诊",
        enAddress: "No. 197 Ruijin 2nd Road, Huangpu District, Shanghai",
        zhAddress: "上海市黄浦区瑞金二路197号",
        phone: "021-64370045",
        distance: "3.2 km",
        enTravel: "about 8 minutes by taxi",
        zhTravel: "打车约8分钟"
      },
      specialist: {
        enName: "Fudan University Shanghai Cancer Center",
        zhName: "复旦大学附属肿瘤医院",
        enAddress: "No. 270 Dong'an Road, Xuhui District, Shanghai",
        zhAddress: "上海市徐汇区东安路270号",
        phone: "021-6417-5590",
        distance: "6.8 km",
        enTravel: "about 15 minutes by taxi",
        zhTravel: "打车约15分钟"
      },
      tertiary: {
        enName: "Ruijin Hospital, Shanghai Jiao Tong University School of Medicine",
        zhName: "上海交通大学医学院附属瑞金医院",
        enAddress: "No. 197 Ruijin 2nd Road, Huangpu District, Shanghai",
        zhAddress: "上海市黄浦区瑞金二路197号",
        phone: "021-64370045",
        distance: "3.2 km",
        enTravel: "about 8 minutes by taxi",
        zhTravel: "打车约8分钟"
      }
    },
    nearbyPickups: [
      {
        enName: "Sinopharm Pharmacy Huangpu Store",
        zhName: "国大药房黄浦店",
        levelEn: "Retail pharmacy",
        levelZh: "连锁药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "0.9 km",
        travelEn: "About 10 minutes on foot",
        travelZh: "步行约10分钟",
        nextSlotEn: "Today until 21:00",
        nextSlotZh: "今天21:00前"
      },
      {
        enName: "Shanghai Huangpu Community Pharmacy",
        zhName: "上海黄浦社区药房",
        levelEn: "Community pharmacy",
        levelZh: "社区药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "1.3 km",
        travelEn: "About 8 minutes by taxi",
        travelZh: "打车约8分钟",
        nextSlotEn: "Today 16:00",
        nextSlotZh: "今天16:00"
      }
    ]
  },
  Guangzhou: {
    enCity: "Guangzhou",
    zhCity: "广州",
    routeStartEn: "Near Beijing Road, Yuexiu District, Guangzhou",
    routeStartZh: "广州市越秀区北京路附近",
    routeRoadsEn: ["Zhongshan 5th Rd", "Dongfeng E Rd", "Zhongshan 2nd Rd"],
    routeRoadsZh: ["中山五路", "东风东路", "中山二路"],
    routeAdviceEn: "Take a taxi via Zhongshan 5th Road and Dongfeng East Road to the First Affiliated Hospital of Sun Yat-sen University emergency entrance.",
    routeAdviceZh: "建议打车前往，沿中山五路、东风东路到中山大学附属第一医院急诊入口。",
    distributorEn: "Guangdong Verified Medical Distributor",
    distributorZh: "广东合规医药配送中心",
    facilities: {
      primary: {
        enName: "Guangzhou Yuexiu Nonglin Community Health Service Center",
        zhName: "广州市越秀区农林街社区卫生服务中心",
        enAddress: "Nonglinxia Road area, Yuexiu District, Guangzhou",
        zhAddress: "广州市越秀区农林下路附近",
        phone: "020-8760-1000",
        distance: "1.0 km",
        enTravel: "about 5 minutes by taxi",
        zhTravel: "打车约5分钟"
      },
      secondary: {
        enName: "Guangzhou Yuexiu District Hospital of Traditional Chinese Medicine",
        zhName: "广州市越秀区中医医院",
        enAddress: "No. 6 Zhengnan Road, Yuexiu District, Guangzhou",
        zhAddress: "广州市越秀区正南路6号",
        phone: "020-8333-0808",
        distance: "1.8 km",
        enTravel: "about 6 minutes by taxi",
        zhTravel: "打车约6分钟"
      },
      emergency: {
        enName: "The First Affiliated Hospital, Sun Yat-sen University Emergency Department",
        zhName: "中山大学附属第一医院急诊",
        enAddress: "No. 58 Zhongshan 2nd Road, Yuexiu District, Guangzhou",
        zhAddress: "广州市越秀区中山二路58号",
        phone: "020-87755766",
        distance: "4.9 km",
        enTravel: "about 12 minutes by taxi",
        zhTravel: "打车约12分钟"
      },
      specialist: {
        enName: "Sun Yat-sen University Cancer Center",
        zhName: "中山大学肿瘤防治中心",
        enAddress: "No. 651 Dongfeng East Road, Yuexiu District, Guangzhou",
        zhAddress: "广州市越秀区东风东路651号",
        phone: "020-8734-3000",
        distance: "6.2 km",
        enTravel: "about 15 minutes by taxi",
        zhTravel: "打车约15分钟"
      },
      tertiary: {
        enName: "The First Affiliated Hospital, Sun Yat-sen University",
        zhName: "中山大学附属第一医院",
        enAddress: "No. 58 Zhongshan 2nd Road, Yuexiu District, Guangzhou",
        zhAddress: "广州市越秀区中山二路58号",
        phone: "020-87755766",
        distance: "4.9 km",
        enTravel: "about 12 minutes by taxi",
        zhTravel: "打车约12分钟"
      }
    },
    nearbyPickups: [
      {
        enName: "DaShenLin Pharmacy Yuexiu Store",
        zhName: "大参林药房越秀店",
        levelEn: "Retail pharmacy",
        levelZh: "连锁药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "0.7 km",
        travelEn: "About 8 minutes on foot",
        travelZh: "步行约8分钟",
        nextSlotEn: "Today until 22:00",
        nextSlotZh: "今天22:00前"
      },
      {
        enName: "Guangzhou Yuexiu Community Pharmacy",
        zhName: "广州越秀社区药房",
        levelEn: "Community pharmacy",
        levelZh: "社区药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "1.1 km",
        travelEn: "About 10 minutes by taxi",
        travelZh: "打车约10分钟",
        nextSlotEn: "Today 15:50",
        nextSlotZh: "今天15:50"
      }
    ]
  },
  Shenzhen: {
    enCity: "Shenzhen",
    zhCity: "深圳",
    routeStartEn: "Near Convention and Exhibition Center, Futian District, Shenzhen",
    routeStartZh: "深圳市福田区会展中心附近",
    routeRoadsEn: ["Shennan Ave", "Hongli Rd", "Dongmen N Rd"],
    routeRoadsZh: ["深南大道", "红荔路", "东门北路"],
    routeAdviceEn: "Take a taxi via Shennan Avenue and Hongli Road to Shenzhen People's Hospital emergency entrance.",
    routeAdviceZh: "建议打车前往，沿深南大道、红荔路到深圳市人民医院急诊入口。",
    distributorEn: "Shenzhen Verified Medical Distributor",
    distributorZh: "深圳合规医药配送中心",
    facilities: {
      primary: {
        enName: "Shenzhen Futian Community Health Service Center",
        zhName: "深圳市福田区社区健康服务中心",
        enAddress: "Near Fuhua Road, Futian District, Shenzhen",
        zhAddress: "深圳市福田区福华路附近",
        phone: "0755-8320-1000",
        distance: "1.3 km",
        enTravel: "about 5 minutes by taxi",
        zhTravel: "打车约5分钟"
      },
      secondary: {
        enName: "Shenzhen Futian District Second People's Hospital",
        zhName: "深圳市福田区第二人民医院",
        enAddress: "No. 27 Zhongkang Road, Futian District, Shenzhen",
        zhAddress: "深圳市福田区中康路27号",
        phone: "0755-8311-0237",
        distance: "3.0 km",
        enTravel: "about 8 minutes by taxi",
        zhTravel: "打车约8分钟"
      },
      emergency: {
        enName: "Shenzhen People's Hospital Emergency Department",
        zhName: "深圳市人民医院急诊",
        enAddress: "No. 1017 Dongmen North Road, Luohu District, Shenzhen",
        zhAddress: "深圳市罗湖区东门北路1017号",
        phone: "0755-25533018",
        distance: "5.4 km",
        enTravel: "about 12 minutes by taxi",
        zhTravel: "打车约12分钟"
      },
      specialist: {
        enName: "Cancer Hospital Chinese Academy of Medical Sciences, Shenzhen Center",
        zhName: "中国医学科学院肿瘤医院深圳医院",
        enAddress: "No. 113 Baohuan Avenue, Longgang District, Shenzhen",
        zhAddress: "深圳市龙岗区宝荷大道113号",
        phone: "0755-6661-8168",
        distance: "12.6 km",
        enTravel: "about 23 minutes by taxi",
        zhTravel: "打车约23分钟"
      },
      tertiary: {
        enName: "Shenzhen People's Hospital",
        zhName: "深圳市人民医院",
        enAddress: "No. 1017 Dongmen North Road, Luohu District, Shenzhen",
        zhAddress: "深圳市罗湖区东门北路1017号",
        phone: "0755-25533018",
        distance: "5.4 km",
        enTravel: "about 12 minutes by taxi",
        zhTravel: "打车约12分钟"
      }
    },
    nearbyPickups: [
      {
        enName: "Nepstar Pharmacy Futian Store",
        zhName: "海王星辰福田店",
        levelEn: "Retail pharmacy",
        levelZh: "连锁药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "0.8 km",
        travelEn: "About 9 minutes on foot",
        travelZh: "步行约9分钟",
        nextSlotEn: "Today until 22:30",
        nextSlotZh: "今天22:30前"
      },
      {
        enName: "Shenzhen Futian Community Pharmacy",
        zhName: "深圳福田社区药房",
        levelEn: "Community pharmacy",
        levelZh: "社区药房",
        typeEn: "Pharmacy",
        typeZh: "药房",
        distance: "1.2 km",
        travelEn: "About 10 minutes by taxi",
        travelZh: "打车约10分钟",
        nextSlotEn: "Today 15:30",
        nextSlotZh: "今天15:30"
      }
    ]
  }
};

const patientCopy = {
  zh: {
    pageEyebrow: "患者服务",
    pageTitle: "MedLink 就诊助手",
    pageDescription: "按步骤选择档案、共享必要记录、描述症状，并获得清晰的就诊和取药建议。",
    stepCounter: "第",
    stepOf: "步 / 共 7 步",
    stepLabels: ["选择档案", "共享病历", "描述症状", "查看建议", "就诊计划", "找药取药", "准备完成"],
    step: "步骤",
    back: "返回",
    next: "下一步",
    step1Title: "今天为谁办理就诊？",
    step1Desc: "请选择本人或已授权家人的档案。",
    selfCheckIn: "为我自己办理",
    familyCheckIn: "我在帮家人办理",
    familySubLabel: "适用于需要协助的年长父母或儿童",
    primaryAccountHolder: "主账号持有人",
    familyCareMode: "家庭照护模式",
    familyAccessNote: "您可以代表已授权的家人管理健康记录。",
    age: "年龄",
    condition: "健康情况",
    allergy: "过敏史",
    recent: "近期记录",
    healthId: "MedLink 健康 ID",
    healthIdValue: "ML-2038-8841",
    verified: "已确认",
    recordsSecure: "您的记录已安全保存",
    recordSharing: "记录共享",
    off: "关闭",
    connectedHospitals: "已连接医院",
    step2Title: "准备您的病历",
    step2Desc: "先选择本次就诊可能需要用到的记录，稍后系统推荐医院后再决定是否共享给医生。",
    sharePanelTitle: "准备哪些健康记录？",
    shareFor: "共享时长",
    prepareRecordsExplanation: "您选择的记录将由 MedLink 用于帮助找到合适的就诊方案。系统建议诊所或医院后，您可以再决定是否直接共享给他们。",
    confirmSharing: "准备我的病历",
    sharingStatus: "准备状态",
    sharingPrompt: "选择记录类型和时长后，点击按钮准备记录。",
    sharingSuccess: "您的病历已准备好。MedLink 将使用这些信息为您寻找合适的就诊方案。",
    savingChoice: "正在保存您的选择...",
    confirmingViewer: "正在整理记录摘要...",
    protectingRecords: "正在保护您的记录...",
    sharingReady: "记录已准备好。",
    step3Title: "描述您的症状",
    step3Desc: "请用自己的话描述哪里不舒服，也可以直接点选一个示例。",
    symptomPlaceholder: "请描述您的症状，例如发烧几天、是否胸痛、是否需要续药...",
    symptomLabel: "哪里不舒服？",
    symptomExamplesTitle: "常见示例",
    symptomExamplesDesc: "可按轻重程度点选一个示例，也可以直接输入自己的具体症状。",
    symptomDuration: "症状持续了多久？",
    severity: "感觉有多严重？",
    location: "所在城市",
    redFlagChecks: "是否有这些情况？",
    breathing: "呼吸困难吗？",
    chestPain: "有胸痛吗？",
    neurological: "有头晕、手脚麻木或说话困难吗？",
    step4Title: "查看症状建议",
    step4Desc: "系统会根据您描述的情况，给出下一步就医建议。",
    checkSymptoms: "帮我看看该去哪",
    checkPrompt: "输入症状后，点击按钮查看建议。",
    checkingRecords: "正在读取您准备的病历摘要...",
    analyzingSymptoms: "结合症状和病史进行比对...",
    findingHospital: "查询医院号源、等待时间和床位...",
    ready: "已生成推荐",
    resultTitle: "建议结果",
    lowSignal: "可以先去社区医院",
    mediumSignal: "建议今天就诊",
    highSignal: "请尽快前往急诊",
    specialistSignal: "建议预约专科医院",
    possibleRespiratory: "您的症状可能与呼吸道感染有关",
    possibleDiabetes: "您可能需要进行慢病复诊和续药",
    possibleSpecialist: "您的用药需要专科医生确认",
    possibleGeneral: "您的症状适合先进行普通门诊评估",
    possibleDigestive: "您的症状可能与肠胃不适有关，建议今天就诊评估",
    possibleSkin: "您的症状可能与皮肤或过敏反应有关",
    possibleMuscleBone: "您的症状可能与扭伤或肌肉骨骼不适有关",
    possibleUrinary: "您的症状可能与尿路感染有关，建议今天做化验评估",
    recommendedHospital: "建议前往",
    department: "挂号科室",
    slots: "今日剩余号源",
    viewHospital: "查看医院详情 →",
    hideHospital: "收起医院详情",
    hospitalDetailsTitle: "医院详情",
    whyThisHospital: "为什么推荐这里",
    hospitalAddressLabel: "地址",
    hospitalPhoneLabel: "电话",
    routeTimeLabel: "路程",
    registrationLabel: "就诊安排",
    serviceLabel: "可提供帮助",
    preparationLabel: "到院前准备",
    recommendationLogicTitle: "推荐依据",
    recommendationLogicDesc: "系统已结合您描述的症状、准备的病史、当前号源、等待时间和接诊能力进行推荐。",
    availabilityTitle: "医院可用情况",
    waitTimeLabel: "预计等待",
    doctorScheduleLabel: "医生排班",
    bedStatusLabel: "床位 / 接诊能力",
    availableDoctorsTitle: "推荐可接诊医生",
    doctorOptionsHint: "以下医生当前有可预约或可接诊时间，实际接诊以医院现场安排为准。",
    emergencyCareTitle: "急诊接诊安排",
    emergencyCareHint: "急诊不是普通预约挂号。到院后请先到急诊分诊台，由分诊人员判断病情轻重，再安排合适的急诊医生接诊。以下时间会根据当前急诊接诊能力估算。",
    emergencyAlert: "您的症状需要立即就医，请前往最近的急诊室",
    nearestEmergency: "最近急诊：华西医院急诊 · 距您7.4公里",
    navigate: "导航前往 →",
    routeDemoTitle: "路线预览",
    routeDemoDesc: "已为您生成前往急诊的演示路线。请优先确保安全，症状明显加重时直接拨打120。",
    routeStart: "当前位置",
    routeStartValue: "成都市锦江区春熙路附近",
    routeDestination: "目的地",
    routeEta: "预计时间",
    routeDistance: "距离",
    routeAdvice: "建议路线",
    routeAdviceValue: "建议打车前往，沿蜀都大道、人民南路到华西医院急诊入口。",
    routeOpenMap: "已生成地图路线",
    routeCallHospital: "华西医院急诊电话：028-8542-2114",
    disclaimer: "以上建议仅供参考，不构成医疗诊断。如有疑虑请直接拨打120。",
    hospitalShareTitle: "是否共享病历给这家医院？",
    hospitalShareDescription: "{hospital} 的医生可以在就诊前查看您选择的记录。无需携带纸质病历。",
    hospitalShareYes: "是，共享给 {hospital}",
    hospitalShareLater: "我稍后决定",
    hospitalShareWorking: "正在共享记录...",
    hospitalShareSuccess: "病历已共享给 {hospital} ✓",
    hospitalShareLaterNote: "到达诊所前台时，您也可以再共享病历。",
    step5Title: "您的就诊计划",
    step5Desc: "把接下来要做的事整理成一个清楚的行动清单。",
    goToday: "今天前往",
    address: "地址：锦江区XX路XX号 · 步行约15分钟",
    visitArranged: "已为您安排本次就诊",
    appointmentReady: "已帮您预留号源",
    clinicNotified: "已通知接诊点",
    departInstruction: "建议出发时间",
    arrivalInstruction: "到达后安排",
    noPaper: "就诊时无需带纸质病历",
    doctorCanSee: "医生可以直接看到您的健康记录",
    bringSummary: "请携带病历摘要，或到达诊所前台后再共享您的记录",
    followUp: "如果5天后没有好转",
    autoEscalate: "系统会自动帮您联系上级医院",
    followUpPrompt: "点开查看可能的后续治疗安排",
    viewFollowUpPlan: "查看后续治疗详情",
    hideFollowUpPlan: "收起后续治疗详情",
    followUpPlanTitle: "可能的后续治疗方案",
    followUpHospitalLabel: "可能转诊医院",
    followUpDepartmentLabel: "建议科室",
    followUpSupportLabel: "MedLink可以帮您做什么",
    followUpWhenLabel: "什么时候需要升级就诊",
    followUpNotice: "这只是提前准备的方案，不代表病情一定会变重。若出现明显胸闷、呼吸困难或持续高热，请直接拨打120。",
    voucher: "就诊凭证",
    voucherNumber: "凭证编号",
    validTime: "有效期",
    qrPlaceholder: "扫码出示",
    step6Title: "在哪里取药？",
    step6Desc: "就诊后收到医院回馈，再根据处方内容查找附近可取药的医院或药房。",
    prescriptionFeedbackTitle: "已收到医院回馈",
    prescriptionFeedbackDesc: "医生已确认本次需要取药的内容。下面会先看就诊医院是否可取，再列出附近备选地点。",
    issuedBy: "回馈来源",
    medicineList: "本次取药内容",
    dosageNote: "请按医生处方和药师说明使用；如有过敏史，请取药时再次告知药师。",
    currentHospitalPickup: "本院取药情况",
    currentHospitalHasStock: "就诊医院可直接取药",
    currentHospitalNoStock: "就诊医院暂缺，已为您按距离查找附近可取地点",
    nearbyPickupOptions: "附近可取药地点",
    sortedByDistance: "已按距离从近到远排序",
    pickupType: "地点类型",
    estimatedTravel: "预计路程",
    hasStock: "有药 ✓",
    lowStock: "库存紧张",
    canDispense: "可凭本次处方取药 ✓",
    canPrescribe: "可以开具这个处方 ✓",
    needsReferral: "需要转诊至上级医院",
    nextAvailable: "可预约时间",
    chooseThis: "选择这家",
    checkMedicine: "查看药品来源",
    medicineVerified: "这批药品来源可靠，已通过验证",
    manufacturer: "生产企业",
    checkedDate: "验证日期",
    close: "关闭",
    step7Title: "就诊准备完成 ✓",
    step7Desc: "您的就诊计划已经整理好，可以按下面的清单出发。",
    selectedProfile: "患者档案",
    appointment: "预约时间",
    appointmentPending: "尚未选择",
    medicines: "取药内容",
    pickupPlace: "取药地点",
    voucherReady: "您的就诊凭证已生成",
    sharingCloses: "您的记录共享将在",
    sharingClosesSuffix: "后自动关闭",
    savePlan: "保存就诊计划",
    planSaved: "已保存",
    planSavedNote: "就诊计划已保存，您可以随时回来查看。",
    shareFamily: "分享给家人",
    shareFamilyTitle: "分享给家人",
    shareFamilyDesc: "可以把就诊时间、地点和取药安排发给家人，方便他们陪同或接送。",
    shareViaWechat: "微信发送",
    shareViaSms: "短信发送",
    copyShareLink: "复制链接",
    shareQrTitle: "家人扫码查看",
    shareLinkReady: "分享链接已准备好",
    restart: "重新开始",
    reassurance: "您的健康数据始终由您掌控。MedLink不会在未经您同意的情况下共享您的任何信息。"
  },
  en: {
    pageEyebrow: "Patient Care",
    pageTitle: "MedLink Care Assistant",
    pageDescription: "Choose a profile, share only the records needed, describe symptoms, and get a clear care plan.",
    stepCounter: "Step",
    stepOf: "of 7",
    stepLabels: ["Select Profile", "Share Records", "Describe Symptoms", "Check Symptoms", "Care Plan", "Find Medicine", "All Set"],
    step: "Step",
    back: "Back",
    next: "Next",
    step1Title: "Who are you checking in for today?",
    step1Desc: "Choose whether this visit is for you or an authorized family member.",
    selfCheckIn: "I'm checking in for myself",
    familyCheckIn: "I'm helping a family member",
    familySubLabel: "For elderly parents or children who need assistance",
    primaryAccountHolder: "Primary Account Holder",
    familyCareMode: "Family Care Mode",
    familyAccessNote: "You can manage records on behalf of family members who have granted you access.",
    age: "Age",
    condition: "Health condition",
    allergy: "Allergy",
    recent: "Recent records",
    healthId: "MedLink Health ID",
    healthIdValue: "ML-2038-8841",
    verified: "Verified",
    recordsSecure: "Your records are securely stored",
    recordSharing: "Record sharing",
    off: "Off",
    connectedHospitals: "Connected hospitals",
    step2Title: "Prepare Your Records",
    step2Desc: "Choose the records MedLink can review first. After we suggest a clinic or hospital, you can decide whether to share records with them directly.",
    sharePanelTitle: "Which records should we prepare?",
    shareFor: "Share for",
    prepareRecordsExplanation: "Your selected records will be reviewed by MedLink to help find the right care for you. After we suggest a clinic or hospital, you can choose whether to share your records with them directly.",
    confirmSharing: "Prepare My Records",
    sharingStatus: "Preparation status",
    sharingPrompt: "Choose record types and a duration, then prepare your records.",
    sharingSuccess: "Your records are ready. MedLink will use these to find the right care for you.",
    savingChoice: "Saving your choice...",
    confirmingViewer: "Preparing your record summary...",
    protectingRecords: "Protecting your records...",
    sharingReady: "Records are ready.",
    step3Title: "Describe Your Symptoms",
    step3Desc: "Describe how you feel, or pick a sample symptom.",
    symptomPlaceholder: "Describe your symptoms, such as fever duration, chest pain, or medicine refill needs...",
    symptomLabel: "What feels wrong?",
    symptomExamplesTitle: "Common examples",
    symptomExamplesDesc: "Choose an example by severity, or type your own specific symptoms.",
    symptomDuration: "How long has this lasted?",
    severity: "How severe does it feel?",
    location: "City",
    redFlagChecks: "Do any of these apply?",
    breathing: "Breathing difficulty?",
    chestPain: "Chest pain?",
    neurological: "Dizziness, numbness, or speech difficulty?",
    step4Title: "Check Your Symptoms",
    step4Desc: "The system checks your symptoms and suggests where to go next.",
    checkSymptoms: "Help me decide where to go",
    checkPrompt: "Enter symptoms, then check your recommendation.",
    checkingRecords: "Reading your prepared record summary...",
    analyzingSymptoms: "Cross-checking symptoms with your health record...",
    findingHospital: "Checking slots, wait times, and bed readiness...",
    ready: "Recommendation ready",
    resultTitle: "Recommendation",
    lowSignal: "Start with community care",
    mediumSignal: "Visit a clinic today",
    highSignal: "Go to emergency care now",
    specialistSignal: "Book a specialist hospital",
    possibleRespiratory: "Your symptoms may be related to a respiratory infection",
    possibleDiabetes: "You may need chronic-care follow-up and medicine refill",
    possibleSpecialist: "Your medicine request needs specialist confirmation",
    possibleGeneral: "A general outpatient visit is suitable for these symptoms",
    possibleDigestive: "Your symptoms may be related to digestive discomfort and should be checked today",
    possibleSkin: "Your symptoms may be related to skin irritation or an allergic reaction",
    possibleMuscleBone: "Your symptoms may be related to a sprain or muscle and joint discomfort",
    possibleUrinary: "Your symptoms may be related to a urinary tract infection and should be checked today",
    recommendedHospital: "Recommended place",
    department: "Department",
    slots: "Available slots today",
    viewHospital: "View hospital details →",
    hideHospital: "Hide hospital details",
    hospitalDetailsTitle: "Hospital details",
    whyThisHospital: "Why this place",
    hospitalAddressLabel: "Address",
    hospitalPhoneLabel: "Phone",
    routeTimeLabel: "Travel time",
    registrationLabel: "Visit arrangement",
    serviceLabel: "Available support",
    preparationLabel: "Before you go",
    recommendationLogicTitle: "Why this recommendation",
    recommendationLogicDesc: "MedLink compared your symptoms, prepared records, appointment availability, wait times, and care capacity before suggesting this option.",
    availabilityTitle: "Hospital availability",
    waitTimeLabel: "Estimated wait",
    doctorScheduleLabel: "Doctor schedule",
    bedStatusLabel: "Bed / care capacity",
    availableDoctorsTitle: "Recommended clinicians",
    doctorOptionsHint: "These clinicians currently have appointment or visit availability. The hospital may still adjust the final assignment.",
    emergencyCareTitle: "Emergency Care Pathway",
    emergencyCareHint: "For emergency care, this is not a scheduled clinic appointment. After arrival, check in at the emergency triage desk first; the triage team assesses urgency and assigns the next appropriate emergency clinician. The times below are estimates based on current emergency department capacity.",
    emergencyAlert: "Your symptoms need immediate medical attention. Please go to the nearest emergency room.",
    nearestEmergency: "Nearest emergency: West China Hospital ER · 7.4 km away",
    navigate: "Navigate →",
    routeDemoTitle: "Route preview",
    routeDemoDesc: "A demo route to emergency care is ready. Please prioritize safety and call emergency services if symptoms worsen.",
    routeStart: "Current location",
    routeStartValue: "Near Chunxi Road, Jinjiang District, Chengdu",
    routeDestination: "Destination",
    routeEta: "Estimated time",
    routeDistance: "Distance",
    routeAdvice: "Suggested route",
    routeAdviceValue: "Take a taxi via Shudu Avenue and Renmin South Road to the West China Hospital emergency entrance.",
    routeOpenMap: "Map route ready",
    routeCallHospital: "West China Hospital ER: 028-8542-2114",
    disclaimer: "This suggestion is for reference only and is not a medical diagnosis. If in doubt, call emergency services.",
    hospitalShareTitle: "Share your records with this hospital?",
    hospitalShareDescription: "The doctor at {hospital} will be able to view your selected records before your appointment. No paper records needed.",
    hospitalShareYes: "Yes, share my records with {hospital}",
    hospitalShareLater: "I'll decide later",
    hospitalShareWorking: "Sharing records...",
    hospitalShareSuccess: "Records shared with {hospital} ✓",
    hospitalShareLaterNote: "You can share your records at the clinic reception when you arrive.",
    step5Title: "Your Care Plan",
    step5Desc: "A simple action list for what to do next.",
    goToday: "Go today",
    address: "Address: Jinjiang District XX Road · about 15 minutes on foot",
    visitArranged: "Your visit has been arranged",
    appointmentReady: "Appointment slot reserved",
    clinicNotified: "Care team notified",
    departInstruction: "When to leave",
    arrivalInstruction: "When you arrive",
    noPaper: "No paper records needed",
    doctorCanSee: "The doctor can view your health records directly",
    bringSummary: "Bring a summary to your appointment, or share your records at the clinic reception",
    followUp: "If you do not improve after 5 days",
    autoEscalate: "The system can help connect you with a higher-level hospital",
    followUpPrompt: "Tap to see a possible next-care plan",
    viewFollowUpPlan: "View follow-up details",
    hideFollowUpPlan: "Hide follow-up details",
    followUpPlanTitle: "Possible follow-up plan",
    followUpHospitalLabel: "Possible referral hospital",
    followUpDepartmentLabel: "Suggested department",
    followUpSupportLabel: "How MedLink can help",
    followUpWhenLabel: "When to seek higher-level care",
    followUpNotice: "This is a preparation plan only. It does not mean your symptoms will get worse. If you develop severe chest tightness, breathing difficulty, or persistent high fever, call emergency services.",
    voucher: "Visit Pass",
    voucherNumber: "Voucher number",
    validTime: "Valid for",
    qrPlaceholder: "Show QR",
    step6Title: "Where to Pick Up Medicine?",
    step6Desc: "After the visit, hospital feedback confirms what to pick up. Then MedLink checks the hospital pharmacy and nearby pickup options.",
    prescriptionFeedbackTitle: "Hospital feedback received",
    prescriptionFeedbackDesc: "The doctor has confirmed the medicine for this visit. We first check whether the visit hospital can dispense it, then list nearby backup options.",
    issuedBy: "Feedback from",
    medicineList: "Medicine to pick up",
    dosageNote: "Use the medicine as prescribed by the doctor and explained by the pharmacist. Please remind the pharmacist about any allergies.",
    currentHospitalPickup: "Pickup at visit hospital",
    currentHospitalHasStock: "Available at the visit hospital",
    currentHospitalNoStock: "Not available at the visit hospital. Nearby options are sorted below.",
    nearbyPickupOptions: "Nearby pickup options",
    sortedByDistance: "Sorted by distance",
    pickupType: "Place type",
    estimatedTravel: "Estimated travel",
    hasStock: "In stock ✓",
    lowStock: "Low stock",
    canDispense: "Can dispense this prescription ✓",
    canPrescribe: "Can issue this prescription ✓",
    needsReferral: "Needs higher-level referral",
    nextAvailable: "Next available time",
    chooseThis: "Choose this place",
    checkMedicine: "Check medicine source",
    medicineVerified: "This medicine batch is from a reliable source and has passed verification",
    manufacturer: "Manufacturer",
    checkedDate: "Checked date",
    close: "Close",
    step7Title: "You’re All Set ✓",
    step7Desc: "Your care plan is ready.",
    selectedProfile: "Selected profile",
    appointment: "Appointment time",
    appointmentPending: "Not selected yet",
    medicines: "Medicine to pick up",
    pickupPlace: "Pickup place",
    voucherReady: "Your visit pass has been generated",
    sharingCloses: "Record sharing will turn off after",
    sharingClosesSuffix: "",
    savePlan: "Save care plan",
    planSaved: "Saved",
    planSavedNote: "Your care plan has been saved. You can come back to view it anytime.",
    shareFamily: "Share with family",
    shareFamilyTitle: "Share with family",
    shareFamilyDesc: "Send the visit time, location, and medicine pickup plan so family can accompany you or help with transport.",
    shareViaWechat: "Send by WeChat",
    shareViaSms: "Send by SMS",
    copyShareLink: "Copy link",
    shareQrTitle: "Family can scan",
    shareLinkReady: "Share link ready",
    restart: "Start over",
    reassurance: "Your health data is always controlled by you. MedLink will not share your information without your consent."
  }
};

type PatientCopy = typeof patientCopy.en;

const patientKoreanCopy: Partial<PatientCopy> = {
  pageEyebrow: "환자 서비스",
  pageTitle: "MedLink 진료 도우미",
  pageDescription: "프로필을 선택하고 필요한 기록만 준비한 뒤 증상을 입력하면 명확한 진료 및 약 수령 계획을 받을 수 있습니다.",
  stepCounter: "단계",
  stepOf: "/ 총 7단계",
  stepLabels: ["프로필 선택", "기록 준비", "증상 설명", "증상 확인", "진료 계획", "약 찾기", "준비 완료"],
  step: "단계",
  back: "뒤로",
  next: "다음",
  step1Title: "오늘 누구의 진료를 준비하시나요?",
  step1Desc: "본인 또는 승인된 가족 구성원의 프로필을 선택하세요.",
  selfCheckIn: "본인 진료입니다",
  familyCheckIn: "가족을 대신해 도와드립니다",
  familySubLabel: "도움이 필요한 부모님이나 자녀를 위한 모드",
  primaryAccountHolder: "주 계정 보유자",
  familyCareMode: "가족 케어 모드",
  familyAccessNote: "접근 권한을 부여한 가족 구성원의 기록을 대신 관리할 수 있습니다.",
  age: "나이",
  condition: "건강 상태",
  allergy: "알레르기",
  recent: "최근 기록",
  healthId: "MedLink 건강 ID",
  healthIdValue: "ML-2038-8841",
  verified: "확인됨",
  recordsSecure: "기록이 안전하게 보관되어 있습니다",
  recordSharing: "기록 공유",
  off: "꺼짐",
  connectedHospitals: "연결된 병원",
  step2Title: "기록 준비",
  step2Desc: "MedLink가 먼저 검토할 기록을 선택하세요. 병원이나 의원을 추천받은 뒤 해당 기관에 직접 공유할지 결정할 수 있습니다.",
  sharePanelTitle: "어떤 건강 기록을 준비할까요?",
  shareFor: "공유 기간",
  prepareRecordsExplanation: "선택한 기록은 적절한 진료 장소를 찾는 데 사용됩니다. 병원 추천 후 해당 병원에 직접 공유할지는 다시 선택할 수 있습니다.",
  confirmSharing: "내 기록 준비하기",
  sharingStatus: "준비 상태",
  sharingPrompt: "기록 종류와 기간을 선택한 뒤 기록을 준비하세요.",
  sharingSuccess: "기록이 준비되었습니다. MedLink가 이를 바탕으로 적절한 진료 경로를 찾습니다.",
  savingChoice: "선택 사항 저장 중...",
  confirmingViewer: "기록 요약 준비 중...",
  protectingRecords: "기록 보호 처리 중...",
  sharingReady: "기록 준비 완료",
  step3Title: "증상 설명",
  step3Desc: "어디가 불편한지 직접 적거나 예시 증상을 선택하세요.",
  symptomPlaceholder: "예: 며칠째 열이 나는지, 흉통이 있는지, 약을 다시 받아야 하는지 등을 적어 주세요...",
  symptomLabel: "어디가 불편한가요?",
  symptomExamplesTitle: "자주 쓰는 예시",
  symptomExamplesDesc: "증상 정도별 예시를 선택하거나 본인의 구체적인 증상을 직접 입력할 수 있습니다.",
  symptomDuration: "증상이 얼마나 지속되었나요?",
  severity: "얼마나 심한가요?",
  location: "도시",
  redFlagChecks: "다음 증상이 있나요?",
  breathing: "호흡이 어렵나요?",
  chestPain: "가슴 통증이 있나요?",
  neurological: "어지럼, 손발 저림, 말이 어눌한 증상이 있나요?",
  step4Title: "증상 확인",
  step4Desc: "입력한 증상을 바탕으로 다음 진료 장소를 추천합니다.",
  checkSymptoms: "어디로 가야 할지 확인하기",
  checkPrompt: "증상을 입력한 뒤 추천을 확인하세요.",
  checkingRecords: "준비된 기록 요약을 확인 중...",
  analyzingSymptoms: "증상과 병력을 교차 확인 중...",
  findingHospital: "병원 예약 가능 여부, 대기 시간, 병상 여유 확인 중...",
  ready: "추천 생성 완료",
  resultTitle: "추천 결과",
  lowSignal: "먼저 지역 1차 진료를 이용하세요",
  mediumSignal: "오늘 진료를 받는 것이 좋습니다",
  highSignal: "지금 응급 진료를 받으세요",
  specialistSignal: "전문 병원 예약을 권장합니다",
  possibleRespiratory: "증상이 호흡기 감염과 관련될 수 있습니다",
  possibleDiabetes: "만성질환 추적 진료와 약 처방 갱신이 필요할 수 있습니다",
  possibleSpecialist: "전문의가 약 처방을 확인해야 합니다",
  possibleGeneral: "일반 외래 진료로 먼저 평가하기에 적합합니다",
  possibleDigestive: "소화기 증상일 수 있어 오늘 진료 평가를 권장합니다",
  possibleSkin: "피부 자극 또는 알레르기 반응과 관련될 수 있습니다",
  possibleMuscleBone: "염좌 또는 근골격계 불편감과 관련될 수 있습니다",
  possibleUrinary: "요로감염과 관련될 수 있어 오늘 검사 평가를 권장합니다",
  recommendedHospital: "추천 장소",
  department: "진료과",
  slots: "오늘 가능한 예약",
  viewHospital: "병원 상세 보기 →",
  hideHospital: "병원 상세 접기",
  hospitalDetailsTitle: "병원 상세",
  whyThisHospital: "이곳을 추천한 이유",
  hospitalAddressLabel: "주소",
  hospitalPhoneLabel: "전화",
  routeTimeLabel: "이동 시간",
  registrationLabel: "진료 안내",
  serviceLabel: "제공 가능한 지원",
  preparationLabel: "방문 전 준비",
  recommendationLogicTitle: "추천 근거",
  recommendationLogicDesc: "MedLink는 증상, 준비된 기록, 예약 가능 여부, 대기 시간, 진료 역량을 함께 비교했습니다.",
  availabilityTitle: "병원 가용성",
  waitTimeLabel: "예상 대기",
  doctorScheduleLabel: "의료진 일정",
  bedStatusLabel: "병상 / 진료 수용력",
  availableDoctorsTitle: "추천 의료진",
  doctorOptionsHint: "현재 예약 또는 진료 가능 시간이 있는 의료진입니다. 최종 배정은 병원 현장 상황에 따라 조정될 수 있습니다.",
  emergencyCareTitle: "응급 진료 경로",
  emergencyCareHint: "응급 진료는 일반 외래 예약이 아닙니다. 도착 후 먼저 응급 분류 데스크에서 중증도를 평가받고, 그 결과에 따라 적절한 응급 의료진이 배정됩니다.",
  emergencyAlert: "즉시 진료가 필요한 증상입니다. 가장 가까운 응급실로 가세요.",
  nearestEmergency: "가장 가까운 응급실",
  navigate: "길찾기 →",
  routeDemoTitle: "경로 미리보기",
  routeDemoDesc: "응급 진료 장소까지의 데모 경로가 생성되었습니다. 안전을 우선하고 증상이 악화되면 응급 구조 번호로 연락하세요.",
  routeStart: "현재 위치",
  routeStartValue: "현재 위치",
  routeDestination: "목적지",
  routeEta: "예상 시간",
  routeDistance: "거리",
  routeAdvice: "추천 경로",
  routeAdviceValue: "택시 이동을 권장합니다.",
  routeOpenMap: "지도 경로 생성 완료",
  routeCallHospital: "응급실 전화",
  disclaimer: "이 추천은 참고용이며 의학적 진단이 아닙니다. 의심되거나 악화되면 즉시 응급 구조 번호로 연락하세요.",
  hospitalShareTitle: "이 병원에 기록을 공유할까요?",
  hospitalShareDescription: "{hospital}의 의사가 진료 전 선택한 기록을 확인할 수 있습니다. 종이 기록을 가져갈 필요가 없습니다.",
  hospitalShareYes: "예, {hospital}에 공유",
  hospitalShareLater: "나중에 결정",
  hospitalShareWorking: "기록 공유 중...",
  hospitalShareSuccess: "{hospital}에 기록 공유 완료 ✓",
  hospitalShareLaterNote: "도착 후 접수 데스크에서 다시 기록을 공유할 수도 있습니다.",
  step5Title: "진료 계획",
  step5Desc: "다음에 해야 할 일을 명확한 실행 목록으로 정리했습니다.",
  goToday: "오늘 방문",
  address: "주소",
  visitArranged: "이번 진료가 준비되었습니다",
  appointmentReady: "예약 가능 시간 확보됨",
  clinicNotified: "진료팀에 알림 완료",
  departInstruction: "출발 시점",
  arrivalInstruction: "도착 후 안내",
  noPaper: "종이 병력 자료 불필요",
  doctorCanSee: "의사가 건강 기록을 직접 확인할 수 있습니다",
  bringSummary: "기록 요약을 가져가거나 접수처에서 다시 공유하세요",
  followUp: "5일 후에도 좋아지지 않으면",
  autoEscalate: "상급 병원 연결을 도와드릴 수 있습니다",
  followUpPrompt: "가능한 후속 진료 계획 보기",
  viewFollowUpPlan: "후속 진료 상세 보기",
  hideFollowUpPlan: "후속 진료 상세 접기",
  followUpPlanTitle: "가능한 후속 진료 계획",
  followUpHospitalLabel: "가능한 의뢰 병원",
  followUpDepartmentLabel: "추천 진료과",
  followUpSupportLabel: "MedLink가 도울 수 있는 일",
  followUpWhenLabel: "상급 진료가 필요한 경우",
  followUpNotice: "이것은 미리 준비한 계획이며 증상이 반드시 악화된다는 뜻은 아닙니다. 심한 흉부 압박감, 호흡 곤란, 지속적인 고열이 나타나면 즉시 응급 구조 번호로 연락하세요.",
  voucher: "방문 확인증",
  voucherNumber: "확인증 번호",
  validTime: "유효 기간",
  qrPlaceholder: "QR 제시",
  step6Title: "어디에서 약을 받을까요?",
  step6Desc: "진료 후 병원 피드백으로 받을 약을 확인한 뒤, 병원 약국과 근처 수령 장소를 확인합니다.",
  prescriptionFeedbackTitle: "병원 피드백 수신",
  prescriptionFeedbackDesc: "의사가 이번 방문에 필요한 약을 확인했습니다. 먼저 방문 병원에서 수령 가능한지 확인하고 근처 대안을 보여드립니다.",
  issuedBy: "피드백 출처",
  medicineList: "수령할 약",
  dosageNote: "의사 처방과 약사 설명에 따라 복용하세요. 알레르기가 있으면 약사에게 다시 알려 주세요.",
  currentHospitalPickup: "방문 병원 약국",
  currentHospitalHasStock: "방문 병원에서 바로 수령 가능",
  currentHospitalNoStock: "방문 병원에 재고가 없어 근처 대안을 거리순으로 정리했습니다.",
  nearbyPickupOptions: "근처 수령 가능 장소",
  sortedByDistance: "거리순 정렬",
  pickupType: "장소 유형",
  estimatedTravel: "예상 이동",
  hasStock: "재고 있음 ✓",
  lowStock: "재고 부족",
  canDispense: "이 처방으로 조제 가능 ✓",
  canPrescribe: "이 처방 발행 가능 ✓",
  needsReferral: "상급 병원 의뢰 필요",
  nextAvailable: "다음 가능 시간",
  chooseThis: "이곳 선택",
  checkMedicine: "약품 출처 확인",
  medicineVerified: "이 약품 배치는 신뢰 가능한 출처이며 검증을 통과했습니다",
  manufacturer: "제조사",
  checkedDate: "확인일",
  close: "닫기",
  step7Title: "준비 완료 ✓",
  step7Desc: "진료 계획이 준비되었습니다.",
  selectedProfile: "선택한 프로필",
  appointment: "예약 시간",
  appointmentPending: "아직 선택되지 않음",
  medicines: "수령할 약",
  pickupPlace: "수령 장소",
  voucherReady: "방문 확인증이 생성되었습니다",
  sharingCloses: "기록 공유는",
  sharingClosesSuffix: "후 자동 종료됩니다",
  savePlan: "진료 계획 저장",
  planSaved: "저장됨",
  planSavedNote: "진료 계획이 저장되었습니다. 언제든 다시 확인할 수 있습니다.",
  shareFamily: "가족에게 공유",
  shareFamilyTitle: "가족에게 공유",
  shareFamilyDesc: "가족이 동행하거나 이동을 도울 수 있도록 방문 시간, 장소, 약 수령 계획을 보낼 수 있습니다.",
  shareViaWechat: "WeChat 전송",
  shareViaSms: "문자 전송",
  copyShareLink: "링크 복사",
  shareQrTitle: "가족이 스캔하여 확인",
  shareLinkReady: "공유 링크 준비 완료",
  restart: "처음부터 다시 시작",
  reassurance: "건강 데이터는 항상 본인이 통제합니다. MedLink는 동의 없이 정보를 공유하지 않습니다."
};

const symptomSampleGroups: Array<{
  id: SymptomSampleGroupId;
  zhTitle: string;
  enTitle: string;
  koTitle: string;
  zhDesc: string;
  enDesc: string;
  koDesc: string;
  samples: Array<{ zh: string; en: string; ko: string }>;
}> = [
  {
    id: "mild",
    zhTitle: "轻症示例",
    enTitle: "Mild examples",
    koTitle: "가벼운 증상 예시",
    zhDesc: "适合先去社区医院或诊所",
    enDesc: "Best handled first by a community clinic or primary care site",
    koDesc: "먼저 1차 병원 (의원, 보건소)에 적합한 경우",
    samples: [
      {
        zh: "普通感冒：流鼻涕、轻微咳嗽、没有发烧或低烧（38度以下）",
        en: "Common cold: runny nose, mild cough, no fever or low-grade fever under 38°C",
        ko: "일반 감기: 콧물, 가벼운 기침, 발열 없음 또는 미열(38도 미만)"
      },
      {
        zh: "轻微皮疹、有点痒（无扩散）",
        en: "Mild rash with slight itching, not spreading",
        ko: "가벼운 발진과 약간의 가려움(퍼지지 않음)"
      },
      {
        zh: "慢性病稳定期复诊取药（高血压、糖尿病控制良好，只是续药）",
        en: "Stable chronic disease follow-up or refill: controlled hypertension or diabetes, refill only",
        ko: "안정기 만성질환 재진 및 약 처방 갱신(고혈압·당뇨가 잘 조절되고 약만 필요)"
      },
      {
        zh: "轻微咽喉痛、无呼吸困难",
        en: "Mild sore throat, no breathing difficulty",
        ko: "가벼운 인후통, 호흡곤란 없음"
      }
    ]
  },
  {
    id: "moderate",
    zhTitle: "中症示例",
    enTitle: "Moderate examples",
    koTitle: "중간 정도 증상 예시",
    zhDesc: "建议去二级医院做当天门诊评估",
    enDesc: "Usually needs same-day assessment at a secondary hospital",
    koDesc: "2차 병원 (일반 종합병원)에서 당일 평가가 필요한 경우",
    samples: [
      {
        zh: "发烧超过38.5度持续两天以上、普通退烧药效果不好",
        en: "Fever over 38.5°C for more than two days, fever medicine not working well",
        ko: "38.5도 이상 발열이 이틀 이상 지속되고 일반 해열제 효과가 부족함"
      },
      {
        zh: "腹痛位置固定、持续加重（需要排查阑尾炎等）",
        en: "Abdominal pain in one fixed area and getting worse; appendicitis needs to be ruled out",
        ko: "복통 위치가 일정하고 계속 심해짐(충수염 등 감별 필요)"
      },
      {
        zh: "扭伤/骨折怀疑（需要X光确认）",
        en: "Possible sprain or fracture; X-ray needed",
        ko: "염좌 또는 골절 의심(X-ray 확인 필요)"
      },
      {
        zh: "尿路感染（需要化验和抗生素处方权限）",
        en: "Possible urinary tract infection; urine test and antibiotic prescription may be needed",
        ko: "요로감염 의심(소변검사와 항생제 처방 권한 필요)"
      }
    ]
  },
  {
    id: "severe",
    zhTitle: "重症或需要专科示例",
    enTitle: "Severe or specialist examples",
    koTitle: "중증 또는 전문 진료 예시",
    zhDesc: "建议前往三甲医院急诊或直接联系急救",
    enDesc: "Needs emergency care at a top-tier hospital or emergency services",
    koDesc: "3차 병원 (상급종합병원) 응급실 또는 응급 구조가 필요한 경우",
    samples: [
      {
        zh: "胸口痛+呼吸困难（怀疑心梗、肺栓塞）",
        en: "Chest pain with breathing difficulty; possible heart attack or pulmonary embolism",
        ko: "가슴 통증과 호흡곤란(심근경색 또는 폐색전증 의심)"
      },
      {
        zh: "突然头痛剧烈+说话不清/手脚麻木（怀疑中风）",
        en: "Sudden severe headache with slurred speech or limb numbness; possible stroke",
        ko: "갑작스러운 심한 두통과 말 어눌함 또는 손발 저림(뇌졸중 의심)"
      },
      {
        zh: "高烧不退超过39.5度+精神很差（怀疑脓毒症）",
        en: "Persistent fever over 39.5°C with very low energy or confusion; possible sepsis",
        ko: "39.5도 이상 고열이 지속되고 의식·활력이 매우 떨어짐(패혈증 의심)"
      },
      {
        zh: "严重过敏反应（全身皮疹+呼吸困难，怀疑过敏性休克）",
        en: "Severe allergic reaction: widespread rash with breathing difficulty; possible anaphylaxis",
        ko: "심한 알레르기 반응: 전신 발진과 호흡곤란(아나필락시스 의심)"
      }
    ]
  }
];

const legacySymptomSamples = [
  {
    zh: "流鼻涕、轻微咳嗽，没有发烧",
    en: "Runny nose and mild cough, no fever",
    ko: "콧물과 가벼운 기침, 열은 없음",
    currentZh: "普通感冒：流鼻涕、轻微咳嗽、没有发烧或低烧（38度以下）",
    currentEn: "Common cold: runny nose, mild cough, no fever or low-grade fever under 38°C",
    currentKo: "일반 감기: 콧물, 가벼운 기침, 발열 없음 또는 미열(38도 미만)"
  },
  {
    zh: "轻微皮疹，有点痒",
    en: "Mild rash with some itching",
    ko: "가벼운 발진과 약간의 가려움",
    currentZh: "轻微皮疹、有点痒（无扩散）",
    currentEn: "Mild rash with slight itching, not spreading",
    currentKo: "가벼운 발진과 약간의 가려움(퍼지지 않음)"
  },
  {
    zh: "轻微腹泻一天，没有发烧",
    en: "Mild diarrhea for one day, no fever",
    ko: "하루 정도의 가벼운 설사, 열은 없음",
    currentZh: "轻微腹泻一天，没有发烧",
    currentEn: "Mild diarrhea for one day, no fever",
    currentKo: "하루 정도의 가벼운 설사, 열은 없음"
  },
  {
    zh: "发烧咳嗽三天，有点疲劳",
    en: "Fever and cough for 3 days, mild fatigue",
    ko: "3일간 발열과 기침, 약간의 피로",
    currentZh: "发烧超过38.5度持续两天以上、普通退烧药效果不好",
    currentEn: "Fever over 38.5°C for more than two days, fever medicine not working well",
    currentKo: "38.5도 이상 발열이 이틀 이상 지속되고 일반 해열제 효과가 부족함"
  },
  {
    zh: "腹痛腹泻两天，吃东西后加重",
    en: "Abdominal pain and diarrhea for two days, worse after eating",
    ko: "이틀간 복통과 설사, 식사 후 악화",
    currentZh: "腹痛位置固定、持续加重（需要排查阑尾炎等）",
    currentEn: "Abdominal pain in one fixed area and getting worse; appendicitis needs to be ruled out",
    currentKo: "복통 위치가 일정하고 계속 심해짐(충수염 등 감별 필요)"
  },
  {
    zh: "皮疹范围变大，怀疑过敏",
    en: "Rash is spreading, possible allergy",
    ko: "발진 범위가 넓어지고 알레르기가 의심됨",
    currentZh: "皮疹范围变大，怀疑过敏",
    currentEn: "Rash is spreading, possible allergy",
    currentKo: "발진 범위가 넓어지고 알레르기가 의심됨"
  },
  {
    zh: "糖尿病复诊，需要续药",
    en: "Diabetes follow-up, medicine refill needed",
    ko: "당뇨 추적 진료와 약 처방 갱신 필요",
    currentZh: "慢性病稳定期复诊取药（高血压、糖尿病控制良好，只是续药）",
    currentEn: "Stable chronic disease follow-up or refill: controlled hypertension or diabetes, refill only",
    currentKo: "안정기 만성질환 재진 및 약 처방 갱신(고혈압·당뇨가 잘 조절되고 약만 필요)"
  },
  {
    zh: "胸口痛，呼吸困难",
    en: "Chest pain and breathing difficulty",
    ko: "가슴 통증과 호흡 곤란",
    currentZh: "胸口痛+呼吸困难（怀疑心梗、肺栓塞）",
    currentEn: "Chest pain with breathing difficulty; possible heart attack or pulmonary embolism",
    currentKo: "가슴 통증과 호흡곤란(심근경색 또는 폐색전증 의심)"
  },
  {
    zh: "突然头痛很厉害，说话有点不清楚",
    en: "Sudden severe headache with speech difficulty",
    ko: "갑작스러운 심한 두통과 말이 어눌함",
    currentZh: "突然头痛剧烈+说话不清/手脚麻木（怀疑中风）",
    currentEn: "Sudden severe headache with slurred speech or limb numbness; possible stroke",
    currentKo: "갑작스러운 심한 두통과 말 어눌함 또는 손발 저림(뇌졸중 의심)"
  },
  {
    zh: "高烧不退，精神很差",
    en: "Persistent high fever and very low energy",
    ko: "지속적인 고열과 심한 무기력",
    currentZh: "高烧不退超过39.5度+精神很差（怀疑脓毒症）",
    currentEn: "Persistent fever over 39.5°C with very low energy or confusion; possible sepsis",
    currentKo: "39.5도 이상 고열이 지속되고 의식·활력이 매우 떨어짐(패혈증 의심)"
  },
  {
    zh: "肿瘤患者需要续开靶向药",
    en: "Cancer patient needs targeted medicine refill",
    ko: "암 환자의 표적치료제 처방 갱신 필요",
    currentZh: "肿瘤患者需要续开靶向药",
    currentEn: "Cancer patient needs targeted medicine refill",
    currentKo: "암 환자의 표적치료제 처방 갱신 필요"
  }
];

const recordShareItems = [
  {
    scope: "Lab Tests",
    zhName: "血液检查结果",
    enName: "Blood Test Results",
    koName: "혈액검사 결과",
    date: "2026-04-11",
    hospital: "West China Hospital, Sichuan University"
  },
  {
    scope: "Imaging",
    zhName: "X光和影像检查",
    enName: "X-ray & Imaging",
    koName: "X-ray 및 영상검사",
    date: "2026-04-13",
    hospital: "Chengdu Jinjiang District People's Hospital"
  },
  {
    scope: "Prescription History",
    zhName: "处方记录",
    enName: "Prescription History",
    koName: "처방 기록",
    date: "2026-04-15",
    hospital: "West China Hospital, Sichuan University"
  },
  {
    scope: "Allergy Info",
    zhName: "过敏信息",
    enName: "Allergy Information",
    koName: "알레르기 정보",
    date: "2026-04-18",
    hospital: "Chengdu Jinjiang District People's Hospital"
  }
];

function findSymptomSample(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const currentSample = symptomSampleGroups
    .flatMap((group) => group.samples)
    .find((sample) => [sample.zh, sample.en, sample.ko].some((text) => text.trim() === normalized));

  if (currentSample) {
    return currentSample;
  }

  const legacySample = legacySymptomSamples.find((sample) =>
    [sample.zh, sample.en, sample.ko].some((text) => text.trim() === normalized)
  );

  if (!legacySample) {
    return undefined;
  }

  return {
    zh: legacySample.currentZh,
    en: legacySample.currentEn,
    ko: legacySample.currentKo
  };
}

function symptomTextForLanguage(value: string, english: boolean, korean = false) {
  const sample = findSymptomSample(value);
  if (!sample) {
    return value;
  }

  if (korean) {
    return sample.ko;
  }

  return english ? sample.en : sample.zh;
}

function symptomTextForAnalysis(value: string) {
  const sample = findSymptomSample(value);
  if (!sample) {
    return value;
  }

  return `${sample.zh} ${sample.en} ${sample.ko}`;
}

function sampleGuidedTriageResult(groupId: SymptomSampleGroupId, text: string): TriageResult {
  const includesAny = (terms: string[]) => terms.some((term) => text.includes(term));

  if (groupId === "severe") {
    return {
      risk: "HIGH",
      probabilities: ["Emergency pattern"],
      department: "Emergency Medicine",
      careLevel: "Emergency",
      explanation: "Immediate care is recommended.",
      redFlag: "Immediate clinical evaluation is recommended."
    };
  }

  if (groupId === "moderate") {
    if (includesAny(["urinary tract", "uti", "urine", "antibiotic", "尿路感染", "尿检", "抗生素", "요로감염", "소변검사", "항생제"])) {
      return {
        risk: "MEDIUM",
        probabilities: ["Urinary infection pathway"],
        department: "Urology / General Internal Medicine",
        careLevel: "Secondary Hospital Outpatient",
        explanation: "A secondary hospital outpatient visit can run urine tests and prescribe antibiotics if appropriate."
      };
    }

    if (includesAny(["fracture", "x-ray", "xray", "sprain", "骨折", "X光", "x光", "扭伤", "골절", "X-ray", "염좌"])) {
      return {
        risk: "MEDIUM",
        probabilities: ["Injury imaging pathway"],
        department: "Orthopedics / Rehabilitation",
        careLevel: "Secondary Hospital Outpatient",
        explanation: "A secondary hospital visit can confirm whether imaging is needed."
      };
    }

    if (includesAny(["abdominal", "appendicitis", "stomach", "腹痛", "肚子痛", "阑尾炎", "복통", "충수염"])) {
      return {
        risk: "MEDIUM",
        probabilities: ["Digestive pathway"],
        department: "Gastroenterology",
        careLevel: "Secondary Hospital Outpatient",
        explanation: "A digestive outpatient visit is recommended today."
      };
    }

    return {
      risk: "MEDIUM",
      probabilities: ["Respiratory pathway"],
      department: "Respiratory Clinic",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A secondary hospital outpatient visit is recommended today."
    };
  }

  if (includesAny(["stable chronic", "refill", "hypertension", "diabetes", "稳定期", "续药", "高血压", "糖尿病", "안정기", "처방 갱신", "고혈압", "당뇨"])) {
    return {
      risk: "LOW-MEDIUM",
      probabilities: ["Stable chronic-care pathway"],
      department: "General Practice",
      careLevel: "Primary Care Clinic",
      explanation: "A nearby primary care site can handle stable chronic-disease refills first."
    };
  }

  return {
    risk: "LOW-MEDIUM",
    probabilities: ["Mild primary-care pathway"],
    department: "General Outpatient",
    careLevel: "Primary Care Clinic",
    explanation: "A nearby community clinic can assess mild symptoms first."
  };
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function buildVoucherId() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `RV-2026-${stamp}-001`;
}

function koreanWithEnglish(korean: string, english: string) {
  void english;
  return korean;
}

function displayHospitalName(name: string, english: boolean, korean = false) {
  if (korean) {
    const map: Record<string, string> = {
      "West China Hospital, Sichuan University": koreanWithEnglish("쓰촨대학교 화시병원", "West China Hospital, Sichuan University"),
      "West China Hospital Emergency Department": koreanWithEnglish("화시병원 응급실", "West China Hospital ER"),
      "Chengdu Jinjiang District Community Health Center": koreanWithEnglish("청두 진장구 지역사회보건센터", "Chengdu Jinjiang District Community Health Center"),
      "Chengdu Jinjiang District People's Hospital": koreanWithEnglish("청두 진장구 인민병원", "Chengdu Jinjiang District People's Hospital"),
      "Sichuan Cancer Hospital": koreanWithEnglish("쓰촨성 암병원", "Sichuan Cancer Hospital"),
      "Chengdu Xinhua Primary Care Clinic Pharmacy": koreanWithEnglish("청두 신화 1차 진료소 약국", "Chengdu Xinhua Primary Care Clinic Pharmacy"),
      "Yifeng Pharmacy Jinjiang Store": koreanWithEnglish("이펑 약국 진장점", "Yifeng Pharmacy Jinjiang Store"),
      "Shanghai Huangpu Ruijin 2nd Road Community Health Service Center": koreanWithEnglish("상하이 황푸구 루이진얼루 지역사회보건센터", "Shanghai Huangpu Ruijin 2nd Road Community Health Service Center"),
      "Shanghai Huangpu District Central Hospital": koreanWithEnglish("상하이 황푸구 중심병원", "Shanghai Huangpu District Central Hospital"),
      "Ruijin Hospital Emergency Department, Shanghai Jiao Tong University School of Medicine": koreanWithEnglish("상하이교통대 의대 부속 루이진병원 응급실", "Ruijin Hospital ER"),
      "Ruijin Hospital, Shanghai Jiao Tong University School of Medicine": koreanWithEnglish("상하이교통대 의대 부속 루이진병원", "Ruijin Hospital"),
      "Fudan University Shanghai Cancer Center": koreanWithEnglish("푸단대 상하이 암센터", "Fudan University Shanghai Cancer Center"),
      "Sinopharm Pharmacy Huangpu Store": koreanWithEnglish("국대약방 황푸점", "Sinopharm Pharmacy Huangpu Store"),
      "Shanghai Huangpu Community Pharmacy": koreanWithEnglish("상하이 황푸 지역 약국", "Shanghai Huangpu Community Pharmacy"),
      "Guangzhou Yuexiu Nonglin Community Health Service Center": koreanWithEnglish("광저우 웨슈구 눙린 지역사회보건센터", "Guangzhou Yuexiu Nonglin Community Health Service Center"),
      "Guangzhou Yuexiu District Hospital of Traditional Chinese Medicine": koreanWithEnglish("광저우 웨슈구 중의병원", "Guangzhou Yuexiu District Hospital of TCM"),
      "The First Affiliated Hospital, Sun Yat-sen University Emergency Department": koreanWithEnglish("중산대 제1부속병원 응급실", "First Affiliated Hospital, Sun Yat-sen University ER"),
      "The First Affiliated Hospital, Sun Yat-sen University": koreanWithEnglish("중산대 제1부속병원", "First Affiliated Hospital, Sun Yat-sen University"),
      "Sun Yat-sen University Cancer Center": koreanWithEnglish("중산대 암센터", "Sun Yat-sen University Cancer Center"),
      "DaShenLin Pharmacy Yuexiu Store": koreanWithEnglish("다선린 약국 웨슈점", "DaShenLin Pharmacy Yuexiu Store"),
      "Guangzhou Yuexiu Community Pharmacy": koreanWithEnglish("광저우 웨슈 지역 약국", "Guangzhou Yuexiu Community Pharmacy"),
      "Shenzhen Futian Community Health Service Center": koreanWithEnglish("선전 푸톈구 지역사회보건센터", "Shenzhen Futian Community Health Service Center"),
      "Shenzhen Futian District Second People's Hospital": koreanWithEnglish("선전 푸톈구 제2인민병원", "Shenzhen Futian District Second People's Hospital"),
      "Shenzhen People's Hospital Emergency Department": koreanWithEnglish("선전시 인민병원 응급실", "Shenzhen People's Hospital ER"),
      "Shenzhen People's Hospital": koreanWithEnglish("선전시 인민병원", "Shenzhen People's Hospital"),
      "Cancer Hospital Chinese Academy of Medical Sciences, Shenzhen Center": koreanWithEnglish("중국의학과학원 암병원 선전센터", "CAMS Cancer Hospital Shenzhen Center"),
      "Nepstar Pharmacy Futian Store": koreanWithEnglish("하이왕싱천 약국 푸톈점", "Nepstar Pharmacy Futian Store"),
      "Shenzhen Futian Community Pharmacy": koreanWithEnglish("선전 푸톈 지역 약국", "Shenzhen Futian Community Pharmacy")
    };

    return map[name] ?? name;
  }

  if (english) {
    return name.replace("Community Clinic", "Primary Care Clinic");
  }

  if (name.includes("West China")) {
    return "华西医院";
  }
  if (name.includes("Jinjiang District People's")) {
    return "成都市锦江区人民医院";
  }
  if (name.includes("Second People's")) {
    return "二级医院";
  }
  if (name.includes("Jinjiang")) {
    return "成都市锦江区社区卫生服务中心";
  }
  if (name.includes("Cancer")) {
    return "四川省肿瘤医院";
  }
  if (name.includes("Xinhua")) {
    return "成都新华社区诊所";
  }

  return name;
}

function displayPatientName(patient: PatientProfile, english: boolean, korean = false) {
  if (korean) {
    const names: Record<string, string> = {
      "wang-fang": "천팡 님 (Fang Chen)",
      "wang-jianguo": "천젠궈 님 (Jianguo Chen)",
      "wang-xiaomei": "왕샤오메이 (Xiaomei Wang)"
    };
    return names[patient.id] ?? patient.name;
  }

  return english ? patient.name : patient.chineseName;
}

function displayPatientValue(value: string, english: boolean, korean = false) {
  if (korean) {
    const map: Record<string, string> = {
      Hypertension: "고혈압 (Hypertension)",
      "Hypertension (High Blood Pressure)": "고혈압 (Hypertension)",
      Diabetes: "당뇨병 (Diabetes)",
      "Type 2 diabetes": "제2형 당뇨병 (Type 2 diabetes)",
      None: "없음",
      "No chronic condition": "만성질환 없음",
      Penicillin: "페니실린 알레르기 (Penicillin allergy)",
      "Sulfa drugs": "설파제 알레르기 (Sulfa drug allergy)",
      "Dust mite allergy": "집먼지진드기 알레르기 (Dust mite allergy)",
      "Blood pressure log": "혈압 기록",
      "Amlodipine prescription": "암로디핀 처방 (Amlodipine)",
      "Allergy record": "알레르기 기록",
      "Cold medicine prescription": "감기약 처방",
      "Blood test": "혈액검사",
      "Chest X-ray": "흉부 X-ray",
      Prescription: "처방 기록",
      "HbA1c test": "당화혈색소 검사 (HbA1c)",
      "Metformin prescription": "메트포르민 처방 (Metformin)",
      "Insulin prescription": "인슐린 처방",
      "Insulin prescription history": "인슐린 처방 이력",
      "Annual checkup": "정기 건강검진",
      "Pediatric checkup": "소아 건강검진",
      "Vaccination record": "예방접종 기록",
      "Respiratory infection": "호흡기 감염",
      "Primary care": "1차 진료",
      "Retail pharmacy": "소매 약국",
      "Community pharmacy": "지역 약국",
      "Clinic pharmacy": "진료소 약국",
      Pharmacy: "약국",
      "Hospital pharmacy": "병원 약국"
    };

    return map[value] ?? value;
  }

  if (english) {
    return value;
  }

  const map: Record<string, string> = {
    Hypertension: "高血压",
    "Hypertension (High Blood Pressure)": "高血压",
    Diabetes: "糖尿病",
    "Type 2 diabetes": "2型糖尿病",
    None: "无",
    "No chronic condition": "无慢性病",
    Penicillin: "青霉素过敏",
    "Sulfa drugs": "磺胺类药物过敏",
    "Dust mite allergy": "尘螨过敏",
    "Blood pressure log": "血压记录",
    "Amlodipine prescription": "氨氯地平处方",
    "Allergy record": "过敏记录",
    "Cold medicine prescription": "感冒用药处方",
    "Blood test": "血液检查",
    "Chest X-ray": "胸部X光",
    Prescription: "处方记录",
    "HbA1c test": "糖化血红蛋白检查",
    "Metformin prescription": "二甲双胍处方",
    "Insulin prescription": "胰岛素处方",
    "Insulin prescription history": "胰岛素处方记录",
    "Annual checkup": "年度体检",
    "Pediatric checkup": "儿童保健记录",
    "Vaccination record": "疫苗接种记录",
    "Respiratory infection": "呼吸道感染"
  };

  return map[value] ?? value;
}

function durationOptions(english: boolean, korean = false): SelectOption[] {
  return [
    { value: "1 hour", label: korean ? "1시간" : english ? "1 hour" : "1小时" },
    { value: "24 hours", label: korean ? "오늘 하루" : english ? "Today only" : "今天内" },
    { value: "72 hours", label: korean ? "3일" : english ? "3 days" : "3天" }
  ];
}

function selectOptions(values: string[], labels: Record<string, string>, english: boolean, koreanLabels?: Record<string, string>): SelectOption[] {
  return values.map((value) => ({ value, label: koreanLabels?.[value] ?? (english ? value : labels[value] ?? value) }));
}

function localText(english: boolean, korean: boolean | undefined, en: string, zh: string, ko: string) {
  if (korean) {
    return ko;
  }
  return english ? en : zh;
}

function deriveTriageResult(input: {
  symptoms: string;
  symptomDuration: string;
  severity: string;
  sampleGroupId?: SymptomSampleGroupId | null;
  flags: {
    breathing: boolean;
    chestPain: boolean;
    neurological: boolean;
  };
}): TriageResult {
  const text = symptomTextForAnalysis(input.symptoms).toLowerCase();
  const hasAny = (terms: string[]) => terms.some((term) => text.includes(term));
  const shortDuration = input.symptomDuration === "<1 day" || input.symptomDuration === "1-3 days";
  const hasMildSignal =
    input.severity === "mild" ||
    (shortDuration &&
      hasAny([
        "mild",
        "minor",
        "slight",
        "no fever",
        "without fever",
        "low-grade fever",
        "under 38",
        "not spreading",
        "stable",
        "controlled",
        "refill only",
        "轻微",
        "一点",
        "没有发烧",
        "没有发热",
        "无发烧",
        "无发热",
        "不发烧",
        "不严重",
        "低烧",
        "38度以下",
        "无扩散",
        "稳定期",
        "控制良好",
        "只是续药",
        "가벼운",
        "미열",
        "38도 미만",
        "퍼지지 않음",
        "안정기",
        "잘 조절",
        "약만 필요"
      ]));
  const hasWorseningSignal =
    input.severity === "severe" ||
    (!hasAny(["not spreading", "not spread", "无扩散", "没有扩散", "不扩散", "퍼지지 않음"]) &&
      hasAny(["worse", "worsening", "spreading", "severe", "persistent", "fixed area", "appendicitis", "加重", "变大", "持续", "严重", "很厉害", "位置固定", "阑尾炎", "심해", "지속", "충수염", "퍼지"]));
  const hasNegatedBreathing =
    hasAny(["no breathing difficulty", "without breathing difficulty", "无呼吸困难", "没有呼吸困难", "호흡곤란 없음"]);
  const hasBreathingRisk =
    hasAny(["shortness of breath", "breathing difficulty", "difficulty breathing", "呼吸困难", "气短", "喘不上气", "호흡곤란", "숨참"]) &&
    !hasNegatedBreathing;
  const hasHighRisk =
    hasAny([
      "chest pain",
      "heart attack",
      "myocardial infarction",
      "pulmonary embolism",
      "stroke",
      "slurred speech",
      "speech difficulty",
      "severe headache",
      "numbness",
      "persistent high fever",
      "very low energy",
      "confusion",
      "sepsis",
      "anaphylaxis",
      "severe allergic reaction",
      "widespread rash",
      "39.5",
      "胸口痛",
      "胸痛",
      "心梗",
      "肺栓塞",
      "突然头痛",
      "剧烈头痛",
      "说话不清",
      "说话困难",
      "手脚麻木",
      "中风",
      "高烧不退",
      "精神很差",
      "脓毒症",
      "过敏性休克",
      "全身皮疹",
      "가슴 통증",
      "심근경색",
      "폐색전증",
      "뇌졸중",
      "말 어눌",
      "손발 저림",
      "심한 두통",
      "39.5도",
      "패혈증",
      "아나필락시스",
      "전신 발진"
    ]) ||
    hasBreathingRisk ||
    input.flags.chestPain ||
    input.flags.breathing ||
    input.flags.neurological;

  if (hasHighRisk) {
    return {
      risk: "HIGH",
      probabilities: ["Emergency pattern"],
      department: "Emergency Medicine",
      careLevel: "Emergency",
      explanation: "Immediate care is recommended.",
      redFlag: "Immediate clinical evaluation is recommended."
    };
  }

  if (input.sampleGroupId) {
    return sampleGuidedTriageResult(input.sampleGroupId, text);
  }

  if (input.severity === "severe") {
    return sampleGuidedTriageResult("severe", text);
  }

  if (hasAny(["cancer", "oncology", "osimertinib", "targeted", "癌", "肿瘤", "靶向"])) {
    return {
      risk: "SPECIALIST",
      probabilities: ["Specialist pathway"],
      department: "Oncology",
      careLevel: "Specialist Hospital",
      explanation: "Specialist confirmation is recommended."
    };
  }

  if (
    hasAny(["stable chronic", "controlled hypertension", "controlled diabetes", "refill only", "稳定期", "控制良好", "只是续药", "안정기", "잘 조절", "약만 필요"]) &&
    hasAny(["hypertension", "diabetes", "blood pressure", "glucose", "高血压", "糖尿病", "血压", "血糖", "고혈압", "당뇨", "혈압", "혈당"])
  ) {
    return {
      risk: "LOW-MEDIUM",
      probabilities: ["Stable chronic-care pathway"],
      department: "General Practice",
      careLevel: "Primary Care Clinic",
      explanation: "A nearby primary care site can handle stable chronic-disease refills first."
    };
  }

  if (hasAny(["diabetes", "insulin", "glucose", "hba1c", "糖尿病", "续药", "复诊", "당뇨", "인슐린", "혈당", "처방 갱신", "재진"])) {
    return {
      risk: "MEDIUM",
      probabilities: ["Chronic-care pathway"],
      department: "General Practice",
      careLevel: "Primary Care Clinic",
      explanation: "A follow-up visit and refill support are recommended."
    };
  }

  if (hasAny(["urinary tract", "uti", "urine test", "antibiotic", "urinary", "尿路感染", "尿检", "化验", "抗生素", "小便痛", "尿痛", "요로감염", "소변검사", "항생제", "배뇨통"])) {
    return {
      risk: "MEDIUM",
      probabilities: ["Urinary infection pathway"],
      department: "Urology / General Internal Medicine",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A secondary hospital outpatient visit can run urine tests and prescribe antibiotics if appropriate."
    };
  }

  if (hasAny(["diarrhea", "vomit", "vomiting", "nausea", "stomach", "abdominal", "appendicitis", "腹泻", "拉肚子", "呕吐", "恶心", "腹痛", "肚子痛", "胃痛", "肠胃", "阑尾炎", "설사", "복통", "구토", "메스꺼움", "충수염"])) {
    if (hasMildSignal && !hasWorseningSignal) {
      return {
        risk: "LOW-MEDIUM",
        probabilities: ["Mild digestive pathway"],
        department: "General Outpatient",
        careLevel: "Primary Care Clinic",
        explanation: "A nearby community clinic can assess mild digestive discomfort first."
      };
    }

    return {
      risk: "MEDIUM",
      probabilities: ["Digestive pathway"],
      department: "Gastroenterology",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A digestive outpatient visit is recommended today."
    };
  }

  if (hasAny(["rash", "itch", "itching", "hives", "allergy", "skin", "皮疹", "瘙痒", "发痒", "荨麻疹", "过敏", "皮肤", "발진", "가려움", "두드러기", "알레르기", "피부"])) {
    if (hasMildSignal && !hasWorseningSignal) {
      return {
        risk: "LOW-MEDIUM",
        probabilities: ["Mild skin pathway"],
        department: "General Outpatient",
        careLevel: "Primary Care Clinic",
        explanation: "A nearby community clinic can assess mild rash or itching first."
      };
    }

    return {
      risk: "MEDIUM",
      probabilities: ["Skin and allergy pathway"],
      department: "Dermatology",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A dermatology or allergy visit is recommended."
    };
  }

  if (hasAny(["fracture", "x-ray", "xray", "sprain", "broken bone", "骨折", "X光", "x光", "扭伤", "骨裂", "골절", "X-ray", "염좌"])) {
    return {
      risk: "MEDIUM",
      probabilities: ["Injury imaging pathway"],
      department: "Orthopedics / Rehabilitation",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A secondary hospital visit can confirm whether imaging is needed."
    };
  }

  if (hasAny(["joint pain", "back pain", "lower back", "fall", "关节痛", "腰痛", "背痛", "摔伤", "肌肉酸痛", "관절통", "허리 통증", "넘어짐", "근육통"])) {
    return {
      risk: "LOW-MEDIUM",
      probabilities: ["Muscle and joint pathway"],
      department: "Orthopedics / Rehabilitation",
      careLevel: "Primary Care Clinic",
      explanation: "A first outpatient assessment for muscle or joint discomfort is recommended."
    };
  }

  if (hasAny(["fever", "cough", "tired", "fatigue", "sore throat", "runny nose", "stuffy nose", "cold", "发烧", "发热", "咳嗽", "疲劳", "嗓子", "咽痛", "喉咙", "流鼻涕", "鼻塞", "感冒", "발열", "기침", "피로", "인후통", "콧물", "코막힘", "감기"])) {
    if (hasMildSignal && !hasWorseningSignal) {
      return {
        risk: "LOW-MEDIUM",
        probabilities: ["Mild respiratory pathway"],
        department: "General Outpatient",
        careLevel: "Primary Care Clinic",
        explanation: "A nearby community clinic can assess mild respiratory symptoms first."
      };
    }

    return {
      risk: "MEDIUM",
      probabilities: ["Respiratory pathway"],
      department: "Respiratory Clinic",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A secondary hospital outpatient visit is recommended today."
    };
  }

  if (input.severity === "moderate") {
    return {
      risk: "MEDIUM",
      probabilities: ["Same-day outpatient pathway"],
      department: "General Internal Medicine",
      careLevel: "Secondary Hospital Outpatient",
      explanation: "A secondary hospital outpatient visit is recommended today."
    };
  }

  return {
    risk: "LOW-MEDIUM",
    probabilities: ["General outpatient pathway"],
    department: "General Outpatient",
    careLevel: "Primary Care Clinic",
    explanation: "A general outpatient visit is recommended."
  };
}

function cityConfigFor(location: string): CityCareConfig {
  return cityCareConfigs[(locations.includes(location as CityKey) ? location : "Chengdu") as CityKey];
}

function cityKeyFromConfig(cityConfig: CityCareConfig): CityKey {
  return (locations.includes(cityConfig.enCity as CityKey) ? cityConfig.enCity : "Chengdu") as CityKey;
}

const koreanAddressByEnglish: Record<string, string> = {
  "No. 18 Jingkang Road, Jinjiang District, Chengdu": "청두시 진장구 징캉로 18번지",
  "No. 65 Shuwa North 2nd Street, Jinjiang District, Chengdu": "청두시 진장구 수와베이얼가 65번지",
  "No. 37 Guoxue Alley, Wuhou District, Chengdu": "청두시 우허우구 궈쉐샹 37번지",
  "No. 55 Section 4, Renmin South Road, Chengdu": "청두시 런민남로 4단 55번지",
  "Near Ruijin 2nd Road, Huangpu District, Shanghai": "상하이시 황푸구 루이진얼루 인근",
  "No. 109 Sichuan Middle Road, Huangpu District, Shanghai": "상하이시 황푸구 쓰촨중로 109번지",
  "No. 197 Ruijin 2nd Road, Huangpu District, Shanghai": "상하이시 황푸구 루이진얼루 197번지",
  "No. 270 Dong'an Road, Xuhui District, Shanghai": "상하이시 쉬후이구 둥안로 270번지",
  "Nonglinxia Road area, Yuexiu District, Guangzhou": "광저우시 웨슈구 눙린샤로 일대",
  "No. 6 Zhengnan Road, Yuexiu District, Guangzhou": "광저우시 웨슈구 정난로 6번지",
  "No. 58 Zhongshan 2nd Road, Yuexiu District, Guangzhou": "광저우시 웨슈구 중산얼로 58번지",
  "No. 651 Dongfeng East Road, Yuexiu District, Guangzhou": "광저우시 웨슈구 둥펑동로 651번지",
  "Near Fuhua Road, Futian District, Shenzhen": "선전시 푸톈구 푸화로 인근",
  "No. 27 Zhongkang Road, Futian District, Shenzhen": "선전시 푸톈구 중캉로 27번지",
  "No. 1017 Dongmen North Road, Luohu District, Shenzhen": "선전시 뤄후구 둥먼북로 1017번지",
  "No. 113 Baohuan Avenue, Longgang District, Shenzhen": "선전시 룽강구 바오환대로 113번지"
};

const koreanRouteStartByCity: Record<CityKey, string> = {
  Chengdu: "청두시 진장구 춘시로 인근",
  Shanghai: "상하이시 황푸구 인민광장 인근",
  Guangzhou: "광저우시 웨슈구 베이징로 인근",
  Shenzhen: "선전시 푸톈구 컨벤션전시센터 인근"
};

const koreanCityNameByCity: Record<CityKey, string> = {
  Chengdu: "청두",
  Shanghai: "상하이",
  Guangzhou: "광저우",
  Shenzhen: "선전"
};

const koreanRouteRoadsByCity: Record<CityKey, [string, string, string]> = {
  Chengdu: ["수두대로", "런민남로", "궈쉐샹"],
  Shanghai: ["인민대로", "시장중로", "루이진얼루"],
  Guangzhou: ["중산오로", "둥펑동로", "중산얼로"],
  Shenzhen: ["선난대로", "훙리로", "둥먼북로"]
};

const koreanRouteAdviceByCity: Record<CityKey, string> = {
  Chengdu: "수두대로와 런민남로를 거쳐 화시병원 응급실 입구까지 택시 이동을 권장합니다.",
  Shanghai: "인민대로와 루이진얼루를 거쳐 루이진병원 응급실 입구까지 택시 이동을 권장합니다.",
  Guangzhou: "중산오로와 둥펑동로를 거쳐 중산대 제1부속병원 응급실 입구까지 택시 이동을 권장합니다.",
  Shenzhen: "선난대로와 훙리로를 거쳐 선전시 인민병원 응급실 입구까지 택시 이동을 권장합니다."
};

function facilityName(facility: CityFacility, english: boolean, korean = false) {
  return korean ? displayHospitalName(facility.enName, english, true) : english ? facility.enName : facility.zhName;
}

function facilityAddress(facility: CityFacility, english: boolean, korean = false) {
  if (korean) {
    return koreanAddressByEnglish[facility.enAddress] ?? "선택한 병원 주소";
  }
  return english ? facility.enAddress : facility.zhAddress;
}

function taxiMinutesFromDistance(distance: string) {
  const kilometers = Number.parseFloat(distance);
  if (!Number.isFinite(kilometers)) {
    return 10;
  }
  if (kilometers <= 1.5) {
    return 5;
  }
  if (kilometers <= 2.5) {
    return 6;
  }
  if (kilometers <= 3.5) {
    return 8;
  }
  if (kilometers <= 4.5) {
    return 10;
  }
  if (kilometers <= 6) {
    return 12;
  }
  if (kilometers <= 7.5) {
    return 15;
  }
  if (kilometers <= 10) {
    return 18;
  }
  return Math.round(kilometers * 1.8);
}

function estimatedTaxiTravel(distance: string, english: boolean, korean = false) {
  const minutes = taxiMinutesFromDistance(distance);
  if (korean) {
    return `택시 약 ${minutes}분`;
  }
  return english ? `about ${minutes} minutes by taxi` : `打车约${minutes}分钟`;
}

function facilityTravel(facility: CityFacility, english: boolean, korean = false) {
  return estimatedTaxiTravel(facility.distance, english, korean);
}

function facilityLevelLabel(facilityKind: FacilityKind, english: boolean, korean = false) {
  if (facilityKind === "primary") {
    if (korean) {
      return "1차 병원 (의원, 보건소)";
    }
    return english ? "community health center" : "社区卫生服务中心";
  }
  if (facilityKind === "secondary") {
    if (korean) {
      return "2차 병원 (일반 종합병원)";
    }
    return english ? "secondary hospital" : "二级医院";
  }
  if (facilityKind === "specialist") {
    if (korean) {
      return "3차 병원 (상급종합병원)";
    }
    return english ? "tertiary specialist hospital" : "三甲专科医院";
  }
  if (korean) {
    return "3차 병원 (상급종합병원)";
  }
  return english ? "Class A tertiary hospital" : "三甲医院";
}

function referralHospitalLabel(facility: CityFacility, facilityKind: FacilityKind, english: boolean, korean = false) {
  if (korean) {
    return `${facilityName(facility, false, true)} (${facilityLevelLabel(facilityKind, false, true)})`;
  }

  return english
    ? `${facilityName(facility, true)} (${facilityLevelLabel(facilityKind, true)})`
    : `${facilityName(facility, false)}（${facilityLevelLabel(facilityKind, false)}）`;
}

function doctorNamePool(cityConfig: CityCareConfig, facilityKind: FacilityKind, english: boolean, korean = false) {
  const namesByCity = {
    Chengdu: {
      primary: [
        ["Dr. Liu Xia", "刘霞医生", "류샤 의사"],
        ["Dr. Gao Rui", "高睿医生", "가오루이 의사"],
        ["Dr. Tang Wei", "唐薇医生", "탕웨이 의사"]
      ],
      secondary: [
        ["Dr. He Jing", "何静医生", "허징 의사"],
        ["Dr. Jiang Tao", "蒋涛医生", "장타오 의사"],
        ["Dr. Luo Min", "罗敏医生", "뤄민 의사"]
      ],
      emergency: [
        ["Dr. Li Ming", "李明医生", "리밍 의사"],
        ["Dr. Zhou Lan", "周岚医生", "저우란 의사"],
        ["Dr. Chen Yu", "陈宇医生", "천위 의사"]
      ],
      specialist: [
        ["Dr. Ma Rong", "马蓉医生", "마룽 의사"],
        ["Dr. Deng Kai", "邓凯医生", "덩카이 의사"],
        ["Dr. Song Yi", "宋怡医生", "쑹이 의사"]
      ],
      tertiary: [
        ["Dr. Qiao Wen", "乔文医生", "차오원 의사"],
        ["Dr. Hu Nan", "胡楠医生", "후난 의사"],
        ["Dr. Xie Lin", "谢琳医生", "셰린 의사"]
      ]
    },
    Shanghai: {
      primary: [
        ["Dr. Shen Jia", "沈佳医生", "선자 의사"],
        ["Dr. Xu Lin", "许琳医生", "쉬린 의사"],
        ["Dr. Fan Yue", "范悦医生", "판웨 의사"]
      ],
      secondary: [
        ["Dr. Wang Yiming", "王一鸣医生", "왕이밍 의사"],
        ["Dr. Qian Rui", "钱睿医生", "첸루이 의사"],
        ["Dr. Lu Han", "陆涵医生", "루한 의사"]
      ],
      emergency: [
        ["Dr. Zhao Ning", "赵宁医生", "자오닝 의사"],
        ["Dr. Sun Ke", "孙珂医生", "쑨커 의사"],
        ["Dr. Yu Qing", "俞晴医生", "위칭 의사"]
      ],
      specialist: [
        ["Dr. Lin Mo", "林墨医生", "린모 의사"],
        ["Dr. Wei Xin", "魏欣医生", "웨이신 의사"],
        ["Dr. Han Zhe", "韩哲医生", "한저 의사"]
      ],
      tertiary: [
        ["Dr. Ding Yuan", "丁远医生", "딩위안 의사"],
        ["Dr. Ye Shu", "叶舒医生", "예슈 의사"],
        ["Dr. Guo Yan", "郭妍医生", "궈옌 의사"]
      ]
    },
    Guangzhou: {
      primary: [
        ["Dr. Liang Min", "梁敏医生", "량민 의사"],
        ["Dr. Mo Xuan", "莫璇医生", "모쉬안 의사"],
        ["Dr. Pan Yi", "潘怡医生", "판이 의사"]
      ],
      secondary: [
        ["Dr. Chen Jia", "陈嘉医生", "천자 의사"],
        ["Dr. Feng Lei", "冯磊医生", "펑레이 의사"],
        ["Dr. Wu Xin", "吴昕医生", "우신 의사"]
      ],
      emergency: [
        ["Dr. Huang Yi", "黄怡医生", "황이 의사"],
        ["Dr. Gu Ming", "顾明医生", "구밍 의사"],
        ["Dr. Xie Yuan", "谢媛医生", "셰위안 의사"]
      ],
      specialist: [
        ["Dr. Tan Qiu", "谭秋医生", "탄추 의사"],
        ["Dr. Pei Yang", "裴洋医生", "페이양 의사"],
        ["Dr. Zhong Ning", "钟宁医生", "중닝 의사"]
      ],
      tertiary: [
        ["Dr. Bai Cheng", "白澄医生", "바이청 의사"],
        ["Dr. Luo Shan", "罗珊医生", "뤄산 의사"],
        ["Dr. Meng Hui", "孟辉医生", "멍후이 의사"]
      ]
    },
    Shenzhen: {
      primary: [
        ["Dr. Xu Chen", "许晨医生", "쉬천 의사"],
        ["Dr. Liang Jing", "梁静医生", "량징 의사"],
        ["Dr. Cao Yuan", "曹远医生", "차오위안 의사"]
      ],
      secondary: [
        ["Dr. Lin Yue", "林悦医生", "린웨 의사"],
        ["Dr. Shen Bo", "沈博医生", "선보 의사"],
        ["Dr. Fu Xin", "傅欣医生", "푸신 의사"]
      ],
      emergency: [
        ["Dr. Zhou Hang", "周航医生", "저우항 의사"],
        ["Dr. Deng Wen", "邓雯医生", "덩원 의사"],
        ["Dr. Yuan Hao", "袁昊医生", "위안하오 의사"]
      ],
      specialist: [
        ["Dr. Cheng Lu", "程璐医生", "청루 의사"],
        ["Dr. Kang Jie", "康杰医生", "캉제 의사"],
        ["Dr. Zeng Rui", "曾睿医生", "쩡루이 의사"]
      ],
      tertiary: [
        ["Dr. Shao Yun", "邵云医生", "샤오윈 의사"],
        ["Dr. Mei Qing", "梅清医生", "메이칭 의사"],
        ["Dr. Du Fan", "杜帆医生", "두판 의사"]
      ]
    }
  } satisfies Record<CityKey, Record<FacilityKind, [string, string, string][]>>;

  return (namesByCity[cityConfig.enCity as CityKey] ?? namesByCity.Chengdu)[facilityKind].map((name) => (korean ? name[2] : english ? name[0] : name[1]));
}

function doctorSpecialtyFor(department: string, facilityKind: FacilityKind, english: boolean, korean = false) {
  if (facilityKind === "emergency") {
    if (korean) {
      return "응급의학 평가";
    }
    return english ? "Emergency medicine evaluation" : "急诊医学评估";
  }
  if (department.includes("Oncology") || department.includes("肿瘤") || department.includes("종양")) {
    if (korean) {
      return "종양내과 약물 검토";
    }
    return english ? "Oncology medicine review" : "肿瘤专科用药复核";
  }
  if (department.includes("Gastroenterology") || department.includes("消化") || department.includes("소화기")) {
    if (korean) {
      return "소화기 외래";
    }
    return english ? "Digestive outpatient care" : "消化内科门诊";
  }
  if (department.includes("Dermatology") || department.includes("皮肤") || department.includes("피부")) {
    if (korean) {
      return "피부·알레르기 진료";
    }
    return english ? "Dermatology and allergy" : "皮肤与过敏门诊";
  }
  if (department.includes("Orthopedics") || department.includes("骨科") || department.includes("정형외과")) {
    if (korean) {
      return "정형외과 / 재활 평가";
    }
    return english ? "Orthopedics / rehabilitation" : "骨科 / 康复评估";
  }
  if (department.includes("Urology") || department.includes("泌尿") || department.includes("비뇨")) {
    if (korean) {
      return "요로감염 평가";
    }
    return english ? "Urinary infection assessment" : "尿路感染评估";
  }
  if (department.includes("Chronic") || department.includes("慢病") || department.includes("만성질환")) {
    if (korean) {
      return "가정의학·만성질환 관리";
    }
    return english ? "General practice and chronic care" : "全科与慢病管理";
  }
  if (department.includes("Respiratory") || department.includes("呼吸") || department.includes("호흡기")) {
    if (korean) {
      return "호흡기 진료";
    }
    return english ? "General practice / respiratory" : "全科 / 呼吸科";
  }
  if (korean) {
    return "일반 외래 진료";
  }
  return english ? "General outpatient care" : "普通门诊";
}

function doctorOptionsFor(input: {
  cityConfig: CityCareConfig;
  facilityKind: FacilityKind;
  department: string;
  english: boolean;
  korean?: boolean;
}): DoctorOption[] {
  const names = doctorNamePool(input.cityConfig, input.facilityKind, input.english, input.korean);
  const titles = input.english
    ? ["Chief Physician", "Associate Chief Physician", "Attending Physician"]
    : input.korean
      ? ["전문의", "부전문의", "주치의"]
      : ["主任医师", "副主任医师", "主治医师"];
  const specialty = doctorSpecialtyFor(input.department, input.facilityKind, input.english, input.korean);
  const nextTimes =
    input.facilityKind === "emergency"
      ? input.korean
        ? ["분류 후 약 8분 뒤 진료", "분류 후 약 10분 뒤 진료", "분류 후 약 12분 뒤 진료"]
        : input.english
        ? ["To be seen: ~8 min after triage", "To be seen: ~10 min after triage", "To be seen: ~12 min after triage"]
        : ["分诊完成后约8分钟接诊", "分诊完成后约10分钟接诊", "分诊完成后约12分钟接诊"]
      : input.facilityKind === "specialist"
        ? input.korean
          ? ["오늘 16:20", "오늘 16:50", "내일 09:30"]
          : input.english
          ? ["Today 16:20", "Today 16:50", "Tomorrow 09:30"]
          : ["今天16:20", "今天16:50", "明天09:30"]
        : input.korean
          ? ["오늘 14:40", "오늘 15:10", "오늘 15:50"]
          : input.english
          ? ["Today 14:40", "Today 15:10", "Today 15:50"]
          : ["今天14:40", "今天15:10", "今天15:50"];
  const waits =
    input.facilityKind === "emergency"
      ? input.korean
        ? ["응급 분류 데스크에서 시작", "응급 분류 데스크에서 시작", "응급 분류 데스크에서 시작"]
        : input.english
        ? ["Start at emergency triage desk", "Start at emergency triage desk", "Start at emergency triage desk"]
        : ["到院后先到急诊分诊台", "到院后先到急诊分诊台", "到院后先到急诊分诊台"]
      : input.korean
        ? ["대기 약 5분", "대기 약 10분", "대기 약 15분"]
        : input.english
        ? ["About 5 minutes", "About 10 minutes", "About 15 minutes"]
        : ["候诊约5分钟", "候诊约10分钟", "候诊约15分钟"];

  return names.map((name, index) => ({
    name,
    title: titles[index],
    specialty,
    nextAvailable: nextTimes[index],
    waitTime: waits[index]
  }));
}

function availabilitySnapshotFor(input: {
  facilityKind: FacilityKind;
  slots: string;
  distance: string;
  english: boolean;
  korean?: boolean;
}): AvailabilitySnapshot {
  if (input.facilityKind === "emergency") {
    if (input.korean) {
      return {
        summary: "응급 분류, 당직 의료진, 관찰·입원 병상 여유를 함께 확인했습니다.",
        waitTime: "응급 분류 접수: 약 8-12분",
        registrationStatus: "응급 접수 가능",
        doctorSchedule: "응급의학 의료진 3명 당직",
        bedStatus: "관찰 병상 4개와 입원 병상 2개 조율 가능"
      };
    }

    return input.english
      ? {
          summary: "Emergency triage status, clinician coverage, and bed readiness were checked together.",
          waitTime: "Emergency triage check-in: about 8-12 minutes",
          registrationStatus: "Emergency desk open now",
          doctorSchedule: "3 emergency physicians on duty",
          bedStatus: "4 observation beds and 2 inpatient beds can be coordinated"
        }
      : {
          summary: "已综合急诊分诊、医生排班和床位情况进行推荐。",
          waitTime: "到院后急诊分诊约8-12分钟",
          registrationStatus: "急诊窗口现在可接诊",
          doctorSchedule: "3名急诊医生当班",
          bedStatus: "可协调4张观察床、2张住院床位"
        };
  }

  if (input.facilityKind === "specialist") {
    if (input.korean) {
      return {
        summary: "전문 진료 예약, 약물 검토 가능 여부, 치료 공간 여유를 확인했습니다.",
        waitTime: "대기 약 20분",
        registrationStatus: input.slots,
        doctorSchedule: "전문의 3명 예약 가능",
        bedStatus: "필요 시 당일 치료 공간 3개 사용 가능"
      };
    }

    return input.english
      ? {
          summary: "Specialist slots, medicine review capacity, and treatment-room availability were checked.",
          waitTime: "About 20 minutes",
          registrationStatus: input.slots,
          doctorSchedule: "3 specialist doctors available",
          bedStatus: "3 day-treatment places available if needed"
        }
      : {
          summary: "已比较专科号源、用药复核能力和治疗位可用情况。",
          waitTime: "候诊约20分钟",
          registrationStatus: input.slots,
          doctorSchedule: "3名专科医生可预约",
          bedStatus: "如需处理，可用3个日间治疗位"
        };
  }

  const minutes = taxiMinutesFromDistance(input.distance);
  if (input.korean) {
    return {
      summary: "예약 가능 시간, 대기 시간, 의료진 일정, 이동 부담을 비교했습니다.",
      waitTime: minutes <= 5 ? "대기 약 5분" : "대기 약 10분",
      registrationStatus: input.slots,
      doctorSchedule: "의료진 3명 진료 가능",
      bedStatus: "외래 진료이며 현재 입원 병상은 필요하지 않습니다"
    };
  }

  return input.english
    ? {
        summary: "Appointment slots, waiting time, doctor schedule, and travel burden were compared.",
        waitTime: minutes <= 5 ? "About 5 minutes" : "About 10 minutes",
        registrationStatus: input.slots,
        doctorSchedule: "3 clinicians available",
        bedStatus: "Outpatient visit; no inpatient bed needed now"
      }
    : {
        summary: "已比较号源、等待时间、医生排班和路程负担。",
        waitTime: minutes <= 5 ? "候诊约5分钟" : "候诊约10分钟",
        registrationStatus: input.slots,
        doctorSchedule: "3名医生可接诊",
        bedStatus: "门诊就诊，暂不需要住院床位"
      };
}

function recommendationFromFacility(input: {
  tone: CareRecommendation["tone"];
  signal: string;
  possible: string;
  facilityKind: FacilityKind;
  facility: CityFacility;
  department: string;
  slots: string;
  medicine: string;
  cityConfig: CityCareConfig;
  english: boolean;
  korean?: boolean;
}): CareRecommendation {
  const travel = facilityTravel(input.facility, input.english, input.korean);
  const availability = availabilitySnapshotFor({
    facilityKind: input.facilityKind,
    slots: input.slots,
    distance: input.facility.distance,
    english: input.english,
    korean: input.korean
  });
  const doctors = doctorOptionsFor({
    cityConfig: input.cityConfig,
    facilityKind: input.facilityKind,
    department: input.department,
    english: input.english,
    korean: input.korean
  });
  return {
    tone: input.tone,
    signal: input.signal,
    possible: input.possible,
    hospital: facilityName(input.facility, input.english, input.korean),
    department: input.department,
    slots: input.slots,
    distance: input.facility.distance,
    medicine: input.medicine,
    facilityKind: input.facilityKind,
    address: facilityAddress(input.facility, input.english, input.korean),
    phone: input.facility.phone,
    travel,
    etaShort: input.english ? travel.replace(/^about\s+/i, "") : travel,
    routeAdvice: input.korean ? routeAdviceForCity(input.cityConfig) : input.english ? input.cityConfig.routeAdviceEn : input.cityConfig.routeAdviceZh,
    facilityLevel: facilityLevelLabel(input.facilityKind, input.english, input.korean),
    availability,
    doctors
  };
}

function routeAdviceForCity(cityConfig: CityCareConfig) {
  return koreanRouteAdviceByCity[cityKeyFromConfig(cityConfig)];
}

function nearestEmergencySummary(location: string, english: boolean, korean = false) {
  const cityConfig = cityConfigFor(location);
  const emergency = cityConfig.facilities.emergency;
  if (korean) {
    return `가장 가까운 응급실: ${facilityName(emergency, false, true)} (${facilityLevelLabel("emergency", false, true)}) · ${emergency.distance}`;
  }
  return english
    ? `Nearest emergency: ${emergency.enName} (${facilityLevelLabel("emergency", true)}) · ${emergency.distance} away`
    : `最近急诊：${emergency.zhName}（${facilityLevelLabel("emergency", false)}）· 距您${emergency.distance}`;
}

function routeCallText(location: string, english: boolean, korean = false) {
  const emergency = cityConfigFor(location).facilities.emergency;
  if (korean) {
    return `${facilityName(emergency, false, true)} 전화: ${emergency.phone}`;
  }
  return english
    ? `${emergency.enName}: ${emergency.phone}`
    : `${emergency.zhName}电话：${emergency.phone}`;
}

function routeStartValue(location: string, english: boolean, korean = false) {
  const cityConfig = cityConfigFor(location);
  if (korean) {
    return koreanRouteStartByCity[cityKeyFromConfig(cityConfig)];
  }
  return english ? cityConfig.routeStartEn : cityConfig.routeStartZh;
}

function routeRoads(location: string, english: boolean, korean = false) {
  const cityConfig = cityConfigFor(location);
  if (korean) {
    return koreanRouteRoadsByCity[cityKeyFromConfig(cityConfig)];
  }
  return english ? cityConfig.routeRoadsEn : cityConfig.routeRoadsZh;
}

function symptomDurationLabel(value: string, english: boolean, korean = false) {
  const labels: Record<string, string> = {
    "<1 day": "不到1天",
    "1-3 days": "1-3天",
    "3-7 days": "3-7天",
    ">7 days": "超过7天"
  };
  const koreanLabels: Record<string, string> = {
    "<1 day": "1일 미만",
    "1-3 days": "1-3일",
    "3-7 days": "3-7일",
    ">7 days": "7일 초과"
  };
  if (korean) {
    return koreanLabels[value] ?? value;
  }
  return english ? value : labels[value] ?? value;
}

function severityLabel(value: string, english: boolean, korean = false) {
  const labels: Record<string, string> = {
    mild: "轻微",
    moderate: "中等",
    severe: "严重"
  };
  const koreanLabels: Record<string, string> = {
    mild: "가벼움",
    moderate: "중간",
    severe: "심함"
  };
  if (korean) {
    return koreanLabels[value] ?? value;
  }
  return english ? value : labels[value] ?? value;
}

function recommendationEvidenceFor(input: {
  recommendation: CareRecommendation;
  patient: PatientProfile | null;
  symptoms: string;
  symptomDuration: string;
  severity: string;
  english: boolean;
  korean?: boolean;
}) {
  const patientLabel = input.patient ? displayPatientName(input.patient, input.english, input.korean) : input.korean ? "선택한 프로필" : input.english ? "the selected profile" : "所选档案";
  const condition = input.patient ? displayPatientValue(input.patient.condition, input.english, input.korean) : input.korean ? "건강 기록" : input.english ? "health record" : "健康记录";
  const allergy = input.patient ? displayPatientValue(input.patient.allergy, input.english, input.korean) : input.korean ? "알레르기 기록" : input.english ? "allergy record" : "过敏记录";
  const recentCount = input.patient?.recent.length ?? 0;
  const symptomReadout = symptomTextForLanguage(input.symptoms, input.english, input.korean);
  const departmentMatch = input.recommendation.facilityKind === "emergency"
    ? input.korean
      ? `${input.recommendation.department}에 매칭하고 현재 당직 응급 의료진을 확인했습니다.`
      : input.english
      ? `Matched to ${input.recommendation.department} and checked the emergency physicians currently on duty.`
      : `匹配到${input.recommendation.department}，并查看当前当班急诊医生。`
    : input.korean
      ? `${input.recommendation.department}에 매칭하고 진료 가능한 의료진 3명을 선별했습니다.`
      : input.english
      ? `Matched to ${input.recommendation.department} and screened 3 available clinicians.`
      : `匹配到${input.recommendation.department}，并筛选3名可接诊医生。`;

  return [
    {
      label: input.korean ? "증상 요약" : input.english ? "Symptom readout" : "症状读取",
      value: input.korean
        ? `${symptomDurationLabel(input.symptomDuration, false, true)}, ${severityLabel(input.severity, false, true)}: ${symptomReadout}`
        : input.english
        ? `${symptomDurationLabel(input.symptomDuration, true)}, ${severityLabel(input.severity, true)} severity: ${symptomReadout}`
        : `${symptomDurationLabel(input.symptomDuration, false)}，${severityLabel(input.severity, false)}：${symptomReadout}`
    },
    {
      label: input.korean ? "병력 교차 확인" : input.english ? "Record cross-check" : "病史比对",
      value: input.korean
        ? `${patientLabel}의 ${condition}, ${allergy}, 최근 기록 ${recentCount}건을 확인했습니다.`
        : input.english
        ? `Checked ${patientLabel}'s ${condition}, ${allergy}, and ${recentCount} recent records.`
        : `已结合${patientLabel}的${condition}、${allergy}和${recentCount}条近期记录。`
    },
    {
      label: input.korean ? "진료과 매칭" : input.english ? "Department match" : "科室匹配",
      value: departmentMatch
    },
    {
      label: input.korean ? "병원 가용성" : input.english ? "Hospital availability" : "医院可用情况",
      value: input.recommendation.availability.summary
    }
  ];
}

function recommendationFor(
  result: TriageResult | null,
  english: boolean,
  copy: PatientCopy,
  location: string,
  korean = false
): CareRecommendation {
  const cityConfig = cityConfigFor(location);
  if (result?.risk === "HIGH") {
    const facility = cityConfig.facilities.emergency;
    return recommendationFromFacility({
      tone: "red",
      signal: copy.highSignal,
      possible: copy.emergencyAlert,
      facilityKind: "emergency",
      facility,
      department: localText(english, korean, "Emergency", "急诊科", "응급실"),
      slots: localText(english, korean, "Immediate care", "立即接诊", "즉시 진료"),
      medicine: localText(english, korean, "Bring current medicine list", "携带当前用药清单", "현재 복용 약 목록 지참"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.risk === "SPECIALIST") {
    const facility = cityConfig.facilities.specialist;
    return recommendationFromFacility({
      tone: "amber",
      signal: copy.specialistSignal,
      possible: copy.possibleSpecialist,
      facilityKind: "specialist",
      facility,
      department: localText(english, korean, "Oncology", "肿瘤科", "종양내과"),
      slots: localText(english, korean, "5 slots today", "5个", "오늘 5개 예약 가능"),
      medicine: localText(english, korean, "Osimertinib refill review", "靶向药续方审核", "오시머티닙 처방 갱신 검토"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.department.includes("General Practice")) {
    const facility = cityConfig.facilities.primary;
    const stablePrimary = result.risk === "LOW-MEDIUM";
    return recommendationFromFacility({
      tone: stablePrimary ? "green" : "amber",
      signal: stablePrimary ? copy.lowSignal : copy.mediumSignal,
      possible: copy.possibleDiabetes,
      facilityKind: "primary",
      facility,
      department: localText(english, korean, "General Practice / Chronic Care", "全科 / 慢病门诊", "가정의학 / 만성질환 관리"),
      slots: localText(english, korean, stablePrimary ? "18 slots today" : "12 slots today", stablePrimary ? "18个" : "12个", stablePrimary ? "오늘 18개 예약 가능" : "오늘 12개 예약 가능"),
      medicine: localText(english, korean, "Diabetes medicine refill", "糖尿病续药", "당뇨약 처방 갱신"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.department.includes("Gastroenterology")) {
    const facility = cityConfig.facilities.secondary;
    return recommendationFromFacility({
      tone: "amber",
      signal: copy.mediumSignal,
      possible: copy.possibleDigestive,
      facilityKind: "secondary",
      facility,
      department: localText(english, korean, "Gastroenterology", "消化内科", "소화기내과"),
      slots: localText(english, korean, "8 slots today", "8个", "오늘 8개 예약 가능"),
      medicine: localText(english, korean, "Digestive care medicine", "消化道用药", "소화기 증상 완화 약"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.department.includes("Dermatology")) {
    const facility = cityConfig.facilities.secondary;
    return recommendationFromFacility({
      tone: "amber",
      signal: copy.mediumSignal,
      possible: copy.possibleSkin,
      facilityKind: "secondary",
      facility,
      department: localText(english, korean, "Dermatology / Allergy Clinic", "皮肤科 / 过敏门诊", "피부과 / 알레르기 클리닉"),
      slots: localText(english, korean, "6 slots today", "6个", "오늘 6개 예약 가능"),
      medicine: localText(english, korean, "Skin and allergy medicine", "皮肤或抗过敏用药", "피부·알레르기 약"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.department.includes("Urology")) {
    const facility = cityConfig.facilities.secondary;
    return recommendationFromFacility({
      tone: "amber",
      signal: copy.mediumSignal,
      possible: copy.possibleUrinary,
      facilityKind: "secondary",
      facility,
      department: localText(english, korean, "Urology / General Internal Medicine", "泌尿外科 / 普通内科", "비뇨의학과 / 일반내과"),
      slots: localText(english, korean, "8 slots today", "8个", "오늘 8개 예약 가능"),
      medicine: localText(english, korean, "Urinary infection medicine after evaluation", "尿路感染评估后用药", "요로감염 평가 후 약 처방"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.department.includes("General Internal Medicine")) {
    const facility = cityConfig.facilities.secondary;
    return recommendationFromFacility({
      tone: "amber",
      signal: copy.mediumSignal,
      possible: copy.possibleGeneral,
      facilityKind: "secondary",
      facility,
      department: localText(english, korean, "General Internal Medicine", "普通内科", "일반내과"),
      slots: localText(english, korean, "8 slots today", "8个", "오늘 8개 예약 가능"),
      medicine: localText(english, korean, "Medicine after outpatient evaluation", "门诊评估后用药", "외래 평가 후 약 처방"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.department.includes("Orthopedics")) {
    const needsImaging = result.risk === "MEDIUM";
    const facility = needsImaging ? cityConfig.facilities.secondary : cityConfig.facilities.primary;
    return recommendationFromFacility({
      tone: needsImaging ? "amber" : "green",
      signal: needsImaging ? copy.mediumSignal : copy.lowSignal,
      possible: copy.possibleMuscleBone,
      facilityKind: needsImaging ? "secondary" : "primary",
      facility,
      department: localText(english, korean, "Orthopedics / Rehabilitation", "骨科 / 康复门诊", "정형외과 / 재활"),
      slots: localText(english, korean, "10 slots today", "10个", "오늘 10개 예약 가능"),
      medicine: localText(english, korean, "External pain relief and bandage supplies", "外用止痛和包扎用品", "외용 진통제와 붕대 용품"),
      cityConfig,
      english,
      korean
    });
  }

  if (result?.risk === "MEDIUM") {
    const facility = cityConfig.facilities.secondary;
    return recommendationFromFacility({
      tone: "amber",
      signal: copy.mediumSignal,
      possible: copy.possibleRespiratory,
      facilityKind: "secondary",
      facility,
      department: localText(english, korean, "Respiratory Clinic", "呼吸科门诊", "호흡기 클리닉"),
      slots: localText(english, korean, "8 slots today", "8个", "오늘 8개 예약 가능"),
      medicine: localText(english, korean, "Respiratory care medicine", "呼吸道用药", "호흡기 증상 완화 약"),
      cityConfig,
      english,
      korean
    });
  }

  const facility = cityConfig.facilities.primary;
  return recommendationFromFacility({
    tone: "green",
    signal: copy.lowSignal,
    possible: copy.possibleGeneral,
    facilityKind: "primary",
    facility,
    department: localText(english, korean, "General Outpatient", "普通门诊", "일반 외래"),
    slots: localText(english, korean, "18 slots today", "18个", "오늘 18개 예약 가능"),
    medicine: localText(english, korean, "General outpatient medicine", "普通门诊用药", "일반 외래 처방 약"),
    cityConfig,
    english,
    korean
  });
}

function hospitalDetailsFor(recommendation: CareRecommendation, result: TriageResult | null, english: boolean, korean = false) {
  const isEmergency = result?.risk === "HIGH";
  const isSpecialist = result?.risk === "SPECIALIST";
  const isRespiratory = result?.risk === "MEDIUM" && result.department.includes("Respiratory");
  const isChronicCare = result?.department.includes("General Practice");
  const isDigestive = result?.department.includes("Gastroenterology");
  const isSkin = result?.department.includes("Dermatology");
  const isUrinary = result?.department.includes("Urology");
  const isMuscleBone = result?.department.includes("Orthopedics");

  if (isEmergency) {
    return {
      reason: english
        ? "This is the closest higher-level emergency department for chest pain, breathing difficulty, or neurological warning signs."
        : korean
          ? "흉통, 호흡 곤란, 신경학적 경고 증상에 대응할 수 있는 가까운 상급 응급실입니다."
          : "这里是距离较近的上级急诊，可处理胸痛、呼吸困难或神经系统预警症状。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "Emergency reception is open now. Go directly to the emergency triage desk.", "急诊现在可接诊，到院后直接前往急诊分诊台。", "응급 접수가 가능합니다. 도착 후 바로 응급 분류 데스크로 가세요."),
      preparation: localText(english, korean, "Bring your ID card, current medicine list, and allergy information if available.", "请携带身份证、当前用药清单和过敏信息。", "신분증, 현재 복용 약 목록, 알레르기 정보를 지참하세요."),
      services: korean
        ? ["응급 평가", "영상 및 혈액검사", "필요 시 상급 치료 연계"]
        : english
        ? ["Emergency assessment", "Imaging and lab tests", "Higher-level treatment if needed"]
        : ["急诊评估", "影像和化验检查", "必要时安排上级治疗"]
    };
  }

  if (isSpecialist) {
    return {
      reason: english
        ? "This hospital has oncology outpatient care and can review specialist medicine refills safely."
        : korean
          ? "이 병원은 종양 외래가 있어 전문 약 처방 갱신을 안전하게 검토할 수 있습니다."
          : "该院有肿瘤专科门诊，适合确认靶向药等专科用药续方。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "A specialist outpatient slot is reserved today. Arrive 20 minutes early for check-in.", "已预留今日专科门诊号源，建议提前20分钟到院取号。", "오늘 전문 외래 예약 가능 시간이 확보되었습니다. 접수를 위해 20분 일찍 도착하세요."),
      preparation: localText(english, korean, "Bring your ID card, insurance card, recent imaging reports, and current medicine package.", "请带身份证、医保卡、近期影像报告和正在使用的药盒。", "신분증, 보험카드, 최근 영상검사 결과, 현재 복용 중인 약 포장을 가져오세요."),
      services: korean
        ? ["전문 약물 검토", "부작용 확인", "추적 진료 예약 지원"]
        : english
        ? ["Specialist medicine review", "Side-effect screening", "Follow-up appointment support"]
        : ["专科用药审核", "不良反应筛查", "复诊预约协助"]
    };
  }

  if (isChronicCare) {
    return {
      reason: english
        ? "This nearby community health center can handle chronic-care follow-up and routine medicine refill with shorter travel time."
        : korean
          ? "가까운 지역사회보건센터로 만성질환 추적 진료와 일반 처방 갱신에 적합하며 이동 부담이 작습니다."
          : "这家社区卫生服务中心距离近，适合慢病复诊和常规续药，往返负担较小。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "A general practice slot is held today. Check in with your visit pass at reception.", "已为您保留今日全科号源，到达后凭就诊凭证在前台取号。", "오늘 가정의학 진료 시간이 확보되었습니다. 접수처에서 방문 확인증을 제시하세요."),
      preparation: localText(english, korean, "Bring your ID card, insurance card, and recent glucose or blood pressure records if available.", "请带身份证、医保卡，以及近期血糖或血压记录。", "신분증, 보험카드, 최근 혈당 또는 혈압 기록이 있으면 가져오세요."),
      services: korean
        ? ["만성질환 추적 진료", "일반 처방 갱신", "필요 시 기본 검사"]
        : english
        ? ["Chronic-care follow-up", "Routine prescription refill", "Basic lab order if needed"]
        : ["慢病复诊", "常规续药", "必要时开具基础化验"]
    };
  }

  if (isDigestive) {
    return {
      reason: english
        ? "This hospital can assess abdominal pain, diarrhea, vomiting, and dehydration risk, with lab tests available if needed."
        : korean
          ? "복통, 설사, 구토, 탈수 위험을 평가할 수 있으며 필요 시 검사도 가능합니다."
          : "这家医院可评估腹痛、腹泻、呕吐和脱水风险，必要时可做化验检查。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "A gastroenterology outpatient slot is reserved today. Arrive 20 minutes early for check-in.", "已为您预留今日消化内科号源，建议提前20分钟到院取号。", "오늘 소화기내과 외래 예약 가능 시간이 확보되었습니다. 20분 일찍 도착하세요."),
      preparation: localText(english, korean, "Bring your ID card, insurance card, and note when diarrhea or abdominal pain started.", "请带身份证、医保卡，并记录腹泻或腹痛开始时间。", "신분증, 보험카드, 설사나 복통이 시작된 시간을 메모해 오세요."),
      services: korean
        ? ["소화기 외래 평가", "수분 보충 및 약물 안내", "필요 시 검사"]
        : english
        ? ["Digestive outpatient assessment", "Hydration and medicine guidance", "Lab tests if needed"]
        : ["消化门诊评估", "补液和用药指导", "必要时化验检查"]
    };
  }

  if (isSkin) {
    return {
      reason: english
        ? "This hospital has dermatology and allergy care, suitable for spreading rash, itching, or suspected allergy."
        : korean
          ? "피부과와 알레르기 진료가 있어 발진 확산, 가려움, 알레르기 의심 상황에 적합합니다."
          : "这家医院有皮肤科和过敏相关门诊，适合皮疹扩大、瘙痒或疑似过敏的情况。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "A dermatology/allergy slot is reserved today. Show your visit pass at reception.", "已为您预留今日皮肤科/过敏门诊号源，到院后出示就诊凭证。", "오늘 피부과/알레르기 진료 시간이 확보되었습니다. 접수처에서 방문 확인증을 제시하세요."),
      preparation: localText(english, korean, "Avoid scratching if possible and bring photos of how the rash changed.", "尽量避免抓挠，可带上皮疹变化的照片。", "가능하면 긁지 말고 발진 변화 사진을 가져오세요."),
      services: korean
        ? ["피부 평가", "알레르기 병력 확인", "외용 또는 경구 약 안내"]
        : english
        ? ["Skin assessment", "Allergy history review", "External or oral medicine guidance"]
        : ["皮肤评估", "过敏史核对", "外用或口服用药指导"]
    };
  }

  if (isUrinary) {
    return {
      reason: english
        ? "This secondary hospital can run urine tests and prescribe antibiotics when clinically appropriate."
        : korean
          ? "이 2차 병원 (일반 종합병원)은 소변검사를 하고 필요 시 항생제 처방을 진행할 수 있습니다."
          : "这家二级医院可做尿检评估，并在需要时开具抗生素处方。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "A urology/general internal medicine slot is reserved today.", "已为您预留今日泌尿外科/普通内科号源。", "오늘 비뇨의학과/일반내과 진료 시간이 확보되었습니다."),
      preparation: localText(english, korean, "Bring your ID card, insurance card, and note any fever, back pain, or painful urination.", "请携带身份证、医保卡，并记录是否发热、腰痛或尿痛。", "신분증, 보험카드, 발열·허리 통증·배뇨통 여부를 메모해 오세요."),
      services: korean
        ? ["소변검사", "항생제 처방 가능 여부 평가", "필요 시 추가 검사"]
        : english
        ? ["Urine test", "Antibiotic prescription review", "Further tests if needed"]
        : ["尿检化验", "抗生素处方评估", "必要时进一步检查"]
    };
  }

  if (isMuscleBone) {
    return {
      reason: english
        ? result?.risk === "MEDIUM"
          ? "This secondary hospital can assess suspected sprain or fracture and arrange X-ray imaging if needed."
          : "This nearby center can assess sprains, back pain, and joint discomfort first, and arrange referral if imaging is needed."
        : korean
          ? result?.risk === "MEDIUM"
            ? "이 2차 병원 (일반 종합병원)은 염좌 또는 골절 의심을 평가하고 필요 시 X-ray 검사를 진행할 수 있습니다."
            : "가까운 센터에서 염좌, 허리 통증, 관절 불편감을 먼저 평가하고 영상검사가 필요하면 의뢰를 도울 수 있습니다."
          : result?.risk === "MEDIUM"
            ? "这家二级医院可评估疑似扭伤或骨折，并按需安排X光检查。"
            : "这家社区卫生服务中心距离近，可先评估扭伤、腰背痛和关节不适，如需影像检查再协助转诊。",
      address: recommendation.address,
      phone: recommendation.phone,
      route: `${recommendation.distance} · ${recommendation.travel}`,
      registration: localText(english, korean, "A rehabilitation/orthopedics assessment slot is held today.", "已为您保留今日骨科/康复评估号源。", "오늘 정형외과/재활 평가 시간이 확보되었습니다."),
      preparation: localText(english, korean, "Limit strenuous movement before the visit and bring any previous imaging reports if available.", "就诊前尽量减少剧烈活动，如有既往影像报告可一并携带。", "진료 전 무리한 움직임을 줄이고 이전 영상 결과가 있으면 가져오세요."),
      services: korean
        ? result?.risk === "MEDIUM"
          ? ["손상 평가", "필요 시 X-ray 검사", "고정 또는 처치 안내"]
          : ["염좌 및 통증 평가", "붕대 또는 외용약 안내", "필요 시 영상검사 의뢰"]
        : english
        ? result?.risk === "MEDIUM"
          ? ["Injury assessment", "X-ray if needed", "Splint or care instructions"]
          : ["Sprain and pain assessment", "Bandage or external medicine advice", "Referral for imaging if needed"]
        : result?.risk === "MEDIUM"
          ? ["损伤评估", "必要时X光检查", "固定或处理建议"]
          : ["扭伤疼痛评估", "包扎或外用药建议", "必要时转诊影像检查"]
    };
  }

  return {
    reason: english
      ? isRespiratory
        ? "This nearby secondary hospital can evaluate fever and cough today, and can refer you upward if symptoms look more serious."
        : "This nearby clinic is suitable for a first outpatient assessment with same-day availability."
      : korean
        ? isRespiratory
          ? "가까운 2차 병원 (일반 종합병원)에서 오늘 발열과 기침을 평가할 수 있으며, 더 심각해 보이면 상급 병원 의뢰를 도울 수 있습니다."
          : "가까운 1차 진료기관에서 오늘 일반 외래 평가를 먼저 받기에 적합합니다."
        : isRespiratory
        ? "这家附近二级医院今天可评估发烧咳嗽，如发现症状较重也能协助上转。"
        : "这家附近门诊适合先做普通门诊评估，今天有号源。",
    address: recommendation.address,
    phone: recommendation.phone,
    route: `${recommendation.distance} · ${recommendation.travel}`,
    registration: localText(english, korean, "A same-day respiratory/general practice slot is held for you.", "已为您保留今日全科/呼吸相关门诊号源。", "오늘 호흡기/일반 진료 시간이 확보되었습니다."),
    preparation: localText(english, korean, "Bring your ID card, insurance card, mask, and current medicine list.", "请携带身份证、医保卡、口罩和当前用药清单。", "신분증, 보험카드, 마스크, 현재 복용 약 목록을 가져오세요."),
    services: korean
      ? ["발열·기침 평가", "기본 진찰", "필요 시 의뢰 지원"]
      : english
      ? ["Fever and cough assessment", "Basic examination", "Referral support if needed"]
      : ["发热咳嗽评估", "基础检查", "必要时协助转诊"]
  };
}

function visitPlanFor(
  recommendation: CareRecommendation,
  result: TriageResult | null,
  decision: HospitalShareDecision,
  english: boolean,
  korean = false
) {
  const isEmergency = result?.risk === "HIGH";
  const isSpecialist = result?.risk === "SPECIALIST";
  const isChronicCare = result?.department.includes("General Practice");
  const appointmentTime = isEmergency
    ? korean
      ? "즉시 응급 접수"
      : english
      ? "Immediate emergency reception"
      : "急诊即时接诊"
    : isSpecialist
      ? korean
        ? "오늘 16:20"
        : english
        ? "Today 16:20"
        : "今天16:20"
      : isChronicCare
        ? korean
          ? "오늘 15:30"
          : english
          ? "Today 15:30"
          : "今天15:30"
        : korean
          ? "오늘 14:40"
          : english
          ? "Today 14:40"
          : "今天14:40";

  return {
    appointmentTime,
    arrangement: isEmergency
      ? english
        ? "Emergency reception is open. Leave now and go to the emergency triage desk."
        : korean
          ? "응급 접수가 가능합니다. 지금 출발하여 도착 후 응급 분류 데스크로 가세요."
          : "急诊已可接诊，请立即出发，到院后前往急诊分诊台。"
      : isSpecialist
        ? english
          ? `${appointmentTime} at ${recommendation.hospital}. A hospital appointment slot has been reserved.`
          : korean
            ? `${appointmentTime}, ${recommendation.hospital}. 전문 병원 예약 가능 시간이 확보되었습니다.`
            : `${appointmentTime}，${recommendation.hospital}，已为您预留医院号源。`
        : english
          ? `${appointmentTime} at ${recommendation.hospital}. The care team has been notified and a slot is held for you.`
          : korean
            ? `${appointmentTime}, ${recommendation.hospital}. 진료팀에 알림이 전달되었고 예약 가능 시간이 확보되었습니다.`
            : `${appointmentTime}，${recommendation.hospital}，已通知接诊点并为您预留号源。`,
    depart: isEmergency
      ? english
        ? "Leave now. If symptoms worsen on the way, call emergency services."
        : korean
          ? "지금 출발하세요. 이동 중 증상이 악화되면 120으로 연락하세요."
          : "请立即出发。途中如症状加重，请拨打120。"
      : english
        ? "Leave about 35 minutes before the appointment, or now if you prefer extra time."
        : korean
          ? "예약 약 35분 전에 출발하세요. 여유 있게 가려면 지금 출발해도 됩니다."
          : "建议提前约35分钟出发；如果想更从容，也可以现在出发。",
    arrival: decision === "shared"
      ? english
        ? "Show your visit pass at reception. The doctor can view the prepared records directly."
        : korean
          ? "접수처에서 방문 확인증을 제시하세요. 의사가 준비된 기록을 바로 확인할 수 있습니다."
          : "到达后向前台出示就诊凭证，医生可直接查看已准备的病历。"
      : english
        ? "Show your visit pass and bring a record summary, or share records at reception."
        : korean
          ? "방문 확인증을 제시하고 기록 요약을 지참하거나, 접수처에서 다시 기록을 공유할 수 있습니다."
          : "到达后出示就诊凭证，并携带病历摘要；也可在前台再共享病历。"
  };
}

function followUpPlanFor(
  result: TriageResult | null,
  patient: PatientProfile | null,
  english: boolean,
  location: string,
  korean = false
) {
  const cityConfig = cityConfigFor(location);
  const tertiaryHospital = referralHospitalLabel(cityConfig.facilities.tertiary, "tertiary", english, korean);
  const secondaryHospital = referralHospitalLabel(cityConfig.facilities.secondary, "secondary", english, korean);
  const patientLabel = patient ? displayPatientName(patient, english, korean) : korean ? "환자" : english ? "the patient" : "患者";
  const condition = patient ? displayPatientValue(patient.condition, english, korean) : korean ? "현재 건강 기록" : english ? "current health record" : "当前健康记录";
  const allergy = patient ? displayPatientValue(patient.allergy, english, korean) : korean ? "알레르기 기록" : english ? "allergy record" : "过敏记录";
  const pathway = result?.probabilities.join(" ").toLowerCase() ?? "";

  if (result?.risk === "HIGH") {
    return {
      intro: localText(
        english,
        korean,
        `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan keeps the emergency visit connected to higher-level care if admission is needed.`,
        `结合${patientLabel}的${condition}和${allergy}记录，这份方案会在急诊评估后继续衔接上级治疗。`,
        `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로, 입원이 필요할 경우 응급 진료가 상급 치료로 이어지도록 준비합니다.`
      ),
      when: localText(
        english,
        korean,
        "If the emergency team recommends observation, admission, imaging, or specialist review.",
        "如果急诊医生建议留观、住院、影像检查或专科会诊。",
        "응급팀이 관찰, 입원, 영상검사 또는 전문의 진료를 권고하는 경우."
      ),
      hospital: tertiaryHospital,
      department: localText(english, korean, "Emergency Medicine / General Internal Medicine", "急诊科 / 普通内科", "응급의학 / 일반내과"),
      support: korean
        ? ["진료 요약을 준비", "필요 시 관찰 또는 입원 병상 조율", "가족에게 응급 경로와 연락처 표시"]
        : english
        ? ["Keep the visit summary ready", "Coordinate observation or inpatient beds if needed", "Show family the emergency route and contact number"]
        : ["整理急诊就诊摘要", "必要时协助协调留观或住院床位", "让家人查看急诊路线和联系电话"]
    };
  }

  if (result?.risk === "SPECIALIST") {
    return {
      intro: localText(
        english,
        korean,
        `Based on ${patientLabel}'s ${condition} record and ${allergy}, the follow-up plan keeps specialist medicine review connected.`,
        `结合${patientLabel}的${condition}和${allergy}记录，后续方案会重点衔接专科用药复核。`,
        `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 전문 약물 검토가 끊기지 않도록 연결합니다.`
      ),
      when: localText(
        english,
        korean,
        "If side effects increase, the medicine cannot be dispensed, or symptoms change before the next review.",
        "如果用药反应加重、药品暂时无法取得，或复诊前症状发生变化。",
        "부작용이 심해지거나 약 수령이 어렵거나 다음 진료 전 증상이 변하는 경우."
      ),
      hospital: tertiaryHospital,
      department: localText(english, korean, "Oncology / Specialist Medicine Clinic", "肿瘤科 / 专科用药门诊", "종양내과 / 전문 약물 클리닉"),
      support: korean
        ? ["최신 진료 요약 준비", "전문 진료 예약 지원", "가족에게 새 경로와 시간 알림"]
        : english
        ? ["Prepare the latest visit summary", "Help reserve a specialist appointment", "Remind family of the new route and time"]
        : ["整理本次就诊摘要", "协助预约上级专科号源", "同步提醒家人新的路线和时间"]
    };
  }

  if (result?.risk === "LOW-MEDIUM" && pathway.includes("digestive")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan starts with a nearby clinic and prepares a secondary-hospital option only if digestive symptoms continue.`, `结合${patientLabel}的${condition}和${allergy}记录，建议先在附近基层门诊评估；只有肠胃症状持续时再准备二级医院方案。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 먼저 가까운 1차 병원 (의원, 보건소)에서 평가하고, 소화기 증상이 지속될 때만 2차 병원 (일반 종합병원) 옵션을 준비합니다.`),
      when: localText(english, korean, "If diarrhea lasts more than 2-3 days, abdominal pain gets worse, vomiting prevents drinking water, or fever appears.", "如果腹泻超过2-3天、腹痛加重、呕吐导致无法正常喝水，或出现发热。", "설사가 2-3일 이상 지속되거나 복통이 악화되거나 구토로 수분 섭취가 어렵거나 열이 나는 경우."),
      hospital: secondaryHospital,
      department: localText(english, korean, "Gastroenterology / General Internal Medicine", "消化内科 / 普通内科", "소화기내과 / 일반내과"),
      support: korean
        ? ["1차 진료 요약 저장", "2차 병원 외래 예약 지원", "동의 후 약물·알레르기 메모 전달"]
        : english
        ? ["Save the clinic visit summary", "Help find a secondary-hospital outpatient slot", "Carry medication and allergy notes after your confirmation"]
        : ["保存基层首诊摘要", "协助查找二级医院门诊号源", "经您确认后带上用药和过敏信息"]
    };
  }

  if (result?.risk === "LOW-MEDIUM" && pathway.includes("skin")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan starts with local primary care and prepares a secondary-hospital option if the rash changes.`, `结合${patientLabel}的${condition}和${allergy}记录，建议先在附近基层门诊处理；如果皮疹变化再准备二级医院方案。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 먼저 가까운 1차 병원 (의원, 보건소)에서 보고, 발진 변화가 있으면 2차 병원 (일반 종합병원) 옵션을 준비합니다.`),
      when: localText(english, korean, "If the rash spreads, itching becomes severe, swelling appears, or breathing discomfort develops.", "如果皮疹扩大、瘙痒明显加重、出现肿胀，或开始呼吸不适。", "발진이 퍼지거나 가려움이 심해지거나 부종 또는 호흡 불편감이 생기는 경우."),
      hospital: secondaryHospital,
      department: localText(english, korean, "Dermatology / Allergy Clinic", "皮肤科 / 过敏门诊", "피부과 / 알레르기 클리닉"),
      support: korean
        ? ["발진 변화 사진 저장", "2차 병원 피부과 예약 지원", "업데이트된 계획을 가족에게 공유"]
        : english
        ? ["Keep photos of the rash changes", "Help reserve a secondary-hospital dermatology slot", "Share the updated plan with family"]
        : ["保存皮疹变化照片", "协助预约二级医院皮肤科号源", "把更新后的计划同步给家人"]
    };
  }

  if (result?.risk === "LOW-MEDIUM" && pathway.includes("respiratory")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan uses a nearby clinic first and keeps a secondary-hospital respiratory option ready if symptoms do not settle.`, `结合${patientLabel}的${condition}和${allergy}记录，建议先在附近基层门诊评估；如果呼吸道症状没有缓解，再准备二级医院方案。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 먼저 가까운 1차 병원 (의원, 보건소)을 이용하고, 호흡기 증상이 가라앉지 않으면 2차 병원 (일반 종합병원) 호흡기 진료 옵션을 준비합니다.`),
      when: localText(english, korean, "If fever or cough is not improving after 3-5 days, or if chest tightness, shortness of breath, or persistent high fever appears.", "如果发热或咳嗽3-5天后仍无改善，或出现胸闷、气短、持续高热等情况。", "열이나 기침이 3-5일 뒤에도 호전되지 않거나 흉부 답답함, 숨참, 지속 고열이 나타나는 경우."),
      hospital: secondaryHospital,
      department: localText(english, korean, "Respiratory Clinic / General Internal Medicine", "呼吸科门诊 / 普通内科", "호흡기 클리닉 / 일반내과"),
      support: korean
        ? ["1차 진료 요약 준비", "2차 병원 예약 지원", "이동 및 약 수령 대안 표시", "가족이 업데이트된 계획 확인"]
        : english
        ? ["Prepare the clinic visit summary", "Help book a secondary-hospital slot", "Show available transport and pickup options", "Let family view the updated plan"]
        : ["整理基层首诊摘要", "协助预约二级医院号源", "展示出行和取药备选方案", "让家人查看更新后的计划"]
    };
  }

  if (result?.department.includes("General Practice")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, the follow-up plan focuses on safer chronic-care review.`, `结合${patientLabel}的${condition}和${allergy}记录，后续方案会重点减轻慢病复诊负担。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 만성질환 진료를 더 안전하게 이어가도록 합니다.`),
      when: localText(english, korean, "If glucose or blood pressure stays abnormal, medicine needs adjustment, or new symptoms appear.", "如果血糖或血压持续异常、需要调整用药，或出现新的不适。", "혈당 또는 혈압이 계속 비정상이거나 약 조정이 필요하거나 새로운 증상이 생기는 경우."),
      hospital: tertiaryHospital,
      department: localText(english, korean, "Endocrinology / General Internal Medicine", "内分泌科 / 普通内科", "내분비내과 / 일반내과 (Endocrinology / Internal Medicine)"),
      support: korean
        ? ["최근 측정값과 처방 준비", "더 빠른 상급 병원 예약 찾기", "확인 후 기록 요약 전달"]
        : english
        ? ["Prepare recent readings and prescriptions", "Find an earlier higher-level appointment", "Carry over the record summary after your confirmation"]
        : ["整理近期指标和处方", "查找更早的上级医院号源", "经您确认后把病历摘要带到新医院"]
    };
  }

  if (result?.department.includes("Gastroenterology")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan prepares the next step if digestive symptoms continue.`, `结合${patientLabel}的${condition}和${allergy}记录，这份方案用于肠胃症状持续时提前准备。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 소화기 증상이 지속될 때의 다음 단계를 준비합니다.`),
      when: localText(english, korean, "If abdominal pain gets worse, diarrhea lasts more than 3 days, vomiting prevents drinking water, or fever appears.", "如果腹痛加重、腹泻超过3天、呕吐导致无法正常喝水，或出现发热。", "복통이 악화되거나 설사가 3일 이상 지속되거나 구토로 수분 섭취가 어렵거나 열이 나는 경우."),
      hospital: tertiaryHospital,
      department: localText(english, korean, "Gastroenterology", "消化内科", "소화기내과"),
      support: korean
        ? ["첫 진료 요약 준비", "상급 소화기내과 예약 찾기", "확인 후 약물 및 알레르기 메모 전달"]
        : english
        ? ["Prepare the first-visit summary", "Find a higher-level gastroenterology slot", "Carry medication and allergy notes after your confirmation"]
        : ["整理首次就诊摘要", "查找上级消化内科号源", "经您确认后带上用药和过敏信息"]
    };
  }

  if (result?.department.includes("Dermatology")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan keeps allergy and skin changes easy to share with the next doctor.`, `结合${patientLabel}的${condition}和${allergy}记录，后续方案会方便医生查看过敏史和皮疹变化。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 알레르기 병력과 피부 변화를 다음 의사에게 쉽게 전달할 수 있게 합니다.`),
      when: localText(english, korean, "If rash spreads quickly, swelling of lips or eyes appears, or breathing discomfort develops.", "如果皮疹快速扩大，出现嘴唇或眼周肿胀，或开始呼吸不适。", "발진이 빠르게 퍼지거나 입술·눈 주변 부종 또는 호흡 불편감이 생기는 경우."),
      hospital: tertiaryHospital,
      department: localText(english, korean, "Dermatology / Allergy Clinic", "皮肤科 / 过敏门诊", "피부과 / 알레르기 클리닉"),
      support: korean
        ? ["발진 사진과 알레르기 병력 정리", "상급 전문 진료 예약 지원", "업데이트된 계획을 가족에게 공유"]
        : english
        ? ["Organize rash photos and allergy history", "Help reserve a higher-level specialist slot", "Share the updated plan with family"]
        : ["整理皮疹照片和过敏史", "协助预约上级专科号源", "把更新后的计划同步给家人"]
    };
  }

  if (result?.department.includes("Orthopedics")) {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan prepares referral if pain or movement limits increase.`, `结合${patientLabel}的${condition}和${allergy}记录，这份方案用于疼痛或活动受限加重时提前准备。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 통증이나 움직임 제한이 심해질 때 의뢰를 준비합니다.`),
      when: localText(english, korean, "If pain becomes severe, swelling increases, walking becomes difficult, or numbness appears.", "如果疼痛明显加重、肿胀扩大、行走困难，或出现麻木。", "통증이 심해지거나 부종이 커지거나 걷기 어렵거나 저림이 나타나는 경우."),
      hospital: secondaryHospital,
      department: localText(english, korean, "Orthopedics / Rehabilitation", "骨科 / 康复门诊", "정형외과 / 재활"),
      support: korean
        ? ["첫 평가 기록 준비", "영상검사 또는 전문 진료 예약 옵션 찾기", "근처 이동 및 약 수령 선택지 표시"]
        : english
        ? ["Prepare first assessment notes", "Find imaging or specialist appointment options", "Show transport and pickup choices nearby"]
        : ["整理首次评估记录", "查找影像检查或专科号源", "展示附近出行和取药选择"]
    };
  }

  if (result?.risk === "LOW-MEDIUM") {
    return {
      intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan starts with nearby primary care and keeps a secondary-hospital option ready if symptoms do not improve.`, `结合${patientLabel}的${condition}和${allergy}记录，建议先在附近基层门诊评估；如果没有改善，再准备二级医院方案。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 먼저 가까운 1차 병원 (의원, 보건소)을 이용하고, 호전이 없으면 2차 병원 (일반 종합병원) 옵션을 준비합니다.`),
      when: localText(english, korean, "If symptoms get worse, do not improve after several days, or new warning signs appear.", "如果症状加重、数天后仍无改善，或出现新的预警症状。", "증상이 악화되거나 며칠 뒤에도 나아지지 않거나 새로운 경고 증상이 생기는 경우."),
      hospital: secondaryHospital,
      department: localText(english, korean, "General Internal Medicine", "普通内科", "일반내과"),
      support: korean
        ? ["첫 진료 요약 저장", "2차 병원 외래 예약 찾기", "근처 약 수령 옵션 표시"]
        : english
        ? ["Save the first-visit summary", "Help find a secondary-hospital outpatient slot", "Show nearby medicine pickup options"]
        : ["保存首次就诊摘要", "协助查找二级医院门诊号源", "展示附近取药选择"]
    };
  }

  return {
    intro: localText(english, korean, `Based on ${patientLabel}'s ${condition} record and ${allergy}, this plan is ready in case respiratory symptoms do not settle.`, `结合${patientLabel}的${condition}和${allergy}记录，这份方案用于发热咳嗽等症状没有缓解时提前准备。`, `${patientLabel}의 ${condition} 및 ${allergy} 기록을 바탕으로 호흡기 증상이 가라앉지 않을 경우를 미리 준비합니다.`),
    when: localText(english, korean, "If fever or cough is not improving after 5 days, or if chest tightness, shortness of breath, or persistent high fever appears.", "如果发热或咳嗽5天后仍无改善，或出现胸闷、气短、持续高热等情况。", "열이나 기침이 5일 후에도 호전되지 않거나 흉부 답답함, 숨참, 지속 고열이 나타나는 경우."),
    hospital: secondaryHospital,
    department: localText(english, korean, "Respiratory and Critical Care Medicine", "呼吸与危重症医学科", "호흡기·중환자의학과"),
    support: korean
      ? ["오늘 진료 요약 준비", "상급 병원 예약 지원", "이동 및 약 수령 대안 표시", "가족이 업데이트된 계획 확인"]
      : english
      ? ["Prepare today’s visit summary", "Help book a higher-level hospital slot", "Show available transport and pickup options", "Let family view the updated plan"]
      : ["整理今天的就诊摘要", "协助预约上级医院号源", "展示出行和取药备选方案", "让家人查看更新后的计划"]
  };
}

function medicinePlanFor(recommendation: CareRecommendation, result: TriageResult | null, english: boolean, korean = false) {
  if (result?.risk === "SPECIALIST") {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["전문 처방 갱신 검토", "부작용 안내서", "다음 진료 알림"]
        : english
        ? ["Specialist medicine refill review", "Side-effect guidance sheet", "Next review reminder"]
        : ["专科续方审核", "用药反应说明", "下次复诊提醒"],
      note: korean
        ? "전문의 검토 후 병원 약국에서 처방을 확인합니다."
        : english
        ? "The hospital pharmacy will confirm the prescription after the specialist review."
        : "专科医生复核后，院内药房会确认是否可直接取药。"
    };
  }

  if (result?.department.includes("General Practice")) {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["만성질환 약 처방 갱신", "필요 시 혈당 시험지", "추적 진료 알림"]
        : english
        ? ["Chronic-care refill", "Blood glucose test strips if needed", "Follow-up reminder"]
        : ["慢病续药", "必要时血糖试纸", "复诊提醒"],
      note: korean
        ? "약사는 조제 전 현재 복용 약과 알레르기 기록을 다시 확인합니다."
        : english
        ? "The pharmacist will confirm your current medicine and allergy record before dispensing."
        : "药师会在取药前再次核对当前用药和过敏史。"
    };
  }

  if (result?.risk === "HIGH") {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["응급 관찰 약품 패키지", "이부프로펜 서방캡슐 (Ibuprofen)", "암브록솔 경구액 (Ambroxol)"]
        : english
        ? ["Emergency observation medicine pack", "Ibuprofen sustained-release capsules", "Ambroxol oral solution"]
        : ["急诊留观用药包", "布洛芬缓释胶囊", "盐酸氨溴索口服溶液"],
      note: korean
        ? "응급 의사가 이번 데모 방문용 임시 수령 목록을 보냈습니다. 의사와 약사의 지시에 따라 사용하세요."
        : english
        ? "The emergency doctor has sent a temporary pickup list for this demo visit. Use only as instructed by the doctor and pharmacist."
        : "急诊医生已回馈本次演示取药清单，需按医生和药师说明使用。"
    };
  }

  if (result?.department.includes("Gastroenterology")) {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["경구 수분 보충염 (ORS)", "소화기 증상 완화 약", "식이 및 수분 보충 안내"]
        : english
        ? ["Oral rehydration salts", "Digestive-care medicine", "Diet and hydration guidance"]
        : ["口服补液盐", "肠胃护理用药", "饮食和补水指导"],
      note: korean
        ? "의사가 소화기 증상 관리 처방을 병원 약국으로 보냈습니다."
        : english
        ? "The doctor has sent a digestive-care prescription to the hospital pharmacy."
        : "医生已将肠胃护理用药需求回馈给院内药房。"
    };
  }

  if (result?.department.includes("Dermatology")) {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["항알레르기 약", "외용 피부 연고", "알레르기 알림 카드"]
        : english
        ? ["Anti-allergy medicine", "External skin ointment", "Allergy reminder card"]
        : ["抗过敏用药", "外用皮肤药膏", "过敏提醒卡"],
      note: korean
        ? "의사가 알레르기 기록을 확인한 뒤 피부/알레르기 약 목록을 보냈습니다."
        : english
        ? "The doctor has sent the skin/allergy medicine list after checking the allergy record."
        : "医生已结合过敏史回馈皮肤/过敏用药清单。"
    };
  }

  if (result?.department.includes("Urology")) {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["소변검사 후 항생제", "수분 섭취 안내", "재진 알림"]
        : english
        ? ["Antibiotic after urine test", "Hydration guidance", "Follow-up reminder"]
        : ["尿检后抗生素用药", "补水指导", "复诊提醒"],
      note: korean
        ? "의사가 검사 결과에 따라 요로감염 처방을 병원 약국으로 보냅니다."
        : english
        ? "The doctor will send the urinary-infection prescription after reviewing the urine test."
        : "医生会根据化验结果回馈尿路感染相关用药。"
    };
  }

  if (result?.department.includes("Orthopedics")) {
    return {
      issuedBy: recommendation.hospital,
      currentHasStock: true,
      items: korean
        ? ["외용 진통 패치", "탄력 붕대", "재진 알림"]
        : english
        ? ["External pain relief patch", "Elastic bandage", "Recheck reminder"]
        : ["外用止痛贴", "弹力绷带", "复查提醒"],
      note: korean
        ? "접수 의료진이 통증 완화와 지지 고정을 위한 1차 수령 목록을 보냈습니다."
        : english
        ? "The clinician has sent a first-care pickup list for pain relief and support."
        : "接诊医生已回馈缓解疼痛和固定支持的取药清单。"
    };
  }

  return {
    issuedBy: recommendation.hospital,
    currentHasStock: true,
    items: korean
      ? ["필요 시 해열제", "기침 완화 약", "코/목 관리 용품"]
      : english
      ? ["Fever relief medicine if needed", "Cough relief medicine", "Nasal/throat care supplies"]
      : ["必要时退热药", "止咳祛痰药", "鼻咽护理用品"],
    note: korean
      ? "의사가 일반 호흡기 증상 관리 처방을 약국으로 보냈습니다."
      : english
      ? "The doctor has sent a routine respiratory-care prescription to the pharmacy."
      : "医生已将常规呼吸道用药需求回馈给药房。"
  };
}

function medicinePickupRowsFor(
  recommendation: CareRecommendation,
  result: TriageResult | null,
  english: boolean,
  copy: PatientCopy,
  location: string,
  korean = false
) {
  const cityConfig = cityConfigFor(location);
  const plan = medicinePlanFor(recommendation, result, english, korean);
  const visitHospitalPharmacy = {
    institution: korean ? `${recommendation.hospital} 약국` : english ? `${recommendation.hospital} Pharmacy` : `${recommendation.hospital}药房`,
    level: localText(english, korean, "Visit hospital", "本院药房", "방문 병원"),
    type: localText(english, korean, "Hospital pharmacy", "医院药房", "병원 약국"),
    distance: recommendation.distance,
    travel: localText(english, korean, "Same building after consultation", "就诊后院内取药", "진료 후 같은 건물에서 수령"),
    stockStatus: plan.currentHasStock ? copy.hasStock : copy.lowStock,
    prescriptionStatus: plan.currentHasStock ? copy.canDispense : copy.needsReferral,
    nextSlot: localText(english, korean, "After your appointment", "就诊后", "진료 후"),
    selectable: plan.currentHasStock,
    sameHospital: true
  };

  const nearbyRows = [
    ...cityConfig.nearbyPickups.map((pickup) => ({
      institution: korean ? displayHospitalName(pickup.enName, english, true) : english ? pickup.enName : pickup.zhName,
      level: korean ? displayPatientValue(pickup.levelEn, english, true) : english ? pickup.levelEn : pickup.levelZh,
      type: korean ? displayPatientValue(pickup.typeEn, english, true) : english ? pickup.typeEn : pickup.typeZh,
      distance: pickup.distance,
      travel: korean
        ? pickup.travelEn
            .replace("About ", "약 ")
            .replace(" minutes on foot", "분 도보")
            .replace(" minutes by taxi", "분 택시")
        : english ? pickup.travelEn : pickup.travelZh,
      stockStatus: copy.hasStock,
      prescriptionStatus: copy.canDispense,
      nextSlot: korean
        ? pickup.nextSlotEn.replace("Today until", "오늘").replace("Today", "오늘").replace("Tomorrow", "내일")
        : english ? pickup.nextSlotEn : pickup.nextSlotZh,
      selectable: true,
      sameHospital: false
    })),
    {
      institution: english
        ? `${cityConfig.facilities.secondary.enName} Outpatient Pharmacy`
        : korean
          ? `${facilityName(cityConfig.facilities.secondary, english, true)} 외래 약국`
        : `${cityConfig.facilities.secondary.zhName}门诊药房`,
      level: localText(english, korean, "Secondary hospital", "二级/综合医院", "2차 병원 (일반 종합병원)"),
      type: localText(english, korean, "Hospital pharmacy", "医院药房", "병원 약국"),
      distance: cityConfig.facilities.secondary.distance,
      travel: estimatedTaxiTravel(cityConfig.facilities.secondary.distance, english, korean).replace(/^about\s+/i, "About "),
      stockStatus: copy.hasStock,
      prescriptionStatus: copy.canDispense,
      nextSlot: localText(english, korean, "Tomorrow 09:20", "明天09:20", "내일 09:20"),
      selectable: true,
      sameHospital: false
    },
    {
      institution: english
        ? `${cityConfig.facilities.tertiary.enName} Outpatient Pharmacy`
        : korean
          ? `${facilityName(cityConfig.facilities.tertiary, english, true)} 외래 약국`
        : `${cityConfig.facilities.tertiary.zhName}门诊药房`,
      level: localText(english, korean, "Top-tier hospital", "三甲", "3차 병원 (상급종합병원)"),
      type: localText(english, korean, "Hospital pharmacy", "医院药房", "병원 약국"),
      distance: cityConfig.facilities.tertiary.distance,
      travel: estimatedTaxiTravel(cityConfig.facilities.tertiary.distance, english, korean).replace(/^about\s+/i, "About "),
      stockStatus: result?.risk === "SPECIALIST" ? copy.hasStock : copy.lowStock,
      prescriptionStatus: result?.risk === "SPECIALIST" ? copy.canDispense : copy.needsReferral,
      nextSlot: localText(english, korean, "Today 16:40", "今天16:40", "오늘 16:40"),
      selectable: result?.risk === "SPECIALIST",
      sameHospital: false
    }
  ];

  const rows = [visitHospitalPharmacy, ...nearbyRows];
  return rows.sort((a, b) => {
    if (a.sameHospital) {
      return -1;
    }
    if (b.sameHospital) {
      return 1;
    }
    return Number.parseFloat(a.distance) - Number.parseFloat(b.distance);
  });
}

function signalClasses(tone: CareRecommendation["tone"]) {
  if (tone === "red") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (tone === "amber") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function JourneyPage() {
  const { language } = useLanguage();
  const showKorean = language === "ko";
  const english = language === "en";
  const copy: PatientCopy = showKorean ? { ...patientCopy.en, ...patientKoreanCopy } : english ? patientCopy.en : patientCopy.zh;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIdentityMode, setSelectedIdentityMode] = useState<IdentityMode | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedScopes, setSelectedScopes] = useState(["Lab Tests", "Prescription History", "Allergy Info"]);
  const [selectedDuration, setSelectedDuration] = useState("24 hours");
  const [contractRunning, setContractRunning] = useState(false);
  const [contractSequence, setContractSequence] = useState<SequenceEntry[]>([]);
  const [consentTxHash, setConsentTxHash] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [selectedSymptomGroup, setSelectedSymptomGroup] = useState<SymptomSampleGroupId | null>(null);
  const [symptomDuration, setSymptomDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState("moderate");
  const [location, setLocation] = useState("Chengdu");
  const [symptomFlags, setSymptomFlags] = useState({
    breathing: false,
    chestPain: false,
    neurological: false
  });
  const [symptomAuditLogged, setSymptomAuditLogged] = useState(false);
  const [triageRunning, setTriageRunning] = useState(false);
  const [triageSequence, setTriageSequence] = useState<SequenceEntry[]>([]);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [hospitalShareDecision, setHospitalShareDecision] = useState<HospitalShareDecision>(null);
  const [hospitalShareWorking, setHospitalShareWorking] = useState(false);
  const [hospitalDetailsOpen, setHospitalDetailsOpen] = useState(false);
  const [followUpPlanOpen, setFollowUpPlanOpen] = useState(false);
  const [routeDemoOpen, setRouteDemoOpen] = useState(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [familyShareOpen, setFamilyShareOpen] = useState(false);
  const [familyShareReady, setFamilyShareReady] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [, setAuditLog] = useState<AuditEntry[]>([]);

  const progressPercent = ((currentStep - 1) / (copy.stepLabels.length - 1)) * 100;
  const currentRecommendation = recommendationFor(triageResult, english, copy, location, showKorean);
  const currentRecommendationPlaceLabel =
    showKorean || english
      ? `${currentRecommendation.hospital} (${currentRecommendation.facilityLevel})`
      : `${currentRecommendation.hospital}（${currentRecommendation.facilityLevel}）`;
  const isEmergencyRecommendation = currentRecommendation.facilityKind === "emergency";
  const recommendationEvidence = recommendationEvidenceFor({
    recommendation: currentRecommendation,
    patient: selectedPatient,
    symptoms,
    symptomDuration,
    severity,
    english,
    korean: showKorean
  });
  const hospitalDetails = hospitalDetailsFor(currentRecommendation, triageResult, english, showKorean);
  const visitPlan = visitPlanFor(currentRecommendation, triageResult, hospitalShareDecision, english, showKorean);
  const followUpPlan = followUpPlanFor(triageResult, selectedPatient, english, location, showKorean);
  const medicinePlan = medicinePlanFor(currentRecommendation, triageResult, english, showKorean);
  const institutionRows = medicinePickupRowsFor(currentRecommendation, triageResult, english, copy, location, showKorean);
  const selectedDurationLabel = durationOptions(english, showKorean).find((item) => item.value === selectedDuration)?.label ?? selectedDuration;

  const contractMessages = [copy.savingChoice, copy.confirmingViewer, copy.protectingRecords, copy.sharingReady];
  const triageMessages = [
    { label: copy.checkingRecords, delay: 800 },
    { label: copy.analyzingSymptoms, delay: 800 },
    { label: copy.findingHospital, delay: 1000 },
    { label: copy.ready, delay: 600 }
  ];

  const canConfirmSharing = selectedScopes.length > 0 && Boolean(selectedDuration);

  const chosenInstitution = institutionRows.find((row) => row.institution === selectedInstitution);
  const currentRouteRoads = routeRoads(location, english, showKorean);
  const currentRouteStartValue = routeStartValue(location, english, showKorean);
  const currentEmergencySummary = nearestEmergencySummary(location, english, showKorean);
  const currentRouteCallText = routeCallText(location, english, showKorean);

  useEffect(() => {
    const localizedLabels = [copy.checkingRecords, copy.analyzingSymptoms, copy.findingHospital, copy.ready];
    setTriageSequence((current) =>
      current.map((item, index) => ({
        ...item,
        label: localizedLabels[index] ?? item.label
      }))
    );
  }, [copy.checkingRecords, copy.analyzingSymptoms, copy.findingHospital, copy.ready]);

  const appendAudit = (entry: Omit<AuditEntry, "id" | "time">) => {
    setAuditLog((current) => [
      ...current,
      {
        ...entry,
        id: `audit-${Date.now()}-${current.length}`,
        time: formatTime()
      }
    ]);
  };

  const clearTriageOutputs = () => {
    setTriageSequence([]);
    setTriageResult(null);
    setHospitalShareDecision(null);
    setHospitalShareWorking(false);
    setHospitalDetailsOpen(false);
    setFollowUpPlanOpen(false);
    setRouteDemoOpen(false);
    setVoucher(null);
    setBatchDetail(null);
    setSelectedInstitution(null);
    setFamilyShareOpen(false);
    setFamilyShareReady(false);
    setPlanSaved(false);
    setSymptomAuditLogged(false);
  };

  const updateSymptoms = (value: string) => {
    setSymptoms(value);
    setSelectedSymptomGroup(null);
    clearTriageOutputs();
  };

  const chooseSymptomSample = (value: string, groupId: SymptomSampleGroupId) => {
    setSymptoms(value);
    setSelectedSymptomGroup(groupId);
    setSeverity(groupId === "severe" ? "severe" : groupId === "mild" ? "mild" : "moderate");
    clearTriageOutputs();
  };

  const updateSymptomDuration = (value: string) => {
    setSymptomDuration(value);
    clearTriageOutputs();
  };

  const updateSeverity = (value: string) => {
    setSeverity(value);
    setSelectedSymptomGroup(null);
    clearTriageOutputs();
  };

  const updateSymptomFlag = (key: keyof typeof symptomFlags, checked: boolean) => {
    setSymptomFlags((current) => ({
      ...current,
      [key]: checked
    }));
    clearTriageOutputs();
  };

  const selectPatient = (patient: PatientProfile, mode: IdentityMode) => {
    setSelectedIdentityMode(mode);
    setSelectedPatient(patient);
    appendAudit({
      module: "Patient Identity",
      actor: "Patient Wallet",
      action: `Selected profile: ${patient.name}`,
      txHash: "Pending",
      status: "Completed"
    });
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]
    );
  };

  const changeLocation = (nextLocation: string) => {
    setLocation(nextLocation);
    clearTriageOutputs();
  };

  const executeAuthorization = async () => {
    if (!selectedPatient || !canConfirmSharing) {
      return;
    }

    const txHash = generateTxHash(`${selectedPatient.id}:prepare-records:${selectedDuration}`);
    setContractRunning(true);
    setContractSequence([]);
    setConsentTxHash(null);
    setAccessGranted(false);

    for (const message of contractMessages) {
      setContractSequence((current) => [...current, { label: message, status: "running" }]);
      await delay(650);
      setContractSequence((current) =>
        current.map((item, index) => (index === current.length - 1 ? { ...item, status: "done" } : item))
      );
      appendAudit({
        module: "Record Sharing",
        actor: selectedPatient.name,
        action: message.replace("...", ""),
        txHash,
        status: message === contractMessages[contractMessages.length - 1] ? "Confirmed" : "Completed"
      });
    }

    setConsentTxHash(txHash);
    setAccessGranted(true);
    setContractRunning(false);
    appendAudit({
      module: "Record Preparation",
      actor: "MedLink",
      action: `Records prepared for ${selectedDuration}`,
      txHash,
      status: "Confirmed"
    });
  };

  const shareRecordsWithHospital = async () => {
    if (!triageResult || hospitalShareWorking || hospitalShareDecision === "shared") {
      return;
    }

    setHospitalShareWorking(true);
    await delay(1000);
    setHospitalShareWorking(false);
    setHospitalShareDecision("shared");
    appendAudit({
      module: "Hospital Record Sharing",
      actor: selectedPatient?.name ?? "Patient",
      action: `Shared records with ${currentRecommendation.hospital}`,
      txHash: generateTxHash(`hospital-share:${currentRecommendation.hospital}:${selectedPatient?.id ?? "patient"}`),
      status: "Confirmed"
    });
  };

  const decideLaterForHospitalShare = () => {
    setHospitalShareDecision("later");
    appendAudit({
      module: "Hospital Record Sharing",
      actor: selectedPatient?.name ?? "Patient",
      action: `Deferred record sharing with ${currentRecommendation.hospital}`,
      txHash: "Pending",
      status: "Completed"
    });
  };

  const runTriage = async () => {
    if (!symptoms.trim()) {
      return;
    }

    const txHash = generateTxHash(`triage:${symptoms}`);
    setTriageRunning(true);
    setTriageSequence([]);
    setTriageResult(null);
    setHospitalDetailsOpen(false);
    setFollowUpPlanOpen(false);
    setRouteDemoOpen(false);
    setSelectedInstitution(null);
    setVoucher(null);
    setBatchDetail(null);
    setFamilyShareOpen(false);
    setFamilyShareReady(false);
    setPlanSaved(false);

    for (const phase of triageMessages) {
      setTriageSequence((current) => [...current, { label: phase.label, status: "running" }]);
      await delay(phase.delay);
      setTriageSequence((current) =>
        current.map((item, index) => (index === current.length - 1 ? { ...item, status: "done" } : item))
      );
      appendAudit({
        module: "Health Check",
        actor: "Care Assistant",
        action: phase.label.replace("...", ""),
        txHash,
        status: "Completed"
      });
    }

    const result = deriveTriageResult({
      symptoms,
      symptomDuration,
      severity,
      sampleGroupId: selectedSymptomGroup,
      flags: symptomFlags
    });
    setTriageResult(result);
    setHospitalShareDecision(null);
    setHospitalShareWorking(false);
    setHospitalDetailsOpen(false);
    setFollowUpPlanOpen(false);
    setRouteDemoOpen(false);
    setTriageRunning(false);
    appendAudit({
      module: "Health Check",
      actor: "Care Assistant",
      action: `Care suggestion generated: ${result.risk}`,
      txHash,
      status: "Verified"
    });
  };

  const createVoucher = () => {
    if (voucher || !triageResult) {
      return;
    }

    const nextVoucher = {
      id: buildVoucherId(),
      txHash: generateTxHash(`voucher:${triageResult.risk}`)
    };

    setVoucher(nextVoucher);
    appendAudit({
      module: "Care Plan",
      actor: "Care Assistant",
      action: `Visit pass generated: ${nextVoucher.id}`,
      txHash: nextVoucher.txHash,
      status: "Confirmed"
    });
  };

  const verifyDrugBatch = (institution: string) => {
    const department = triageResult?.department ?? "";
    const cityConfig = cityConfigFor(location);
    const drugName =
      triageResult?.risk === "SPECIALIST"
        ? localText(english, showKorean, "Osimertinib 80 mg", "奥希替尼 80 mg", "오시머티닙 80 mg (Osimertinib)")
        : triageResult?.risk === "HIGH"
          ? localText(english, showKorean, "Emergency observation medicine pack", "急诊留观用药包", "응급 관찰 약품 패키지")
        : department.includes("General Practice")
          ? localText(english, showKorean, "Insulin glargine", "甘精胰岛素", "인슐린 글라진 (Insulin glargine)")
        : department.includes("Gastroenterology")
            ? localText(english, showKorean, "Digestive care pack", "肠胃护理用药包", "소화기 증상 관리 약품 패키지")
            : department.includes("Dermatology")
              ? localText(english, showKorean, "Skin and allergy care pack", "皮肤过敏护理用药包", "피부·알레르기 관리 약품 패키지")
              : department.includes("Urology")
                ? localText(english, showKorean, "Urinary infection care pack", "尿路感染护理用药包", "요로감염 관리 약품 패키지")
                : department.includes("Orthopedics")
                  ? localText(english, showKorean, "Pain relief and bandage kit", "止痛和包扎用品", "진통 및 붕대 키트")
                  : localText(english, showKorean, "Respiratory care pack", "呼吸道护理用药包", "호흡기 증상 관리 약품 패키지");
    const manufacturer =
      triageResult?.risk === "SPECIALIST"
        ? localText(english, showKorean, "AstraZeneca China", "阿斯利康中国", "아스트라제네카 중국 (AstraZeneca China)")
        : department.includes("General Practice")
          ? localText(english, showKorean, "Sanofi China", "赛诺菲中国", "사노피 중국 (Sanofi China)")
          : location === "Chengdu"
            ? localText(english, showKorean, "Sichuan Kelun Pharmaceutical", "四川科伦药业", "쓰촨 커룬제약 (Sichuan Kelun Pharmaceutical)")
            : localText(english, showKorean, "China National Pharmaceutical Group", "国药集团", "중국의약그룹 (Sinopharm)");
    const detail = {
      institution,
      drugName,
      batchId: `BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturer,
      distributor: localText(english, showKorean, cityConfig.distributorEn, cityConfig.distributorZh, `${koreanCityNameByCity[cityKeyFromConfig(cityConfig)]} 합법 의약품 배송센터`),
      pharmacy: english ? `${institution} Pharmacy` : showKorean ? `${institution} 약국` : institution.endsWith("药房") ? institution : `${institution}药房`,
      ipfsCid: `bafkrei${generateTxHash(institution).slice(2, 34)}`,
      txHash: generateTxHash(`batch:${institution}:${drugName}`)
    };

    setBatchDetail(detail);
    appendAudit({
      module: "Medicine Check",
      actor: "Medicine Safety Service",
      action: `Medicine checked at ${institution}`,
      txHash: detail.txHash,
      status: "Verified"
    });
  };

  const canGoNext =
    currentStep === 1
      ? Boolean(selectedPatient)
      : currentStep === 2
        ? accessGranted
        : currentStep === 3
          ? Boolean(symptoms.trim())
          : currentStep === 4
            ? Boolean(triageResult)
            : currentStep < 7;

  const goNext = () => {
    if (!canGoNext || currentStep >= 7) {
      return;
    }

    if (currentStep === 3 && !symptomAuditLogged) {
      appendAudit({
        module: "Symptom Intake",
        actor: selectedPatient?.name ?? "Patient",
        action: `Symptoms submitted from ${location}`,
        txHash: generateTxHash(`symptoms:${symptoms}`),
        status: "Completed"
      });
      setSymptomAuditLogged(true);
    }

    if (currentStep === 4) {
      createVoucher();
    }

    if (currentStep === 6) {
      appendAudit({
        module: "Medicine Finder",
        actor: "Care Assistant",
        action: "Medicine pickup options prepared",
        txHash: generateTxHash("institution-match"),
        status: "Completed"
      });
    }

    setCurrentStep((step) => Math.min(7, step + 1));
  };

  const goPrevious = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const saveCarePlan = () => {
    setPlanSaved(true);
    appendAudit({
      module: "Care Plan",
      actor: selectedPatient ? displayPatientName(selectedPatient, english, showKorean) : showKorean ? "환자" : "Patient",
      action: `Care plan saved for ${currentRecommendation.hospital}`,
      txHash: voucher?.txHash ?? generateTxHash(`saved-plan:${currentRecommendation.hospital}`),
      status: "Completed"
    });
  };

  const restartJourney = () => {
    setCurrentStep(1);
    setSelectedIdentityMode(null);
    setSelectedPatient(null);
    setAccessGranted(false);
    setHospitalShareDecision(null);
    setHospitalShareWorking(false);
    setHospitalDetailsOpen(false);
    setFollowUpPlanOpen(false);
    setRouteDemoOpen(false);
    setSymptoms("");
    setTriageResult(null);
    setVoucher(null);
    setBatchDetail(null);
    setSelectedInstitution(null);
    setFamilyShareOpen(false);
    setFamilyShareReady(false);
    setPlanSaved(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 pb-28 pt-6 sm:px-8 lg:pl-80 lg:pr-8">
      <div className="mx-auto max-w-7xl">
        <section className="glass-card rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{copy.pageEyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{copy.pageTitle}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{copy.pageDescription}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {copy.stepCounter} {currentStep} {copy.stepOf}: {copy.stepLabels[currentStep - 1]}
            </div>
          </div>

          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-blue-400"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {copy.stepLabels.map((step, index) => (
                <div key={`${step}-${index}`} className="min-w-0">
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                      index + 1 <= currentStep
                        ? "border-sky-400 bg-sky-500 text-white"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="mt-2 hidden truncate text-center text-xs text-slate-500 md:block">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white ">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="p-5 sm:p-7"
            >
              {currentStep === 1 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 1`} title={copy.step1Title} description={copy.step1Desc} />

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => selectPatient(selfProfile, "self")}
                      className={`glass-card rounded-2xl p-5 text-left transition hover:border-sky-300 ${
                        selectedIdentityMode === "self" && selectedPatient?.id === selfProfile.id ? "border-sky-400 bg-sky-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sky-700">{copy.selfCheckIn}</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">{displayPatientName(selfProfile, english, showKorean)}</h3>
                          </div>
                        </div>
                        {selectedIdentityMode === "self" && selectedPatient?.id === selfProfile.id ? <BadgeCheck className="h-5 w-5 text-emerald-700" /> : null}
                      </div>
                      <span className="mt-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {copy.primaryAccountHolder}
                      </span>
                      <div className="mt-4 grid gap-2 text-sm text-slate-600">
                        <p>{copy.age}: {selfProfile.age}</p>
                        <p>{copy.condition}: {displayPatientValue(selfProfile.condition, english, showKorean)}</p>
                        <p>{copy.allergy}: {displayPatientValue(selfProfile.allergy, english, showKorean)}</p>
                        <p>{copy.recent}: {selfProfile.recent.map((item) => displayPatientValue(item, english, showKorean)).join(showKorean ? ", " : english ? ", " : "、")}</p>
                      </div>
                    </button>

                    <div className={`glass-card rounded-2xl p-5 transition ${selectedIdentityMode === "family" ? "border-sky-400 bg-sky-50" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sky-700">{copy.familyCheckIn}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{copy.familySubLabel}</p>
                          </div>
                        </div>
                        {selectedIdentityMode === "family" && selectedPatient ? <BadgeCheck className="h-5 w-5 text-emerald-700" /> : null}
                      </div>
                      <span className="mt-5 inline-flex rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700">
                        {copy.familyCareMode}
                      </span>
                      <p className="mt-4 text-sm leading-6 text-slate-500">{copy.familyAccessNote}</p>

                      <div className="mt-5 grid gap-3">
                        {familyProfiles.map((profile) => {
                          const active = selectedPatient?.id === profile.id;
                          return (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() => selectPatient(profile, "family")}
                              className={`rounded-xl border p-4 text-left transition hover:border-sky-300 ${
                                active ? "border-sky-400 bg-white" : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-slate-900">
                                    {displayPatientName(profile, english, showKorean)} {showKorean ? `(${profile.relation === "Father" ? "부친" : profile.relation === "Daughter" ? "딸" : profile.relation})` : english ? `(${profile.relation})` : `（${profile.chineseRelation}）`}
                                  </h3>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {copy.age} {profile.age} · {displayPatientValue(profile.condition, english, showKorean)}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {profile.id === "wang-xiaomei" ? `${copy.allergy}: ${displayPatientValue(profile.allergy, english, showKorean)}` : profile.recent.map((item) => displayPatientValue(item, english, showKorean)).join(showKorean ? ", " : english ? ", " : "、")}
                                  </p>
                                </div>
                                {active ? <Check className="h-4 w-4 text-emerald-700" /> : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedPatient ? (
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{copy.healthId}</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{copy.healthIdValue}</p>
                      </div>
                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                          {copy.verified} <Check className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                          <ShieldCheck className="h-5 w-5" />
                          <p className="mt-2 text-sm font-semibold">{copy.recordsSecure}</p>
                        </div>
                        <InfoTile label={copy.recordSharing} value={copy.off} tone="amber" />
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-1">
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{copy.connectedHospitals}</p>
                          <p className="mt-3 text-sm leading-6 text-slate-700">
                            {displayHospitalName("West China Hospital, Sichuan University", english, showKorean)} · {displayHospitalName("Chengdu Jinjiang District People's Hospital", english, showKorean)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 2`} title={copy.step2Title} description={copy.step2Desc} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-slate-900">{copy.sharePanelTitle}</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {recordShareItems.map((record) => {
                          const checked = selectedScopes.includes(record.scope);
                          return (
                            <label
                              key={record.scope}
                              className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 text-sm transition ${
                                checked ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <span>
                                <span className="block font-semibold text-slate-900">{showKorean ? record.koName : english ? record.enName : record.zhName}</span>
                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                  {record.date} · {displayHospitalName(record.hospital, english, showKorean)}
                                </span>
                              </span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleScope(record.scope)}
                                className="mt-1 h-5 w-5 rounded border-slate-300 bg-white accent-sky-500"
                              />
                            </label>
                          );
                        })}
                      </div>
                      <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-700">
                        {copy.prepareRecordsExplanation}
                      </p>

                      <div className="mt-6 grid gap-5">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{copy.shareFor}</p>
                          <div className="mt-3 grid gap-2">
                            {durationOptions(english, showKorean).map((duration) => (
                              <label key={duration.value} className="flex items-center gap-3 text-sm text-slate-600">
                                <input
                                  type="radio"
                                  name="duration"
                                  checked={selectedDuration === duration.value}
                                  onChange={() => setSelectedDuration(duration.value)}
                                  className="accent-sky-500"
                                />
                                {duration.label}
                              </label>
                            ))}
                          </div>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={executeAuthorization}
                        disabled={contractRunning || !canConfirmSharing}
                        className="primary-button mt-6 h-12 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {contractRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {copy.confirmSharing}
                      </button>
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-slate-900">{copy.sharingStatus}</h3>
                      <div className="mt-4 grid gap-3">
                        {contractSequence.length === 0 ? (
                          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            {copy.sharingPrompt}
                          </p>
                        ) : (
                          contractSequence.map((item) => (
                            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                              {item.status === "done" ? <Check className="h-4 w-4 text-emerald-700" /> : <Loader2 className="h-4 w-4 animate-spin text-sky-600" />}
                              {item.label}
                            </div>
                          ))
                        )}
                      </div>

                      {accessGranted && consentTxHash ? (
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                        >
                          <p className="font-semibold text-emerald-700">
                            {copy.sharingSuccess}
                          </p>
                        </motion.div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 3`} title={copy.step3Title} description={copy.step3Desc} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="glass-card rounded-2xl p-5">
                      <label className="grid gap-3 text-sm font-medium text-slate-700">
                        {copy.symptomLabel}
                        <textarea
                          value={symptomTextForLanguage(symptoms, english, showKorean)}
                          onChange={(event) => updateSymptoms(event.target.value)}
                          rows={8}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                          placeholder={copy.symptomPlaceholder}
                        />
                      </label>
                      <div className="mt-5 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{copy.symptomExamplesTitle}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{copy.symptomExamplesDesc}</p>
                        </div>
                        {symptomSampleGroups.map((group) => (
                          <div key={group.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-semibold text-slate-900">{showKorean ? group.koTitle : english ? group.enTitle : group.zhTitle}</p>
                              <p className="text-xs text-slate-500">{showKorean ? group.koDesc : english ? group.enDesc : group.zhDesc}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {group.samples.map((sample) => (
                                <button
                                  key={sample.zh}
                                  type="button"
                                  onClick={() => chooseSymptomSample(showKorean ? sample.ko : english ? sample.en : sample.zh, group.id)}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-sky-300 hover:text-slate-900"
                                >
                                  {showKorean ? sample.ko : english ? sample.en : sample.zh}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      <div className="grid gap-4">
                        <SelectField
                          label={copy.symptomDuration}
                          value={symptomDuration}
                          options={selectOptions(symptomDurations, {
                            "<1 day": "不到1天",
                            "1-3 days": "1-3天",
                            "3-7 days": "3-7天",
                            ">7 days": "超过7天"
                          }, english, showKorean ? {
                            "<1 day": "1일 미만",
                            "1-3 days": "1-3일",
                            "3-7 days": "3-7일",
                            ">7 days": "7일 이상"
                          } : undefined)}
                          onChange={updateSymptomDuration}
                        />
                        <SegmentedControl
                          label={copy.severity}
                          value={severity}
                          options={selectOptions(severityLevels, {
                            mild: "轻微",
                            moderate: "中等",
                            severe: "严重"
                          }, english, showKorean ? {
                            mild: "가벼움",
                            moderate: "중간",
                            severe: "심함"
                          } : undefined)}
                          onChange={updateSeverity}
                        />
                        <SelectField
                          label={copy.location}
                          value={location}
                          options={selectOptions(locations, {
                            Chengdu: "成都",
                            Shanghai: "上海",
                            Guangzhou: "广州",
                            Shenzhen: "深圳"
                          }, english, showKorean ? {
                            Chengdu: "청두",
                            Shanghai: "상하이",
                            Guangzhou: "광저우",
                            Shenzhen: "선전"
                          } : undefined)}
                          onChange={changeLocation}
                        />

                        <div>
                          <p className="text-sm font-medium text-slate-700">{copy.redFlagChecks}</p>
                          <div className="mt-3 grid gap-2">
                            {[
                              ["breathing", copy.breathing],
                              ["chestPain", copy.chestPain],
                              ["neurological", copy.neurological]
                            ].map(([key, label]) => (
                              <label key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={symptomFlags[key as keyof typeof symptomFlags]}
                                  onChange={(event) => updateSymptomFlag(key as keyof typeof symptomFlags, event.target.checked)}
                                  className="h-4 w-4 rounded border-slate-300 bg-white accent-sky-500"
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 4 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 4`} title={copy.step4Title} description={copy.step4Desc} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-slate-900">{copy.step4Title}</h3>
                      <button
                        type="button"
                        onClick={runTriage}
                        disabled={triageRunning || !symptoms.trim()}
                        className="primary-button mt-5 h-12 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {triageRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {copy.checkSymptoms}
                      </button>

                      <div className="mt-5 grid gap-3">
                        {triageSequence.length === 0 ? (
                          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            {copy.checkPrompt}
                          </p>
                        ) : (
                          triageSequence.map((item) => (
                            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                              {item.status === "done" ? <Check className="h-4 w-4 text-emerald-700" /> : <Loader2 className="h-4 w-4 animate-spin text-sky-600" />}
                              {item.label}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      {triageResult ? (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                          <div className={`rounded-2xl border p-4 ${signalClasses(currentRecommendation.tone)}`}>
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">
                                {currentRecommendation.tone === "red" ? "🔴" : currentRecommendation.tone === "amber" ? "🟡" : "🟢"}
                              </span>
                              <div>
                                <p className="text-lg font-semibold">{currentRecommendation.signal}</p>
                                <p className="mt-2 text-sm leading-6">{currentRecommendation.possible}</p>
                              </div>
                            </div>
                          </div>

                          {currentRecommendation.tone === "red" ? (
                            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                              <div className="flex gap-3 text-red-700">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                  <p className="font-semibold">{copy.emergencyAlert}</p>
                                  <p className="mt-2 text-sm">{currentEmergencySummary}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setRouteDemoOpen(true)}
                                className="primary-button mt-5 h-11 bg-red-500 text-white hover:bg-red-600"
                              >
                                <Navigation className="h-4 w-4" />
                                {copy.navigate}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="grid gap-3 md:grid-cols-3">
                                <InfoTile label={copy.recommendedHospital} value={currentRecommendationPlaceLabel} />
                                <InfoTile label={copy.department} value={currentRecommendation.department} />
                                <InfoTile label={copy.slots} value={currentRecommendation.slots} tone="green" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setHospitalDetailsOpen((open) => !open)}
                                aria-expanded={hospitalDetailsOpen}
                                className="primary-button mt-5 h-11"
                              >
                                <Building2 className="h-4 w-4" />
                                {hospitalDetailsOpen ? copy.hideHospital : copy.viewHospital}
                              </button>
                              <AnimatePresence initial={false}>
                                {hospitalDetailsOpen ? (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-5 rounded-2xl border border-sky-200 bg-white p-5">
                                      <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                          <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <h3 className="text-lg font-semibold text-slate-900">{copy.hospitalDetailsTitle}</h3>
                                          <p className="mt-2 text-sm leading-6 text-slate-500">{hospitalDetails.reason}</p>
                                        </div>
                                      </div>

                                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        <InfoTile label={copy.hospitalAddressLabel} value={hospitalDetails.address} />
                                        <InfoTile label={copy.hospitalPhoneLabel} value={hospitalDetails.phone} />
                                        <InfoTile label={copy.routeTimeLabel} value={hospitalDetails.route} />
                                        <InfoTile label={copy.registrationLabel} value={hospitalDetails.registration} tone="green" />
                                      </div>

                                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{copy.serviceLabel}</p>
                                          <div className="mt-3 grid gap-2">
                                            {hospitalDetails.services.map((service) => (
                                              <p key={service} className="flex items-center gap-2 text-sm text-slate-700">
                                                <Check className="h-4 w-4 text-emerald-700" />
                                                {service}
                                              </p>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{copy.preparationLabel}</p>
                                          <p className="mt-3 text-sm leading-6 text-slate-700">{hospitalDetails.preparation}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          )}

                          <div className="mt-5 rounded-2xl border border-sky-200 bg-white p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <Sparkles className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">{copy.recommendationLogicTitle}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-500">{copy.recommendationLogicDesc}</p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 lg:grid-cols-2">
                              {recommendationEvidence.map((item) => (
                                <InfoTile key={item.label} label={item.label} value={item.value} />
                              ))}
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                              <InfoTile label={copy.waitTimeLabel} value={currentRecommendation.availability.waitTime} tone="amber" />
                              <InfoTile label={copy.doctorScheduleLabel} value={currentRecommendation.availability.doctorSchedule} tone="green" />
                              <InfoTile label={copy.bedStatusLabel} value={currentRecommendation.availability.bedStatus} />
                            </div>

                            <div className="mt-5">
                              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                {isEmergencyRecommendation ? copy.emergencyCareTitle : copy.availableDoctorsTitle}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {isEmergencyRecommendation ? copy.emergencyCareHint : copy.doctorOptionsHint}
                              </p>
                              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                                {currentRecommendation.doctors.map((doctor) => (
                                  <div key={doctor.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-start gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600">
                                        <User className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-900">{doctor.name}</p>
                                        <p className="mt-1 text-xs text-slate-500">{doctor.title}</p>
                                      </div>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{doctor.specialty}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-medium text-sky-700">
                                        {doctor.nextAvailable}
                                      </span>
                                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                        {doctor.waitTime}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                            <h3 className="text-lg font-semibold text-slate-900">{copy.hospitalShareTitle}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {copy.hospitalShareDescription.replace("{hospital}", currentRecommendation.hospital)}
                            </p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                              <button
                                type="button"
                                onClick={shareRecordsWithHospital}
                                disabled={hospitalShareWorking || hospitalShareDecision === "shared"}
                                className="primary-button h-11 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {hospitalShareWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                {hospitalShareWorking
                                  ? copy.hospitalShareWorking
                                  : copy.hospitalShareYes.replace("{hospital}", currentRecommendation.hospital)}
                              </button>
                              <button type="button" onClick={decideLaterForHospitalShare} className="glass-button h-11">
                                {copy.hospitalShareLater}
                              </button>
                            </div>
                            {hospitalShareDecision === "shared" ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                              >
                                {copy.hospitalShareSuccess.replace("{hospital}", currentRecommendation.hospital)}
                              </motion.div>
                            ) : null}
                            {hospitalShareDecision === "later" ? (
                              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-700">
                                {copy.hospitalShareLaterNote}
                              </p>
                            ) : null}
                          </div>

                          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-700">
                            {copy.disclaimer}
                          </p>
                        </motion.div>
                      ) : (
                        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                          {copy.checkPrompt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 5 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 5`} title={copy.step5Title} description={copy.step5Desc} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="glass-card rounded-2xl p-5 lg:p-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          {
                            icon: MapPin,
                            title: `${copy.recommendedHospital}: ${currentRecommendationPlaceLabel}`,
                            detail: `${copy.department}: ${currentRecommendation.department} · ${hospitalDetails.route}`,
                            wide: true
                          },
                          {
                            icon: BadgeCheck,
                            title: copy.availabilityTitle,
                            detail: `${copy.waitTimeLabel}: ${currentRecommendation.availability.waitTime} · ${copy.doctorScheduleLabel}: ${currentRecommendation.availability.doctorSchedule} · ${copy.bedStatusLabel}: ${currentRecommendation.availability.bedStatus}`,
                            wide: true
                          },
                          {
                            icon: Users,
                            title: isEmergencyRecommendation ? copy.emergencyCareTitle : copy.availableDoctorsTitle,
                            detail: currentRecommendation.doctors
                              .map((doctor) => `${doctor.name} (${doctor.nextAvailable})`)
                              .join(showKorean ? " · " : english ? "; " : "；"),
                            wide: true
                          },
                          { icon: CalendarCheck, title: `${copy.appointmentReady}: ${visitPlan.appointmentTime}`, detail: visitPlan.arrangement },
                          { icon: Route, title: copy.departInstruction, detail: visitPlan.depart },
                          hospitalShareDecision === "shared"
                            ? { icon: FileCheck2, title: `✓ ${copy.noPaper}`, detail: `${copy.doctorCanSee} ${visitPlan.arrival}` }
                            : { icon: FileCheck2, title: copy.arrivalInstruction, detail: visitPlan.arrival }
                        ].map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={item.title}
                              initial={{ opacity: 0, x: -16 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.35, delay: index * 0.1 }}
                              className={`flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 ${"wide" in item && item.wide ? "md:col-span-2" : ""}`}
                            >
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="break-words font-semibold text-slate-900">{item.title}</p>
                                <p className="mt-1 break-words text-sm leading-6 text-slate-500">{item.detail}</p>
                              </div>
                            </motion.div>
                          );
                        })}

                        <motion.div
                          initial={{ opacity: 0, x: -16 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: 0.3 }}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2"
                        >
                          <button
                            type="button"
                            onClick={() => setFollowUpPlanOpen((open) => !open)}
                            aria-expanded={followUpPlanOpen}
                            className="flex w-full gap-4 text-left"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
                              <Clock3 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900">{copy.followUp}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">{copy.autoEscalate}</p>
                              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-sky-700">
                                {followUpPlanOpen ? copy.hideFollowUpPlan : copy.followUpPrompt}
                              </span>
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {followUpPlanOpen ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 rounded-2xl border border-sky-200 bg-white p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                      <Stethoscope className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-slate-900">{copy.followUpPlanTitle}</h3>
                                      <p className="mt-2 text-sm leading-6 text-slate-500">{followUpPlan.intro}</p>
                                    </div>
                                  </div>

                                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <InfoTile label={copy.followUpHospitalLabel} value={followUpPlan.hospital} />
                                    <InfoTile label={copy.followUpDepartmentLabel} value={followUpPlan.department} />
                                  </div>

                                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-xs uppercase tracking-[0.14em] text-amber-700">{copy.followUpWhenLabel}</p>
                                    <p className="mt-2 text-sm leading-6 text-amber-800">{followUpPlan.when}</p>
                                  </div>

                                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{copy.followUpSupportLabel}</p>
                                    <div className="mt-3 grid gap-2">
                                      {followUpPlan.support.map((item) => (
                                        <p key={item} className="flex items-center gap-2 text-sm text-slate-700">
                                          <Check className="h-4 w-4 text-emerald-700" />
                                          {item}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-500">
                                    {copy.followUpNotice}
                                  </p>
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </div>

                    <div className="glass-card self-start rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{copy.voucher}</p>
                          <h3 className="break-words text-base font-semibold text-slate-900">{voucher?.id ?? buildVoucherId()}</h3>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="flex h-36 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
                          <div className="grid h-20 w-20 grid-cols-5 gap-1 rounded-lg bg-white p-2">
                            {Array.from({ length: 25 }, (_, index) => (
                              <span key={index} className={`rounded-sm ${index % 3 === 0 || index % 7 === 0 ? "bg-slate-900" : "bg-slate-200"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <InfoTile label={copy.voucherNumber} value={voucher?.id ?? buildVoucherId()} />
                          <InfoTile label={copy.validTime} value={showKorean ? "72시간" : english ? "72 hours" : "72小时"} />
                          <InfoTile label={copy.qrPlaceholder} value={showKorean ? "준비 완료" : english ? "Ready" : "已生成"} tone="green" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 6 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 6`} title={copy.step6Title} description={copy.step6Desc} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="glass-card rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{copy.prescriptionFeedbackTitle}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{copy.prescriptionFeedbackDesc}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3">
                        <InfoTile label={copy.issuedBy} value={medicinePlan.issuedBy} />
                        <InfoTile
                          label={copy.currentHospitalPickup}
                          value={medicinePlan.currentHasStock ? copy.currentHospitalHasStock : copy.currentHospitalNoStock}
                          tone={medicinePlan.currentHasStock ? "green" : "amber"}
                        />
                      </div>

                      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{copy.medicineList}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {medicinePlan.items.map((item) => (
                            <span key={item} className="rounded-full border border-sky-200 bg-white px-3 py-1 text-sm font-medium text-sky-700">
                              {item}
                            </span>
                          ))}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{medicinePlan.note}</p>
                        <p className="mt-2 text-xs leading-6 text-slate-500">{copy.dosageNote}</p>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{copy.nearbyPickupOptions}</h3>
                          <p className="mt-2 text-sm text-slate-500">{copy.sortedByDistance}</p>
                        </div>
                        <Pill className="h-5 w-5 text-sky-600" />
                      </div>

                      <div className="mt-5 grid gap-4">
                        {institutionRows.map((row) => (
                          <motion.div
                            key={row.institution}
                            whileHover={{ y: row.selectable ? -2 : 0 }}
                            className={`rounded-2xl border p-4 transition ${
                              selectedInstitution === row.institution
                                ? "border-sky-400 bg-sky-50"
                                : row.sameHospital
                                  ? "border-emerald-200 bg-emerald-50/60"
                                  : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold text-slate-900">{row.institution}</h3>
                                  {row.sameHospital ? (
                                    <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700">
                                      {copy.currentHospitalPickup}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs text-sky-700">{row.level}</span>
                                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">{row.type}</span>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {row.distance}
                                  </span>
                                </div>
                              </div>
                              {selectedInstitution === row.institution ? <BadgeCheck className="h-5 w-5 text-emerald-700" /> : null}
                            </div>

                            <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                              <p className={row.stockStatus === copy.hasStock ? "text-emerald-700" : "text-amber-700"}>{row.stockStatus}</p>
                              <p className={row.selectable ? "text-emerald-700" : "text-amber-700"}>{row.prescriptionStatus}</p>
                              <p className="text-slate-600">{copy.estimatedTravel}: {row.travel}</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{copy.nextAvailable}: {row.nextSlot}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedInstitution(row.institution)}
                                disabled={!row.selectable}
                                className="primary-button h-10 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {copy.chooseThis}
                              </button>
                              <button
                                type="button"
                                onClick={() => verifyDrugBatch(row.institution)}
                                disabled={!row.selectable}
                                className="glass-button h-10 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Pill className="h-4 w-4" />
                                {copy.checkMedicine}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 7 ? (
                <div>
                  <SectionHeader eyebrow={`${copy.step} 7`} title={copy.step7Title} description={copy.step7Desc} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="glass-card rounded-2xl p-5">
                      <div className="grid gap-3 md:grid-cols-2">
                        <InfoTile label={copy.selectedProfile} value={selectedPatient ? displayPatientName(selectedPatient, english, showKorean) : "-"} />
                        <InfoTile label={copy.recommendedHospital} value={currentRecommendation.hospital} />
                        <InfoTile label={copy.department} value={currentRecommendation.department} />
                        <InfoTile label={copy.appointment} value={visitPlan.appointmentTime} />
                        <InfoTile label={copy.medicines} value={medicinePlan.items.join(showKorean ? ", " : english ? ", " : "、")} />
                        <InfoTile label={copy.pickupPlace} value={chosenInstitution?.institution ?? currentRecommendation.hospital} />
                        <InfoTile label={copy.voucherReady} value={voucher?.id ?? buildVoucherId()} tone="green" />
                      </div>
                      <p className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-700">
                        {copy.sharingCloses} {selectedDurationLabel} {copy.sharingClosesSuffix}
                      </p>
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      <div className="grid gap-3">
                        <button
                          type="button"
                          onClick={saveCarePlan}
                          className={`h-12 rounded-lg px-4 py-2 font-semibold transition ${
                            planSaved
                              ? "inline-flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
                              : "primary-button"
                          }`}
                        >
                          {planSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                          {planSaved ? copy.planSaved : copy.savePlan}
                        </button>
                        {planSaved ? (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700"
                          >
                            {copy.planSavedNote}
                          </motion.p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setFamilyShareReady(false);
                            setFamilyShareOpen(true);
                          }}
                          className="glass-button h-12"
                        >
                          <Share2 className="h-4 w-4" />
                          {copy.shareFamily}
                        </button>
                        <button type="button" onClick={restartJourney} className="glass-button h-12">
                          <RotateCcw className="h-4 w-4" />
                          {copy.restart}
                        </button>
                      </div>
                      <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                        {copy.reassurance}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-between sm:p-7">
            <button
              type="button"
              onClick={goPrevious}
              disabled={currentStep === 1}
              className="glass-button h-11 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              {copy.back}
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="primary-button h-11 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.next}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {batchDetail ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-5 "
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="glass-card w-full max-w-lg rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">✓ {copy.medicineVerified}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{batchDetail.drugName}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchDetail(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                <InfoTile label={copy.manufacturer} value={batchDetail.manufacturer} />
                <InfoTile label={copy.checkedDate} value={new Date().toLocaleDateString()} tone="green" />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {routeDemoOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-5 "
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="glass-card w-full max-w-3xl rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">{copy.navigate}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{copy.routeDemoTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{copy.routeDemoDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRouteDemoOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-sky-200 bg-[#eef8ff]">
                  <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] [background-size:42px_42px]" />
                  <div className="absolute left-[-8%] top-[22%] h-14 w-[118%] -rotate-6 rounded-full bg-white/90 shadow-sm" />
                  <div className="absolute left-[8%] top-[50%] h-12 w-[96%] rotate-12 rounded-full bg-white/90 shadow-sm" />
                  <div className="absolute bottom-[18%] left-[-6%] h-12 w-[95%] -rotate-[24deg] rounded-full bg-white/90 shadow-sm" />
                  <div className="absolute left-[47%] top-[-10%] h-[115%] w-12 rotate-[8deg] rounded-full bg-white/80 shadow-sm" />

                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 640 420"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M82 336 C150 322 176 280 230 268 C296 252 327 234 350 197 C379 149 427 128 493 106 C528 94 552 77 586 57"
                      fill="none"
                      stroke="#bae6fd"
                      strokeWidth="22"
                      strokeLinecap="round"
                    />
                    <path
                      d="M82 336 C150 322 176 280 230 268 C296 252 327 234 350 197 C379 149 427 128 493 106 C528 94 552 77 586 57"
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M493 106 C528 94 552 77 586 57"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <circle cx="82" cy="336" r="12" fill="#0ea5e9" stroke="#ffffff" strokeWidth="5" />
                    <circle cx="586" cy="57" r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="5" />
                  </svg>

                  <div className="absolute left-[5%] top-[16%] rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                    {currentRouteRoads[0]}
                  </div>
                  <div className="absolute right-[8%] top-[43%] rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                    {currentRouteRoads[1]}
                  </div>
                  <div className="absolute right-[12%] top-[10%] rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                    {currentRouteRoads[2]}
                  </div>

                  <div className="absolute bottom-[33%] left-[6%] max-w-[13rem] rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 shadow-sm">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {copy.routeStart}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">{currentRouteStartValue}</span>
                  </div>
                  <div className="absolute right-[5%] top-[6%] max-w-[14rem] rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {currentRecommendation.hospital}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">{showKorean ? "응급실 입구" : english ? "Emergency entrance" : "急诊入口"}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">{copy.routeOpenMap}</p>
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {currentRecommendation.distance} · {currentRecommendation.etaShort}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{currentRecommendation.routeAdvice}</p>
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  <InfoTile label={copy.routeStart} value={currentRouteStartValue} />
                  <InfoTile label={copy.routeDestination} value={currentRecommendation.hospital} />
                  <InfoTile label={copy.routeDistance} value={currentRecommendation.distance} />
                  <InfoTile label={copy.routeEta} value={currentRecommendation.travel} tone="amber" />
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-red-600">{copy.routeAdvice}</p>
                    <p className="mt-2 text-sm leading-6 text-red-700">{currentRouteCallText}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {familyShareOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-5 "
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="glass-card max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{copy.shareFamily}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{copy.shareFamilyTitle}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{copy.shareFamilyDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFamilyShareOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                  aria-label={copy.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.15fr)]">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 p-5">
                  <p className="mb-4 text-sm font-semibold text-sky-700">{copy.shareQrTitle}</p>
                  <div className="grid h-32 w-32 grid-cols-5 gap-1 rounded-xl bg-white p-3 shadow-sm">
                    {Array.from({ length: 25 }, (_, index) => (
                      <span key={index} className={`rounded-sm ${index % 2 === 0 || index % 7 === 0 ? "bg-slate-900" : "bg-slate-200"}`} />
                    ))}
                  </div>
                  {familyShareReady ? (
                    <p className="mt-4 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                      {copy.shareLinkReady}
                    </p>
                  ) : null}
                </div>

                <div className="grid min-w-0 gap-3">
                  <div className="grid min-w-0 gap-3 md:grid-cols-2">
                    <InfoTile label={copy.recommendedHospital} value={currentRecommendation.hospital} />
                    <InfoTile label={copy.appointment} value={visitPlan.appointmentTime} />
                    <InfoTile label={copy.department} value={currentRecommendation.department} />
                    <InfoTile label={copy.medicines} value={medicinePlan.items.join(showKorean ? ", " : english ? ", " : "、")} />
                    <InfoTile label={copy.pickupPlace} value={chosenInstitution?.institution ?? currentRecommendation.hospital} />
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    <button type="button" onClick={() => setFamilyShareReady(true)} className="glass-button min-h-11 justify-center px-3 py-2 text-center leading-5">
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-keep">{copy.shareViaWechat}</span>
                    </button>
                    <button type="button" onClick={() => setFamilyShareReady(true)} className="glass-button min-h-11 justify-center px-3 py-2 text-center leading-5">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-keep">{copy.shareViaSms}</span>
                    </button>
                    <button type="button" onClick={() => setFamilyShareReady(true)} className="glass-button min-h-11 justify-center px-3 py-2 text-center leading-5">
                      <CopyIcon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-keep">{copy.copyShareLink}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {currentStep === 4 ? (
        <div className="fixed bottom-24 left-5 z-40 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 shadow-2xl lg:left-80">
          {copy.disclaimer}
        </div>
      ) : null}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function InfoTile({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "green" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-700"
      : tone === "amber"
        ? "text-amber-700"
        : "text-slate-900";

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-sm font-medium leading-6 ${toneClass}`}>{value}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-sky-400"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              value === option.value ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-white hover:text-sky-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
