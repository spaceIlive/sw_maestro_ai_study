import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { AnalyzeResponse, TermAnalysis } from "../types";
import { routeLabel } from "../utils";

const REPORT_TITLE = "협업 텍스트 오해 가능 용어 분석 보고서";

export async function downloadReportDocx(report: AnalyzeResponse) {
  const doc = new Document({
    creator: "ContextBridge",
    title: REPORT_TITLE,
    description: "ContextBridge 분석 결과 보고서",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [new TextRun(REPORT_TITLE)],
          }),
          mutedParagraph(`선택 경로: ${routeLabel(report.route)}`),
          spacer(),
          sectionHeading("1. 입력 내용 요약"),
          bodyParagraph(report.summary),
          sectionHeading("2. 핵심 요청 / 합의 내용"),
          bodyParagraph(report.keyRequest),
          sectionHeading("3. 오해 가능 용어 분석"),
          report.terms.length > 0 ? termsTable(report.terms) : bodyParagraph("추가 문맥이 필요합니다."),
          sectionHeading("4. 합의 필요 질문"),
          ...listParagraphs(report.agreementQuestions),
          sectionHeading("5. 업무 시작 전 체크리스트"),
          ...listParagraphs(report.checklist),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `contextbridge-report-${toDateStamp()}.docx`);
}

function sectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true })],
  });
}

function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function mutedParagraph(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text, color: "64748B", size: 20 })],
  });
}

function listParagraphs(items: string[]) {
  if (items.length === 0) {
    return [bodyParagraph("항목이 없습니다.")];
  }

  return items.map(
    (item) =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 100 },
        children: [new TextRun({ text: item, size: 21 })],
      }),
  );
}

function termsTable(terms: TermAnalysis[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell("용어"),
          headerCell("문맥 / 현재 의미"),
          headerCell("직군별 해석"),
          headerCell("위험도 / 합의 질문"),
        ],
      }),
      ...terms.map((term) =>
        new TableRow({
          children: [
            textCell(term.term),
            textCell(`${term.context}\n${term.currentMeaning}\n${term.riskReason}`),
            textCell(
              [
                `기획: ${term.plannerView}`,
                `개발: ${term.developerView}`,
                `디자인: ${term.designerView}`,
                `PM: ${term.pmView}`,
              ].join("\n"),
            ),
            textCell(`${term.riskLevel}\n${term.confirmationQuestion}`),
          ],
        }),
      ),
    ],
  });
}

function headerCell(text: string) {
  return new TableCell({
    shading: { fill: "EAF1FF" },
    borders: tableBorders(),
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20 })],
      }),
    ],
  });
}

function textCell(text: string) {
  return new TableCell({
    borders: tableBorders(),
    children: text.split("\n").map(
      (line) =>
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: line, size: 18 })],
        }),
    ),
  });
}

function tableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: "D7DEEA" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "D7DEEA" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "D7DEEA" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "D7DEEA" },
  };
}

function spacer() {
  return new Paragraph({ spacing: { after: 160 } });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
