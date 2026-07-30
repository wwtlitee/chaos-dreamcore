import type { OracleReport, OracleReportItem } from "@/lib/oracle-report";

export function StructuredOracleReport({ report }: { report: OracleReport }) {
  return (
    <article className="oracle-report">
      <header className="oracle-report-hero">
        <div>
          <span>{report.module.toUpperCase()} / ORACLE REPORT</span>
          <h2>{report.title}</h2>
          <p className="oracle-report-subtitle">{report.subtitle}</p>
          <p className="oracle-report-verdict">{report.verdict}</p>
        </div>
        <i aria-hidden="true">{moduleRune(report.module)}</i>
      </header>

      <div className="oracle-report-metrics">
        {report.metrics.map((metric) => (
          <div data-tone={metric.tone || "neutral"} key={`${metric.label}-${metric.value}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.note ? <small>{metric.note}</small> : null}
          </div>
        ))}
      </div>

      {report.sections.map((section) => (
        <section
          className={`oracle-report-section oracle-report-section-${section.kind} ${section.id === "scoreForecast" ? "is-score-forecast" : ""}`}
          key={section.id}
        >
          <div className="oracle-report-section-head">
            <span>{section.eyebrow || section.id.toUpperCase()}</span>
            <h3>{section.title}</h3>
            <i />
          </div>
          {section.summary ? <p className="oracle-report-section-summary">{section.summary}</p> : null}
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets?.length ? (
            <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          ) : null}
          {section.items?.length ? (
            <div className="oracle-report-items">
              {section.items.map((item, index) => (
                <ReportItem item={item} index={index} key={`${item.title}-${index}`} />
              ))}
            </div>
          ) : null}
        </section>
      ))}

      <footer className="oracle-report-footer">
        <p>{report.disclaimer}</p>
        {report.sources?.length ? <p>数据来源：{report.sources.join(" · ")}</p> : null}
      </footer>
    </article>
  );
}

function ReportItem({ item, index }: { item: OracleReportItem; index: number }) {
  return (
    <div className="oracle-report-item">
      <span>{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h4>{item.title}</h4>
        {item.verdict ? <strong>{item.verdict}</strong> : null}
        {item.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {item.evidence?.length ? (
          <ul>{item.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
        ) : null}
      </div>
    </div>
  );
}

function moduleRune(module: OracleReport["module"]) {
  return ({ dream: "梦", hexagram: "卦", fortune: "运", stock: "股", token: "币", worldcup: "杯" })[module];
}
