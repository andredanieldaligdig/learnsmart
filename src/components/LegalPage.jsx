import { useNavigate } from "react-router-dom";

export default function LegalPage({ eyebrow, title, lastUpdated, intro, sections }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 70% 55% at 75% 10%, rgba(255,255,255,0.06), transparent), #0a0a0b",
        color: "#f6f6f6",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 20px 72px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "#fff",
            borderRadius: 999,
            padding: "10px 16px",
            cursor: "pointer",
            marginBottom: 24,
          }}
        >
          Back
        </button>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 28,
            padding: "36px 28px",
            backdropFilter: "blur(16px)",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
            {eyebrow}
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              lineHeight: 1.06,
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            {title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.46)", fontSize: 13, marginBottom: 24 }}>Last updated: {lastUpdated}</p>
          <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.8, fontSize: 15 }}>{intro}</p>

          <div style={{ marginTop: 28, display: "grid", gap: 22 }}>
            {sections.map((section) => (
              <section
                key={section.heading}
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: 22,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.45rem",
                    marginBottom: 10,
                  }}
                >
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    style={{
                      color: "rgba(255,255,255,0.76)",
                      lineHeight: 1.8,
                      fontSize: 15,
                      marginTop: 10,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
