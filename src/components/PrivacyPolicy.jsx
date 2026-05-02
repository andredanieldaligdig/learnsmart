import LegalPage from "./LegalPage.jsx";

const sections = [
  {
    heading: "1. Scope of This Policy",
    paragraphs: [
      "This Privacy Policy explains how LearnSmart collects, uses, stores, shares, and protects personal information when you access our website, applications, AI-powered study features, and related services.",
      "By using LearnSmart, you acknowledge the practices described in this Privacy Policy.",
    ],
  },
  {
    heading: "2. Information We Collect",
    paragraphs: [
      "We may collect information you provide directly, such as your name, email address, login credentials, date of birth, profile details, support communications, prompts, uploaded materials, messages, and any other content you choose to submit through the service.",
      "We may also collect technical and usage information, including device information, log data, browser type, session activity, interaction history, and information required for security, analytics, and service reliability purposes.",
    ],
  },
  {
    heading: "3. How We Use Information",
    paragraphs: [
      "We use personal information to provide and maintain LearnSmart, create and secure accounts, personalize the user experience, generate AI-assisted study content, respond to support requests, monitor performance, investigate misuse, and improve our services.",
      "We may also use information to enforce our Terms, meet legal obligations, protect users and the platform, and communicate important updates relating to your account, access, or policy changes.",
    ],
  },
  {
    heading: "4. Children's Privacy and Age Verification",
    paragraphs: [
      "LearnSmart is not intended for unsupervised use by children under 13. If we learn that we have actual knowledge that a user is under 13, we may suspend account access until appropriate parental or guardian consent is verified through customer support or another approved process.",
      "Where age information is collected for eligibility or compliance purposes, we use it to determine whether a user may access the service and to administer any parental consent workflow required by applicable law.",
    ],
  },
  {
    heading: "5. Sharing of Information",
    paragraphs: [
      "We may share information with service providers, infrastructure partners, analytics vendors, authentication providers, and other processors that help us operate LearnSmart, subject to appropriate confidentiality and data protection obligations.",
      "We may also disclose information where reasonably necessary to comply with law, respond to lawful requests, protect rights or safety, enforce our agreements, investigate suspected fraud or abuse, or support a merger, acquisition, financing, or asset transfer involving all or part of our business.",
    ],
  },
  {
    heading: "6. Data Retention",
    paragraphs: [
      "We retain personal information for as long as reasonably necessary to provide the service, maintain account records, resolve disputes, comply with legal obligations, enforce agreements, and protect the security and integrity of LearnSmart.",
      "Retention periods may vary depending on the nature of the data, the sensitivity of the information, the purpose of processing, and applicable legal or operational requirements.",
    ],
  },
  {
    heading: "7. Security",
    paragraphs: [
      "We use commercially reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, disclosure, alteration, and destruction. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      "Users are responsible for protecting their own account credentials and for notifying customer support if they believe their account has been compromised.",
    ],
  },
  {
    heading: "8. Your Choices and Rights",
    paragraphs: [
      "Subject to applicable law and technical limitations, you may be able to access, update, or request deletion of certain account information. You may also contact customer support regarding privacy-related requests, age-verification questions, or parental consent matters.",
      "If parental consent is required for a user under 13, a parent or legal guardian may request review, correction, deletion, or restriction of applicable child-related information consistent with legal requirements and LearnSmart's operational procedures.",
    ],
  },
  {
    heading: "9. International Processing",
    paragraphs: [
      "LearnSmart may use service providers and technical infrastructure located in multiple jurisdictions. By using the service, you understand that personal information may be processed, stored, or transferred in countries that may have different data protection rules than your own jurisdiction.",
    ],
  },
  {
    heading: "10. Changes to This Privacy Policy",
    paragraphs: [
      "We may revise this Privacy Policy from time to time to reflect service updates, operational changes, or legal and regulatory developments. When we do, we will post the updated version and revise the effective date shown on this page.",
      "Your continued use of LearnSmart after an updated Privacy Policy becomes effective constitutes your acknowledgment of the revised policy.",
    ],
  },
  {
    heading: "11. Contact",
    paragraphs: [
      "For privacy questions, parental consent matters, or requests relating to personal information, please contact LearnSmart customer support through the support channel listed in the application or on the official LearnSmart website.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="LearnSmart Legal"
      title="Privacy Policy"
      lastUpdated="May 2, 2026"
      intro="This Privacy Policy describes how LearnSmart handles personal information in connection with the platform and its related services. It is intended to help users understand what information we collect and how that information is used."
      sections={sections}
    />
  );
}
