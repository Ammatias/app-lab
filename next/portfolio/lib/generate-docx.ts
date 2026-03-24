import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  UnderlineType,
} from "docx";
import { saveAs } from "file-saver";
import { resume } from "@/data/resume";

export async function generateDOCX() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Заголовок "Резюме"
          new Paragraph({
            text: "Резюме",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // О себе
          new Paragraph({
            text: "О себе",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { color: "3730A3", space: 1, style: BorderStyle.SINGLE },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resume.about,
                size: 22,
                color: "525252",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Навыки
          new Paragraph({
            text: "Навыки",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { color: "3730A3", space: 1, style: BorderStyle.SINGLE },
            },
          }),
          new Paragraph({
            children: resume.skills.map((skill, index) => {
              const isLast = index === resume.skills.length - 1;
              return new TextRun({
                text: skill + (isLast ? "" : ", "),
                size: 20,
                color: "525252",
                shading: {
                  fill: "E4E4E7",
                  color: "171717",
                },
              });
            }),
            spacing: { after: 200 },
          }),

          // Опыт работы
          new Paragraph({
            text: "Опыт работы",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { color: "3730A3", space: 1, style: BorderStyle.SINGLE },
            },
          }),
          ...resume.experience.flatMap((job, jobIndex) => [
            new Paragraph({
              text: job.position,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: job.company,
                  size: 22,
                  color: "525252",
                  bold: true,
                }),
              ],
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: job.period,
                  size: 20,
                  color: "71717A",
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            ...job.description.map((desc) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• ",
                    size: 22,
                    color: "525252",
                  }),
                  new TextRun({
                    text: desc,
                    size: 22,
                    color: "525252",
                  }),
                ],
                spacing: { after: 50 },
              })
            ),
            ...(jobIndex < resume.experience.length - 1 ? [
              new Paragraph({
                text: "",
                spacing: { after: 200 },
              }),
            ] : []),
          ]),

          // Образование
          new Paragraph({
            text: "Образование",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { color: "3730A3", space: 1, style: BorderStyle.SINGLE },
            },
          }),
          ...resume.education.flatMap((edu, eduIndex) => [
            new Paragraph({
              text: edu.degree,
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.institution,
                  size: 22,
                  color: "525252",
                }),
              ],
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.year,
                  size: 20,
                  color: "71717A",
                  italics: true,
                }),
              ],
              spacing: { after: eduIndex < resume.education.length - 1 ? 200 : 0 },
            }),
          ]),

          // Контакты
          new Paragraph({
            text: "Контакты",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
            border: {
              bottom: { color: "3730A3", space: 1, style: BorderStyle.SINGLE },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Email:        ",
                size: 22,
                color: "525252",
                bold: true,
              }),
              new TextRun({
                text: resume.contacts.email,
                size: 22,
                color: "525252",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "GitHub:       ",
                size: 22,
                color: "525252",
                bold: true,
              }),
              new TextRun({
                text: resume.contacts.github,
                size: 22,
                color: "525252",
              }),
            ],
            spacing: { after: resume.contacts.telegram ? 100 : 0 },
          }),
          ...(resume.contacts.telegram ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Telegram:     ",
                  size: 22,
                  color: "525252",
                  bold: true,
                }),
                new TextRun({
                  text: resume.contacts.telegram,
                  size: 22,
                  color: "525252",
                }),
              ],
            }),
          ] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "resume.docx");
}
