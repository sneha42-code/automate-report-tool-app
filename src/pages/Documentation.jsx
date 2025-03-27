// components/Documentation/Documentation.js
import React, { useState } from "react";
import "../styles/Documentation.css";

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <div className="documentation-page">
      <div className="container">
        <div className="documentation-header">
          <h1>Documentation</h1>
          <p>Learn how to use our Report Generation Tool effectively</p>
        </div>

        <div className="documentation-content">
          <aside className="documentation-sidebar">
            <nav className="sidebar-nav">
              <ul className="sidebar-nav-list">
                <li>
                  <button
                    className={
                      activeSection === "getting-started" ? "active" : ""
                    }
                    onClick={() => setActiveSection("getting-started")}
                  >
                    Getting Started
                  </button>
                </li>
                <li>
                  <button
                    className={activeSection === "file-formats" ? "active" : ""}
                    onClick={() => setActiveSection("file-formats")}
                  >
                    Supported File Formats
                  </button>
                </li>
                <li>
                  <button
                    className={activeSection === "report-types" ? "active" : ""}
                    onClick={() => setActiveSection("report-types")}
                  >
                    Report Types
                  </button>
                </li>
                <li>
                  <button
                    className={
                      activeSection === "customization" ? "active" : ""
                    }
                    onClick={() => setActiveSection("customization")}
                  >
                    Customization Options
                  </button>
                </li>
                <li>
                  <button
                    className={
                      activeSection === "troubleshooting" ? "active" : ""
                    }
                    onClick={() => setActiveSection("troubleshooting")}
                  >
                    Troubleshooting
                  </button>
                </li>
                {/* <li>
                  <button
                    className={activeSection === "api" ? "active" : ""}
                    onClick={() => setActiveSection("api")}
                  >
                    API Reference
                  </button>
                </li> */}
              </ul>
            </nav>
          </aside>

          <main className="documentation-main">
            {activeSection === "getting-started" && (
              <section className="doc-section">
                <h2>Getting Started</h2>
                <p>
                  Welcome to the Report Generator documentation! This guide will
                  help you understand how to use our tool to create professional
                  reports from your data.
                </p>

                <h3>Quick Start Guide</h3>
                <ol>
                  <li>
                    <strong>Upload Your Data:</strong> Click the "Upload" button
                    and select your data files. We support CSV, Excel, JSON, and
                    many other formats.
                  </li>
                  <li>
                    <strong>Choose Report Settings:</strong> Select the type of
                    report you want to generate and customize its appearance.
                  </li>
                  <li>
                    <strong>Generate Report:</strong> Click the "Generate"
                    button to process your data and create your report.
                  </li>
                  <li>
                    <strong>Download:</strong> Once processing is complete,
                    click "Download" to save your report in your preferred
                    format.
                  </li>
                </ol>

                <h3>System Requirements</h3>
                <p>
                  Our tool runs in the browser and works on all modern web
                  browsers including Chrome, Firefox, Safari, and Edge. There's
                  no need to install any software.
                </p>

                <div className="note-box">
                  <h4>Note</h4>
                  <p>
                    For large files (over 100MB), we recommend using Chrome or
                    Firefox for the best performance.
                  </p>
                </div>
              </section>
            )}

            {activeSection === "file-formats" && (
              <section className="doc-section">
                <h2>Supported File Formats</h2>
                <p>
                  Our Report Generator supports a wide range of file formats for
                  data input. Here's a complete list of the formats we currently
                  support:
                </p>

                <h3>Spreadsheets</h3>
                <ul>
                  <li>
                    <strong>CSV</strong> (.csv) - Comma-separated values
                  </li>
                  <li>
                    <strong>Excel</strong> (.xlsx, .xls) - Microsoft Excel
                    workbooks
                  </li>
                  <li>
                    <strong>ODS</strong> (.ods) - OpenDocument Spreadsheet
                  </li>
                  <li>
                    <strong>TSV</strong> (.tsv) - Tab-separated values
                  </li>
                </ul>

                <h3>Data Formats</h3>
                <ul>
                  <li>
                    <strong>JSON</strong> (.json) - JavaScript Object Notation
                  </li>
                  <li>
                    <strong>XML</strong> (.xml) - Extensible Markup Language
                  </li>
                  <li>
                    <strong>YAML</strong> (.yml, .yaml) - YAML Ain't Markup
                    Language
                  </li>
                </ul>

                <h3>Database Exports</h3>
                <ul>
                  <li>
                    <strong>SQL</strong> (.sql) - SQL database dumps
                  </li>
                  <li>
                    <strong>SQLite</strong> (.db, .sqlite) - SQLite database
                    files
                  </li>
                </ul>

                <h3>File Size Limits</h3>
                <table className="format-table">
                  <thead>
                    <tr>
                      <th>Format</th>
                      <th>Maximum Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CSV, TSV</td>
                      <td>50MB</td>
                    </tr>
                    <tr>
                      <td>Excel, ODS</td>
                      <td>25MB</td>
                    </tr>
                    <tr>
                      <td>JSON, XML, YAML</td>
                      <td>20MB</td>
                    </tr>
                    <tr>
                      <td>SQL, SQLite</td>
                      <td>100MB</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {activeSection === "report-types" && (
              <section className="doc-section">
                <h2>Report Types</h2>
                <p>
                  Our system offers several report types to meet different
                  needs. Each type has its own set of customization options and
                  is designed for specific use cases.
                </p>

                <div className="report-type-card">
                  <h3>Financial Reports</h3>
                  <p>
                    Ideal for financial data, these reports include balance
                    sheets, income statements, cash flow statements, and other
                    financial analyses.
                  </p>
                  <ul>
                    <li>Automatic calculation of financial ratios</li>
                    <li>Trend analysis over time periods</li>
                    <li>Comparison against industry benchmarks</li>
                    <li>Customizable currency formats</li>
                  </ul>
                </div>

                <div className="report-type-card">
                  <h3>Sales Reports</h3>
                  <p>
                    Track and analyze sales performance with detailed breakdowns
                    by product, region, time period, or sales representative.
                  </p>
                  <ul>
                    <li>Sales funnel visualization</li>
                    <li>Conversion rate analysis</li>
                    <li>Revenue forecasting</li>
                    <li>Customer segmentation</li>
                  </ul>
                </div>

                <div className="report-type-card">
                  <h3>Performance Analytics</h3>
                  <p>
                    Measure and track KPIs, goals, and performance metrics
                    across your organization.
                  </p>
                  <ul>
                    <li>KPI dashboards with target tracking</li>
                    <li>Performance comparisons</li>
                    <li>Goal achievement visualization</li>
                    <li>Team and individual metrics</li>
                  </ul>
                </div>

                <div className="report-type-card">
                  <h3>Custom Reports</h3>
                  <p>
                    Build your own report structure from scratch with our
                    flexible report builder.
                  </p>
                  <ul>
                    <li>Drag-and-drop report builder</li>
                    <li>Custom calculations and formulas</li>
                    <li>Conditional formatting</li>
                    <li>Save report templates for future use</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === "customization" && (
              <section className="doc-section">
                <h2>Customization Options</h2>
                <p>
                  Personalize your reports with our wide range of customization
                  options.
                </p>

                <h3>Visual Customization</h3>
                <ul>
                  <li>
                    <strong>Themes and Colors:</strong> Choose from pre-defined
                    color schemes or create your own
                  </li>
                  <li>
                    <strong>Fonts:</strong> Select from our library of web-safe
                    fonts
                  </li>
                  <li>
                    <strong>Logo and Branding:</strong> Add your company logo
                    and branding elements
                  </li>
                  <li>
                    <strong>Page Layout:</strong> Customize page orientation,
                    margins, and headers/footers
                  </li>
                </ul>

                <h3>Data Visualization</h3>
                <ul>
                  <li>
                    <strong>Chart Types:</strong> Bar charts, line graphs, pie
                    charts, scatter plots, and more
                  </li>
                  <li>
                    <strong>Data Tables:</strong> Customize column visibility,
                    sorting, and formatting
                  </li>
                  <li>
                    <strong>Conditional Formatting:</strong> Highlight important
                    data with color coding
                  </li>
                  <li>
                    <strong>Interactive Elements:</strong> Add filters,
                    tooltips, and drill-down capabilities
                  </li>
                </ul>

                <h3>Content Customization</h3>
                <ul>
                  <li>
                    <strong>Section Order:</strong> Drag and drop sections to
                    reorder your report
                  </li>
                  <li>
                    <strong>Custom Text:</strong> Add executive summaries,
                    analysis, and notes
                  </li>
                  <li>
                    <strong>Page Breaks:</strong> Control where new pages begin
                  </li>
                  <li>
                    <strong>Appendices:</strong> Include supporting information
                    at the end of your report
                  </li>
                </ul>
              </section>
            )}

            {activeSection === "troubleshooting" && (
              <section className="doc-section">
                <h2>Troubleshooting</h2>
                <p>
                  Encountering issues with our Report Generator? Here are
                  solutions to common problems.
                </p>

                <div className="faq-item">
                  <h3>File Upload Issues</h3>
                  <h4>Problem: File upload fails or times out</h4>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>
                      Check that your file is under the size limit for its
                      format
                    </li>
                    <li>Try compressing the file before uploading</li>
                    <li>Use a wired internet connection for more stability</li>
                    <li>
                      Try a different browser (Chrome or Firefox recommended)
                    </li>
                  </ul>
                </div>

                <div className="faq-item">
                  <h3>Data Processing Errors</h3>
                  <h4>Problem: "Invalid data format" error message</h4>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>
                      Check that your file matches the format you selected
                    </li>
                    <li>
                      Ensure your spreadsheet has headers in the first row
                    </li>
                    <li>Remove any special characters from column names</li>
                    <li>Check for and fix any corrupt data in your file</li>
                  </ul>
                </div>

                <div className="faq-item">
                  <h3>Report Generation Issues</h3>
                  <h4>Problem: Report generation takes too long or fails</h4>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>
                      Reduce the amount of data by filtering unnecessary rows or
                      columns
                    </li>
                    <li>
                      Simplify your report by reducing the number of
                      visualizations
                    </li>
                    <li>Try generating the report during off-peak hours</li>
                    <li>Clear your browser cache and try again</li>
                  </ul>
                </div>

                <div className="faq-item">
                  <h3>Download Problems</h3>
                  <h4>Problem: Can't download the generated report</h4>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>Check if your browser is blocking downloads</li>
                    <li>Try a different browser</li>
                    <li>Ensure you have enough disk space</li>
                    <li>
                      Try downloading in a different format (PDF instead of
                      Excel, etc.)
                    </li>
                  </ul>
                </div>

                <div className="contact-support">
                  <h3>Still Having Issues?</h3>
                  <p>
                    Contact our support team at{" "}
                    <a href="mailto:support@reportgenerator.com">
                      support@reportgenerator.com
                    </a>{" "}
                    or use the chat bubble in the bottom right corner of your
                    screen.
                  </p>
                </div>
              </section>
            )}
            {/* 
            {activeSection === "api" && (
              <section className="doc-section">
                <h2>API Reference</h2>
                <p>
                  Our Report Generator offers a robust API for integrating
                  reporting capabilities into your applications.
                </p>

                <h3>Authentication</h3>
                <p>
                  All API requests require an API key which should be included
                  in the Authorization header.
                </p>
                <pre className="code-block">
                  <code>Authorization: Bearer YOUR_API_KEY</code>
                </pre>

                <h3>Endpoints</h3>
                <div className="endpoint">
                  <h4>Upload File</h4>
                  <p>
                    <strong>POST</strong> /api/files/upload
                  </p>
                  <p>Upload a data file for processing.</p>
                  <h5>Request:</h5>
                  <pre className="code-block">
                    <code>
                      {`curl -X POST "https://api.reportgenerator.com/api/files/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@data.csv"`}
                    </code>
                  </pre>
                  <h5>Response:</h5>
                  <pre className="code-block">
                    <code>
                      {`{
  "fileId": "f1a2b3c4d5",
  "fileName": "data.csv",
  "fileSize": 1024,
  "uploadDate": "2025-03-25T12:34:56Z"
}`}
                    </code>
                  </pre>
                </div>

                <div className="endpoint">
                  <h4>Generate Report</h4>
                  <p>
                    <strong>POST</strong> /api/reports/generate
                  </p>
                  <p>Generate a report from uploaded files.</p>
                  <h5>Request:</h5>
                  <pre className="code-block">
                    <code>
                      {`curl -X POST "https://api.reportgenerator.com/api/reports/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fileIds": ["f1a2b3c4d5"],
    "reportType": "financial",
    "format": "pdf",
    "options": {
      "includeCharts": true,
      "theme": "corporate"
    }
  }'`}
                    </code>
                  </pre>
                  <h5>Response:</h5>
                  <pre className="code-block">
                    <code>
                      {`{
  "reportId": "r9z8y7x6w5",
  "status": "processing",
  "estimatedCompletionTime": "30 seconds"
}`}
                    </code>
                  </pre>
                </div>

                <div className="endpoint">
                  <h4>Get Report Status</h4>
                  <p>
                    <strong>GET</strong> /api/reports/{"{reportId}"}/status
                  </p>
                  <p>Check the status of a report generation job.</p>
                  <h5>Request:</h5>
                  <pre className="code-block">
                    <code>
                      {`curl "https://api.reportgenerator.com/api/reports/r9z8y7x6w5/status" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </code>
                  </pre>
                  <h5>Response:</h5>
                  <pre className="code-block">
                    <code>
                      {`{
  "reportId": "r9z8y7x6w5",
  "status": "completed",
  "completionTime": "2025-03-25T12:35:30Z",
  "downloadUrl": "https://api.reportgenerator.com/api/reports/r9z8y7x6w5/download"
}`}
                    </code>
                  </pre>
                </div>

                <h3>Rate Limits</h3>
                <p>Our API has the following rate limits:</p>
                <ul>
                  <li>100 requests per minute</li>
                  <li>1,000 requests per hour</li>
                  <li>10,000 requests per day</li>
                </ul>
                <p>
                  If you need higher limits, please contact our sales team to
                  discuss enterprise options.
                </p>
              </section>
            )} */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
