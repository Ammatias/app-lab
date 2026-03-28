import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { resume } from "@/data/resume";

// Подключаем шрифт с поддержкой кириллицы
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    color: "#171717",
    fontFamily: "Roboto",
  },
  section: { marginBottom: 20 },
  heading: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: 700,
    color: "#171717",
  },
  subheading: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 700,
    color: "#3730a3",
    borderBottom: 1,
    borderBottomColor: "#3730a3",
    paddingBottom: 4,
  },
  text: {
    fontSize: 11,
    marginBottom: 4,
    color: "#525252",
    lineHeight: 1.5,
  },
  skill: {
    fontSize: 10,
    padding: "4 8",
    backgroundColor: "#e4e4e7",
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  jobPeriod: {
    fontSize: 10,
    color: "#71717a",
    fontStyle: "italic",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: 700,
    width: 80,
  },
});

export function ResumeDocument() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Заголовок */}
        <View style={styles.section}>
          <Text style={styles.heading}>Резюме</Text>
        </View>

        {/* О себе */}
        <View style={styles.section}>
          <Text style={styles.subheading}>О себе</Text>
          <Text style={styles.text}>{resume.about}</Text>
        </View>

        {/* Навыки */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Навыки</Text>
          <View style={styles.skillsContainer}>
            {resume.skills.map((skill) => (
              <Text key={skill} style={styles.skill}>
                {skill}
              </Text>
            ))}
          </View>
        </View>

        {/* Опыт работы */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Опыт работы</Text>
          {resume.experience.map((job) => (
            <View key={job.id} style={{ marginBottom: 12 }}>
              <Text style={styles.text}>{job.position}</Text>
              <Text style={styles.text}>{job.company}</Text>
              <Text style={styles.jobPeriod}>{job.period}</Text>
              {job.description.map((desc, i) => (
                <Text key={i} style={styles.text}>
                  • {desc}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Образование */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Образование</Text>
          {resume.education.map((edu) => (
            <View key={edu.id} style={{ marginBottom: 8 }}>
              <Text style={styles.text}>{edu.degree}</Text>
              <Text style={styles.text}>{edu.institution}</Text>
              {edu.specialty && (
                <Text style={styles.text}>{edu.specialty}</Text>
              )}
              <Text style={styles.text}>{edu.year}</Text>
            </View>
          ))}
        </View>

        {/* Курсы повышения квалификации */}
        {resume.courses && resume.courses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheading}>Повышение квалификации, курсы</Text>
            {resume.courses.map((course) => (
              <View key={course.id} style={{ marginBottom: 8 }}>
                <Text style={styles.text}>{course.title}</Text>
                <Text style={styles.text}>{course.institution}</Text>
                {course.specialty && (
                  <Text style={styles.text}>{course.specialty}</Text>
                )}
                <Text style={styles.text}>{course.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Контакты */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Контакты</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.text}>{resume.contacts.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>GitHub:</Text>
            <Text style={styles.text}>{resume.contacts.github}</Text>
          </View>
          {resume.contacts.telegram && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Telegram:</Text>
              <Text style={styles.text}>{resume.contacts.telegram}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
