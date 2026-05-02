import LegalPage from "./LegalPage.jsx";

const sections = [
  {
    heading: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms of Service govern access to and use of LearnSmart, including our website, applications, study tools, AI-assisted features, and related services. By creating an account, accessing the platform, or using any LearnSmart feature, you agree to be bound by these Terms and by our Privacy Policy.",
      "If you do not agree to these Terms, you must not use LearnSmart.",
    ],
  },
  {
    heading: "2. Eligibility and Age Requirements",
    paragraphs: [
      "LearnSmart is intended for users who are at least 13 years old. Individuals under the age of 13 may not create or access an account unless verifiable parental or guardian consent has been completed through an approved support process.",
      "You agree that the information you provide during registration, including your date of birth, is accurate and complete. We may suspend, restrict, or terminate access if we reasonably believe age or consent information is inaccurate, incomplete, or misleading.",
    ],
  },
  {
    heading: "3. Accounts and Security",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must promptly notify customer support if you suspect unauthorized access, misuse, or any security breach affecting your account.",
      "We may require identity, age, or consent-related verification where necessary to protect users, maintain platform integrity, or comply with applicable law.",
    ],
  },
  {
    heading: "4. Educational Purpose and AI Features",
    paragraphs: [
      "LearnSmart is provided for educational and informational purposes only. AI-generated responses, study suggestions, summaries, and other outputs may be incomplete, inaccurate, or unsuitable for your specific academic, professional, or personal circumstances.",
      "You remain responsible for independently evaluating all content and for how you rely on any output generated through the platform. LearnSmart does not guarantee academic outcomes, admission decisions, certifications, or examination results.",
    ],
  },
  {
    heading: "5. Acceptable Use",
    paragraphs: [
      "You agree not to misuse the service, interfere with its operation, attempt unauthorized access, upload harmful code, infringe another person's rights, or use LearnSmart to create, distribute, or promote unlawful, deceptive, abusive, or harassing content.",
      "You also agree not to use the platform in a way that could damage, disable, overburden, or impair LearnSmart, its infrastructure, or other users' ability to access the service.",
    ],
  },
  {
    heading: "6. User Content and License",
    paragraphs: [
      "You retain ownership of content you submit to LearnSmart, including prompts, notes, profile information, uploads, and messages, subject to the rights necessary for us to operate, maintain, secure, and improve the service.",
      "By submitting content, you grant LearnSmart a non-exclusive, worldwide, royalty-free license to host, store, reproduce, process, transmit, and display that content solely as needed to provide and support the service.",
    ],
  },
  {
    heading: "7. Intellectual Property",
    paragraphs: [
      "All LearnSmart trademarks, branding, software, interfaces, visual design, and platform materials, excluding user-submitted content, are owned by LearnSmart or its licensors and are protected by applicable intellectual property laws.",
      "Except as expressly permitted in writing, you may not copy, modify, distribute, reverse engineer, republish, sell, or exploit any portion of the service.",
    ],
  },
  {
    heading: "8. Suspension and Termination",
    paragraphs: [
      "We may suspend, limit, or terminate access to LearnSmart at any time, with or without prior notice, where reasonably necessary to investigate suspected misconduct, enforce these Terms, protect users, or comply with legal obligations.",
      "Upon termination, the right to use the service immediately ceases, but provisions that by their nature should survive will continue in effect, including provisions relating to intellectual property, disclaimers, liability limitations, and dispute-related terms.",
    ],
  },
  {
    heading: "9. Disclaimers and Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, LearnSmart is provided on an as-is and as-available basis without warranties of any kind, whether express, implied, statutory, or otherwise. We do not warrant uninterrupted availability, complete accuracy, or error-free operation.",
      "To the fullest extent permitted by law, LearnSmart and its affiliates, officers, employees, licensors, and service providers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of data, revenue, profits, goodwill, or business opportunity arising out of or relating to your use of the service.",
    ],
  },
  {
    heading: "10. Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time to reflect changes in the service, legal requirements, or business practices. Updated Terms become effective when posted unless a different effective date is stated.",
      "Your continued use of LearnSmart after revised Terms are posted constitutes acceptance of the updated Terms.",
    ],
  },
  {
    heading: "11. Contact",
    paragraphs: [
      "Questions regarding these Terms, age verification, or parental consent should be directed to LearnSmart customer support using the support channel identified within the application or on the official LearnSmart website.",
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      eyebrow="LearnSmart Legal"
      title="Terms of Service"
      lastUpdated="May 2, 2026"
      intro="These Terms of Service set out the rules, rights, and responsibilities that apply when you access or use LearnSmart. Please read them carefully before registering or using the platform."
      sections={sections}
    />
  );
}
