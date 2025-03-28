// components/Documentation/Documentation.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Documentation.css";

const Documentation = () => {
  return (
    <div className="documentation-page">
      <div className="container">
        <div className="documentation-header">
          <h1>Attrition Analysis Tool Documentation</h1>
          <p>
            Everything you need to know about using our tool to gain insights
            into employee attrition patterns
          </p>
        </div>

        <div className="documentation-content">
          <aside className="sidebar">
            <h3>Contents</h3>
            <nav className="sidebar-nav">
              <a href="#getting-started">Getting Started</a>
              <a href="#data-requirements">Data Requirements</a>
              <a href="#using-the-tool">Using the Tool</a>
              <a href="#understanding-reports">Understanding Reports</a>
              <a href="#troubleshooting">Troubleshooting</a>
              <a href="#faq">Frequently Asked Questions</a>
            </nav>
            <div className="sidebar-cta">
              <Link to="/tool" className="cta-button">
                Generate Report Now
              </Link>
            </div>
          </aside>

          <main className="main-content">
            <section id="getting-started" className="doc-section">
              <h2>Getting Started</h2>
              <p>
                The Attrition Analysis Tool helps HR professionals and business
                leaders understand employee departure patterns and make
                data-driven decisions to improve retention. This documentation
                will guide you through using the tool effectively.
              </p>
              <p>
                Our tool analyzes your HRIS data to provide insights across
                multiple dimensions including gender, location, function,
                tenure, and grade levels. The generated report includes
                visualizations and statistics to help you identify concerning
                trends and focus areas.
              </p>
            </section>

            <section id="data-requirements" className="doc-section">
              <h2>Data Requirements</h2>
              <p>
                To generate an accurate attrition report, your Excel file must
                contain the following columns:
              </p>
              <div className="requirements-table-wrapper">
                <table className="requirements-table">
                  <thead>
                    <tr>
                      <th>Column Name</th>
                      <th>Description</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Employee Name</td>
                      <td>Full name of the employee</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Gender</td>
                      <td>Employee's gender</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Job Location</td>
                      <td>Primary work location</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Function</td>
                      <td>Department or functional area</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Grade</td>
                      <td>Employee's grade or level</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Date of Joining</td>
                      <td>When the employee joined (DATE format)</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Action Type</td>
                      <td>Type of HR action (e.g., "Exit", "Resignation")</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td>Action Date</td>
                      <td>When the action occurred (DATE format)</td>
                      <td>Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="info-box">
                <h4>Important Notes:</h4>
                <ul>
                  <li>
                    Your file must be in Excel (.xlsx) format with a maximum
                    size of 10MB
                  </li>
                  <li>
                    Date columns must be in a standard date format recognized by
                    Excel
                  </li>
                  <li>
                    The "Action Type" column should clearly indicate departures
                    with terms like "Exit", "Resignation", or "Termination"
                  </li>
                  <li>
                    For best results, ensure your data is clean and consistent
                  </li>
                </ul>
              </div>
            </section>

            <section id="using-the-tool" className="doc-section">
              <h2>Using the Tool</h2>

              <div className="step-by-step">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Upload Your HRIS File</h3>
                    <p>
                      Click the "Upload HRIS File" button in the tool interface
                      and select your Excel file. The system will validate your
                      file to ensure it meets the requirements.
                    </p>
                    <p>
                      If there are any issues with your file, validation errors
                      will be displayed. Fix these issues and try uploading
                      again.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Generate Attrition Report</h3>
                    <p>
                      Once your file is successfully uploaded, click the
                      "Generate Attrition Report" button. The system will
                      process your data and create visualizations and analytics.
                    </p>
                    <p>
                      This process may take a few moments depending on the size
                      of your dataset. The status will be shown during
                      processing.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Download Your Report</h3>
                    <p>
                      When the report is ready, click the "Download Report"
                      button to get your Word document. You can now share it
                      with stakeholders or use it for presentations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="understanding-reports" className="doc-section">
              <h2>Understanding Your Attrition Report</h2>
              <p>
                Your generated report contains several sections providing
                comprehensive analysis of attrition patterns. Here's what to
                look for in each section:
              </p>

              <div className="report-sections">
                <div className="report-section-item">
                  <h3>1. Overall Attrition Statistics</h3>
                  <p>
                    This section provides a high-level view of your
                    organization's attrition, including total employee count,
                    total exits, and overall attrition rate. The pie chart
                    visualizes the proportion of active vs. exited employees.
                  </p>
                  <p>
                    <strong>Key insight:</strong> Compare your overall attrition
                    rate with industry benchmarks to understand if your
                    retention is better or worse than average.
                  </p>
                </div>

                <div className="report-section-item">
                  <h3>2. Gender-wise Attrition</h3>
                  <p>
                    This analysis breaks down attrition by gender, showing if
                    there are disproportionate departure rates between different
                    genders. The section includes counts, rates, and
                    visualizations.
                  </p>
                  <p>
                    <strong>Key insight:</strong> Significant differences in
                    attrition rates between genders may indicate potential
                    diversity and inclusion issues that need addressing.
                  </p>
                </div>

                <div className="report-section-item">
                  <h3>3. Location-wise Attrition</h3>
                  <p>
                    This section analyzes attrition by job location, focusing on
                    locations with significant employee populations (≥50
                    employees). It helps identify if certain locations
                    experience higher turnover.
                  </p>
                </div>

                <div className="report-section-item">
                  <h3>4. Function-wise Attrition</h3>
                  <p>
                    This analysis examines attrition by functional area or
                    department, showing which areas experience higher turnover.
                    It's limited to functions with ≥20 employees for statistical
                    relevance.
                  </p>
                </div>

                <div className="report-section-item">
                  <h3>5. Tenure Analysis</h3>
                  <p>
                    This section examines how long employees stay before
                    leaving, grouped into tenure bands (&lt;1 year, 1-2 years,
                    etc.). It helps identify critical retention periods where
                    focused interventions might be needed.
                  </p>
                </div>

                <div className="report-section-item">
                  <h3>6. Grade-wise Attrition</h3>
                  <p>
                    The grade analysis shows attrition patterns across employee
                    levels, helping you understand if turnover is higher at
                    certain career stages.
                  </p>
                </div>

                <div className="report-section-item">
                  <h3>7. Quarterly & Monthly Trends</h3>
                  <p>
                    This time-series analysis shows how attrition rates change
                    over time, helping identify seasonal patterns or concerning
                    trends that may require attention.
                  </p>
                </div>
              </div>
            </section>

            <section id="troubleshooting" className="doc-section">
              <h2>Troubleshooting</h2>

              <div className="troubleshooting-list">
                <div className="troubleshooting-item">
                  <h3>File Upload Issues</h3>
                  <p>
                    <strong>Problem:</strong> Your file fails to upload or
                    returns validation errors.
                  </p>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>Ensure your file is in .xlsx format and under 10MB</li>
                    <li>
                      Check that all required columns are present and named
                      correctly
                    </li>
                    <li>
                      Verify there are no formatting issues with date columns
                    </li>
                    <li>
                      Make sure the file isn't corrupted or password-protected
                    </li>
                  </ul>
                </div>

                <div className="troubleshooting-item">
                  <h3>Report Generation Failures</h3>
                  <p>
                    <strong>Problem:</strong> The system fails to generate a
                    report after uploading.
                  </p>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>
                      Check that your data contains actual attrition events with
                      proper "Action Type" values
                    </li>
                    <li>
                      Ensure there's sufficient data to analyze (minimum 10-20
                      employees)
                    </li>
                    <li>Try refreshing the page and uploading again</li>
                  </ul>
                </div>

                <div className="troubleshooting-item">
                  <h3>Download Issues</h3>
                  <p>
                    <strong>Problem:</strong> Unable to download the generated
                    report.
                  </p>
                  <p>
                    <strong>Solutions:</strong>
                  </p>
                  <ul>
                    <li>Ensure your browser allows downloads from this site</li>
                    <li>Check if your browser is blocking pop-ups</li>
                    <li>Try using a different browser</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="faq" className="doc-section">
              <h2>Frequently Asked Questions</h2>

              <div className="faq-list">
                <div className="faq-item">
                  <h3>Is my data secure when using this tool?</h3>
                  <p>
                    Yes, all data processing happens locally on the server, and
                    your HRIS data is not shared with third parties. Files are
                    automatically deleted after processing to ensure privacy.
                  </p>
                </div>

                <div className="faq-item">
                  <h3>
                    What if my data doesn't have all the required columns?
                  </h3>
                  <p>
                    The tool requires all the specified columns to function
                    properly. If your data is missing certain fields, consider
                    enriching your dataset before uploading. You might need to
                    consult with your HR information system administrator.
                  </p>
                </div>

                <div className="faq-item">
                  <h3>How can I interpret the attrition percentages?</h3>
                  <p>
                    Attrition percentages represent the proportion of employees
                    who have left relative to the total employees in that
                    category. Industry benchmarks vary, but typically annual
                    attrition rates of 10-15% are considered average in many
                    sectors. Rates significantly above this may indicate
                    retention issues.
                  </p>
                </div>

                <div className="faq-item">
                  <h3>Can I customize the report sections?</h3>
                  <p>
                    The current version generates a standard report with all
                    sections. In future updates, we plan to add customization
                    options to allow users to select specific sections.
                  </p>
                </div>

                <div className="faq-item">
                  <h3>How large can my dataset be?</h3>
                  <p>
                    The tool is optimized to handle datasets of up to 10,000
                    employees. Larger datasets may require additional processing
                    time or custom solutions. Contact us if you need to analyze
                    very large datasets.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
