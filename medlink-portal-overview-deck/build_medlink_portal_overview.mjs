import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");

const root = "/Users/xiaotan/Documents/Codex/2026.4 web design/coding pages";
const assetDir = path.join(root, "medlink-portal-ppt-assets");
const deckDir = path.join(root, "medlink-portal-overview-deck");
const previewDir = path.join(deckDir, "previews");

const outputPptx = path.join(deckDir, "MedLink_three_portals_overview.pptx");

const slides = [
  {
    index: "01",
    eyebrow: "Patient Portal",
    title: "患者端：就诊建议",
    subtitle: "面向普通患者，把档案、病历、症状和下一步行动组织成清晰流程。",
    image: path.join(assetDir, "patient-journey.png"),
    caption: "演示重点：根据病情轻重与城市资源，推荐合适层级的医院/诊所，并解释推荐依据。",
    bullets: [
      "轻症优先推荐社区医院/诊所，避免一生病就挤兑三甲。",
      "结合已准备病历、症状严重程度、城市和可用号源。",
      "后续串联就诊计划、取药安排和家人分享。"
    ]
  },
  {
    index: "02",
    eyebrow: "Partner Portal",
    title: "合作端：协同网络",
    subtitle: "展示 MedLink 如何为合作伙伴提供试点入口、协同网络和可验证数据服务。",
    image: path.join(assetDir, "partner-portal.png"),
    caption: "演示重点：让医院、药品供应链和科研机构理解平台合作价值。",
    bullets: [
      "清晰呈现合作方案、合作对象和联系入口。",
      "支持医院网络试点、药品批次认证和合规科研数据。",
      "从成都试点出发，扩展到多城市医疗协同。"
    ]
  },
  {
    index: "03",
    eyebrow: "Developer Portal",
    title: "开发者端：技术证明",
    subtitle: "展示 MediChain 权限逻辑：患者控制访问权限，开发者只查看模拟事件。",
    image: path.join(assetDir, "developer-portal.png"),
    caption: "演示重点：DID 授权、链下加密存储、链上哈希和审计日志如何共同工作。",
    bullets: [
      "患者通过 DID 授权，医生、医院、监管方和开发者权限分层。",
      "医疗文件加密链下存储；链上只记录哈希、授权和审计。",
      "Technology Trace 展示 IPFS、AES-256、Fabric 和 Chaincode 逻辑。"
    ]
  }
];

function addHeader(slide, pptx, eyebrow, index) {
  slide.addText("MedLink", {
    x: 0.55,
    y: 0.28,
    w: 1.3,
    h: 0.28,
    fontFace: "Aptos Display",
    fontSize: 13,
    bold: true,
    color: "0F172A",
    margin: 0
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.35,
    y: 0.34,
    w: 0.08,
    h: 0.08,
    fill: { color: "0EA5E9" },
    line: { color: "0EA5E9" }
  });
  slide.addText(eyebrow, {
    x: 10.4,
    y: 0.28,
    w: 1.7,
    h: 0.28,
    align: "right",
    fontFace: "Aptos",
    fontSize: 10,
    color: "0284C7",
    bold: true,
    margin: 0
  });
  slide.addText(`${index} / 03`, {
    x: 12.15,
    y: 0.28,
    w: 0.65,
    h: 0.28,
    align: "right",
    fontFace: "Aptos",
    fontSize: 10,
    color: "64748B",
    margin: 0
  });
}

function addBulletCard(slide, pptx, text, y, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.62,
    y,
    w: 4.15,
    h: 0.72,
    rectRadius: 0.08,
    fill: { color: "FFFFFF" },
    line: { color: "D8EAF5", transparency: 0 },
    shadow: { type: "outer", color: "CBD5E1", opacity: 0.13, blur: 1, angle: 45, distance: 1 }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.86,
    y: y + 0.26,
    w: 0.12,
    h: 0.12,
    fill: { color },
    line: { color }
  });
  slide.addText(text, {
    x: 1.12,
    y: y + 0.16,
    w: 3.35,
    h: 0.4,
    fontFace: "PingFang SC",
    fontSize: 10.8,
    color: "334155",
    breakLine: false,
    fit: "shrink",
    margin: 0
  });
}

function addSlide(pptx, spec) {
  const slide = pptx.addSlide();
  slide.background = { color: "F7FBFD" };
  addHeader(slide, pptx, spec.eyebrow, spec.index);

  slide.addText(spec.title, {
    x: 0.62,
    y: 0.82,
    w: 4.3,
    h: 0.74,
    fontFace: "PingFang SC",
    fontSize: 24,
    bold: true,
    color: "0F172A",
    fit: "shrink",
    margin: 0
  });
  slide.addText(spec.subtitle, {
    x: 0.64,
    y: 1.68,
    w: 4.15,
    h: 0.62,
    fontFace: "PingFang SC",
    fontSize: 11.4,
    color: "64748B",
    fit: "shrink",
    breakLine: false,
    margin: 0
  });

  const colors = ["10B981", "0EA5E9", "60A5FA"];
  spec.bullets.forEach((bullet, idx) => addBulletCard(slide, pptx, bullet, 2.55 + idx * 0.92, colors[idx]));

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.06,
    y: 0.82,
    w: 7.8,
    h: 5.42,
    rectRadius: 0.1,
    fill: { color: "FFFFFF" },
    line: { color: "CFEAF8" },
    shadow: { type: "outer", color: "94A3B8", opacity: 0.18, blur: 2, angle: 45, distance: 2 }
  });
  slide.addImage({
    path: spec.image,
    x: 5.22,
    y: 0.98,
    w: 7.48,
    h: 4.68
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.22,
    y: 5.8,
    w: 7.48,
    h: 0.5,
    rectRadius: 0.06,
    fill: { color: "ECFDF5" },
    line: { color: "BBF7D0" }
  });
  slide.addText(spec.caption, {
    x: 5.46,
    y: 5.94,
    w: 6.95,
    h: 0.22,
    fontFace: "PingFang SC",
    fontSize: 10.2,
    color: "047857",
    fit: "shrink",
    margin: 0
  });

  slide.addShape(pptx.ShapeType.arc, {
    x: -0.2,
    y: 6.45,
    w: 1.4,
    h: 1.4,
    line: { color: "BAE6FD", transparency: 35, width: 2 },
    adjustPoint: 0.35
  });
}

function svgText(lines, x, y, fontSize, fill, weight = 400, lineGap = 1.35) {
  return lines
    .map((line, idx) => `<text x="${x}" y="${y + idx * fontSize * lineGap}" font-family="PingFang SC, Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`)
    .join("");
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

async function makePreview(spec, index) {
  const screenshot = await sharp(spec.image)
    .resize(1070, 670, { fit: "cover", position: "top" })
    .png()
    .toBuffer();

  const bulletLines = spec.bullets.map((item) => (item.length > 27 ? [item.slice(0, 27), item.slice(27)] : [item]));
  const bulletSvg = bulletLines
    .map((lines, idx) => {
      const y = 365 + idx * 130;
      return `
        <rect x="90" y="${y}" width="600" height="92" rx="22" fill="#ffffff" stroke="#d7edf8"/>
        <circle cx="130" cy="${y + 45}" r="9" fill="${idx === 0 ? "#10b981" : idx === 1 ? "#0ea5e9" : "#60a5fa"}"/>
        ${svgText(lines, 160, y + 41, 24, "#334155", 500, 1.25)}
      `;
    })
    .join("");

  const svg = `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="#f7fbfd"/>
      <circle cx="60" cy="72" r="7" fill="#0ea5e9"/>
      <text x="90" y="82" font-family="Aptos, Arial, sans-serif" font-size="28" font-weight="700" fill="#0f172a">MedLink</text>
      <text x="1540" y="76" font-family="Aptos, Arial, sans-serif" font-size="22" font-weight="700" fill="#0284c7">${escapeXml(spec.eyebrow)}</text>
      <text x="1800" y="76" font-family="Aptos, Arial, sans-serif" font-size="20" fill="#64748b">${spec.index} / 03</text>
      ${svgText([spec.title], 90, 190, 52, "#0f172a", 800)}
      ${svgText(spec.subtitle.length > 31 ? [spec.subtitle.slice(0, 31), spec.subtitle.slice(31)] : [spec.subtitle], 90, 270, 25, "#64748b", 400, 1.35)}
      ${bulletSvg}
      <rect x="760" y="128" width="1110" height="780" rx="28" fill="#ffffff" stroke="#cfedf9"/>
      <rect x="790" y="158" width="1070" height="670" rx="18" fill="#f8fafc"/>
      <rect x="790" y="850" width="1070" height="76" rx="18" fill="#ecfdf5" stroke="#bbf7d0"/>
      ${svgText([spec.caption], 825, 898, 23, "#047857", 500)}
    </svg>
  `;

  const previewPath = path.join(previewDir, `slide-${index}.png`);
  await sharp(Buffer.from(svg))
    .composite([{ input: screenshot, left: 790, top: 158 }])
    .png()
    .toFile(previewPath);
  return previewPath;
}

async function main() {
  await mkdir(previewDir, { recursive: true });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "MedLink";
  pptx.company = "MedLink Prototype";
  pptx.subject = "MedLink three portal prototype overview";
  pptx.title = "MedLink 三端原型展示";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: "PingFang SC",
    bodyFontFace: "PingFang SC",
    lang: "zh-CN"
  };
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "CUSTOM_WIDE";

  slides.forEach((slide) => addSlide(pptx, slide));
  await pptx.writeFile({ fileName: outputPptx });

  const previews = [];
  for (let i = 0; i < slides.length; i += 1) {
    previews.push(await makePreview(slides[i], i + 1));
  }

  const montage = await sharp({
    create: {
      width: 1920,
      height: 1140,
      channels: 4,
      background: "#f7fbfd"
    }
  })
    .composite(
      await Promise.all(
        previews.map(async (preview, idx) => ({
          input: await sharp(preview).resize(600, 338).png().toBuffer(),
          left: 60 + idx * 620,
          top: 80
        }))
      )
    )
    .png()
    .toFile(path.join(previewDir, "preview-montage.png"));

  console.log(JSON.stringify({ outputPptx, previews, montage: path.join(previewDir, "preview-montage.png") }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
