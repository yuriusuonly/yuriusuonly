import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import Head from "expo-router/head";
import DomainShell from "../../components/domain-shell.js";
import { List, ListItem } from "../../components/list.js";
import { COLORS } from "../../shared/theme.js";
import config from "../../shared/config.js";
import tiptap from "../projects/tiptap.js";
import dinoDash from "../projects/dino-dash.js";
import superchat from "../projects/superchat.js";
import mojisumi from "../projects/mojisumi.js";

/**
 * Resume dimension theme composed locally from base color tokens (neutral paper
 * on a dark void, mirroring the other dimension screens).
 * @type {import("../../shared/theme.js").DimensionTheme}
 */
const RESUME_THEME = {
  id: "resume",
  name: "Resume",
  tagline: "Curriculum vitae.",
  accent: COLORS.surface,
  void: "#05060B",
  shapes: [COLORS.surface, "#C9CCDD", COLORS.primary],
  lightColor: "#FFFFFF",
  rimColor: "#C9CCDD",
  headlineClass: "text-white"
};

const PRINT_CSS = `
@page { size: Letter; margin: 0.5in; }
@media print {
  html, body, #root, #root > div, #root > div > div { background: #ffffff !important; height: auto !important; overflow: visible !important; }
  .no-print { display: none !important; }
  .page-break { page-break-before: always; break-before: page; }
  .resume-paper { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; width: 100% !important; padding: 0 !important; }
  .resume-scroll { overflow: visible !important; height: auto !important; }
}
`;

const SOCIAL_LINKS = [
  { label: "GitHub", url: "https://github.com/yuriusuonly" },
  { label: "LinkedIn", url: "https://linkedin.com/in/yuriusuonly" },
  { label: "itch.io", url: "https://yuriusuonly.itch.io" },
  { label: "Instagram", url: "https://www.instagram.com/yuriusuonly" },
  { label: "Email", url: "mailto:yuriusu.dev@gmail.com" }
];

/**
 * Two-column resume section: label in the left column, content in the right
 * column with an optional divider shown only on the right column.
 *
 * @param {{ label: string, children: import("react").ReactNode, divider?: boolean }} props - Section row props.
 * @returns {JSX.Element} The section row.
 */
function SectionRow({ label, children, divider = true }) {
  return (
    <View className="flex-row mt-4">
      <View className="w-28 md:w-40 pr-4 md:pr-6">
        <Text className="font-outfit text-xs md:text-sm font-bold uppercase tracking-wide text-[#161823]">{label}</Text>
      </View>
      <View className={`flex-1 ${divider ? "border-b border-[#161823]/30 pb-3" : "pb-1"}`}>
        {children}
      </View>
    </View>
  );
}

/**
 * Resume dimension screen: a single-page, Letter-size printable curriculum
 * vitae rendered with native components and augmented with the portfolio's
 * project content. Content flows as one page and breaks onto further Letter
 * pages when printed.
 *
 * @returns {JSX.Element} The themed resume dimension.
 */
export default function ResumeDimension() {
  return (
    <DomainShell theme={RESUME_THEME} homePortal>
      <Head>
        <title>Resume — {config.title}</title>
        <style>{PRINT_CSS}</style>
      </Head>
      <ScrollView className="resume-scroll flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-grow items-center justify-center p-4 pb-28 md:p-8 md:pb-32">
          <View className="w-full max-w-[816px]">
            <View className="no-print mb-4 flex-row items-center gap-2">
              <Text className="text-base" style={{ color: RESUME_THEME.lightColor }}>❖</Text>
              <Text className="font-outfit text-base md:text-lg font-semibold text-white">Curriculum Vitae</Text>
            </View>

            {/* Paper page (Letter width) */}
            <View className="resume-paper w-full bg-white rounded-lg shadow-2xl p-6 md:p-10">
              {/* Header */}
              <View className="flex-row">
                <View className="w-28 md:w-40 pr-4 md:pr-6" />
                <View className="flex-1 border-b border-[#161823]/30 pb-3">
                  <Text className="font-outfit text-xl md:text-2xl font-extrabold text-[#161823]">Jullius Chua Pajanustan</Text>
                  <Text className="mt-1 font-outfit text-xs md:text-sm font-semibold text-[#161823]/80">Junior Developer</Text>
                  <View className="mt-2 flex-row flex-wrap items-center">
                    {SOCIAL_LINKS.map((link, index) => (
                      <View key={link.label} className="flex-row items-center">
                        {index > 0 ? (
                          <Text className="mx-1 font-outfit text-xs md:text-sm text-[#161823]/60">•</Text>
                        ) : null}
                        <Pressable
                          accessibilityRole="link"
                          accessibilityLabel={`Open ${link.label}`}
                          onPress={() => Linking.openURL(link.url).catch(() => {})}
                        >
                          <Text className="font-outfit text-xs md:text-sm text-[#161823] underline">{link.label}</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <SectionRow label="Skills">
                <Text className="font-outfit text-xs md:text-sm leading-snug text-[#161823]">
                  Strong grasp of programming logic, project management, and problem-solving. Experience integrating code into automated build and deployment workflows. Proactive in self-education, as evidenced by completing rigorous external certifications in modern computing.
                </Text>
              </SectionRow>

              <SectionRow label="Career">
                <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">Lifesaver Medicords for Doctor • Junior Mobile Developer</Text>
                <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">May 2026 • Aurora Blvd, Cubao, Quezon City</Text>
                <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">
                  A SaaS startup, digitalizes medical records with online consultations.
                </Text>
                <View className="mt-2">
                  <List>
                    <ListItem label="Integrated peer-to-peer live video calling and chat feature using WebRTC and WebSocket connection" markerClass="text-[#161823]" textClass="text-[#161823]" />
                    <ListItem label="Handled deployment for both Apple App Store Connect and Google Play Developer Console for iOS and Android platforms" markerClass="text-[#161823]" textClass="text-[#161823]" />
                    <ListItem label="Using collaboration tools, end-to-end testing, and automation setup with Claude Code for agentic workflow, Trello MCP, and Git/GitHub version control" markerClass="text-[#161823]" textClass="text-[#161823]" />
                    <ListItem label="Tech stack we use:" markerClass="text-[#161823]" textClass="text-[#161823]">
                      <List inset>
                        <ListItem label="Dart/Flutter" markerClass="text-[#161823]" textClass="text-[#161823]" />
                        <ListItem label="Go" markerClass="text-[#161823]" textClass="text-[#161823]" />
                        <ListItem label="Redis" markerClass="text-[#161823]" textClass="text-[#161823]" />
                        <ListItem label="MySQL" markerClass="text-[#161823]" textClass="text-[#161823]" />
                        <ListItem label="Amazon AWS" markerClass="text-[#161823]" textClass="text-[#161823]" />
                      </List>
                    </ListItem>
                  </List>
                </View>
              </SectionRow>

              {/* Page break for printing */}
              <View className="page-break" />

              <SectionRow label="Projects">
                <View>
                  <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">{tiptap.name}</Text>
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">{tiptap.stack.replace(/ · /g, " • ")}</Text>
                  <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">{tiptap.description}</Text>
                </View>
                <View className="mt-4">
                  <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">{dinoDash.name}</Text>
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">{dinoDash.stack.replace(/ · /g, " • ")}</Text>
                  <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">{dinoDash.description}</Text>
                </View>
                <View className="mt-4">
                  <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">{superchat.name}</Text>
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">{superchat.stack.replace(/ · /g, " • ")}</Text>
                  <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">{superchat.description}</Text>
                </View>
                <View className="mt-4">
                  <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">{mojisumi.name}</Text>
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">{mojisumi.stack.replace(/ · /g, " • ")}</Text>
                  <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">{mojisumi.description}</Text>
                </View>
              </SectionRow>

              <SectionRow label="Education">
                <View>
                  <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">Bachelor of Science in Information Technology • Quezon City Polytechnic University</Text>
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">May 2017 • Sinagtala St, corner Batasan Rd, Batasan Hills, Quezon City</Text>
                </View>
                <View className="mt-4">
                  <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">Bachelor of Science in Information Systems • La Concepcion College</Text>
                  <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">May 2014 - 2016 • Kaypian Road, corner Quirino St, San Jose del Monte, Bulacan</Text>
                  <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">
                    Learned C, C++, and Java programming languages.
                  </Text>
                </View>
              </SectionRow>

              <SectionRow label="Certificates" divider={false}>
                <Text className="font-outfit text-sm md:text-base font-bold text-[#161823]">CS50x: Introduction to Computer Science and the Art of Programming • Harvard University</Text>
                <Text className="font-outfit text-xs md:text-sm text-[#161823]/60">October 2023 • 09fecdac-ae64-42eb-8274-0cc99808d52e</Text>
                <Text className="mt-1 font-outfit text-xs md:text-sm leading-snug text-[#161823]">
                  Learned the Linux command-line interface, C, Python, SQL (SQLite), and standard Web technologies (HTML, CSS, and JavaScript).
                </Text>
              </SectionRow>
            </View>
          </View>
        </View>
      </ScrollView>
    </DomainShell>
  );
}
