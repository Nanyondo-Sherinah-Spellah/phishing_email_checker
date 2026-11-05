import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Search,
  Home,
  Clock,
  Info,
  Settings,
  UserCircle,
  AlertTriangle,
  Link,
  List,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  LockKeyhole,
  Cog,
  Fingerprint,
  Menu,
  ArrowLeft,
  RefreshCw,
  Eye,
  Trash2,
  Bell,
  BellOff,
  Database,
} from "lucide-react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface RiskIndicator {
  name: string;
  description: string;
  evidence: string;
  severity: string;
  points: number;
}

interface AnalysisResult {
  risk_score: number;
  classification: string;
  indicators: RiskIndicator[];
  recommendation: string;
  urls_found: string[];
}

interface SavedAnalysis extends AnalysisResult {
  id: number;
  subject: string;
  sender_name: string;
  sender_email: string;
  body: string;
  created_at: string;
}

function App() {
  const [subject, setSubject] = useState(
    "Urgent: Your Account Will Be Suspended!"
  );

  const [senderName, setSenderName] = useState("Amazon Security");

  const [senderEmail, setSenderEmail] = useState(
    "security@amaz0n-update.com"
  );

  const [emailBody, setEmailBody] = useState(
    "Dear Customer,\n\nYour account will be suspended in 24 hours due to unusual activity. Click the link below to verify your account immediately:\n\nhttps://amaz0n-update.com/verify"
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activePage, setActivePage] = useState("New Analysis");
  const [scanning, setScanning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // History page state.
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<SavedAnalysis | null>(null);

  // Settings page state.
  const [riskNotifications, setRiskNotifications] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  // Send email details to the FastAPI backend.
  const handleScan = async () => {
    setErrorMessage("");
    setAnalysisResult(null);
    setDetailsOpen(false);

    if (
      !subject.trim() ||
      !senderName.trim() ||
      !senderEmail.trim() ||
      !emailBody.trim()
    ) {
      setErrorMessage("Please complete all email fields before scanning.");
      return;
    }

    setScanning(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analyse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            sender_name: senderName,
            sender_email: senderEmail,
            body: emailBody,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail
              .map(
                (item: { msg?: string }) =>
                  item.msg || "Invalid input"
              )
              .join(", ")
          : data.detail || "The server could not analyse this email.";

        throw new Error(detail);
      }

      setAnalysisResult(data);

      // Refresh history after a successful analysis.
      await loadHistory();
    } catch (error) {
      console.error("Email analysis failed:", error);

      if (error instanceof TypeError) {
        setErrorMessage(
          "Unable to connect to the backend. Please make sure the FastAPI server is running."
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setScanning(false);
    }
  };

  // Retrieve all saved analyses from the backend.
  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/history/`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to retrieve analysis history."
        );
      }

      setHistory(data);
    } catch (error) {
      console.error("Could not load history:", error);

      if (error instanceof TypeError) {
        setHistoryError(
          "Unable to connect to the backend. Please make sure the FastAPI server is running."
        );
      } else if (error instanceof Error) {
        setHistoryError(error.message);
      } else {
        setHistoryError("An unexpected error occurred.");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  // Retrieve one saved analysis by its ID.
  const openHistoryItem = async (analysisId: number) => {
    setHistoryError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/history/${analysisId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to retrieve this analysis."
        );
      }

      setSelectedHistoryItem(data);

      // Populate the original analysis form with saved email details.
      setSubject(data.subject);
      setSenderName(data.sender_name);
      setSenderEmail(data.sender_email);
      setEmailBody(data.body);

      setAnalysisResult({
        risk_score: data.risk_score,
        classification: data.classification,
        indicators: data.indicators,
        recommendation: data.recommendation,
        urls_found: data.urls_found,
      });

      setDetailsOpen(false);
    } catch (error) {
      console.error("Could not open saved analysis:", error);

      if (error instanceof TypeError) {
        setHistoryError(
          "Unable to connect to the backend. Please check that the server is running."
        );
      } else if (error instanceof Error) {
        setHistoryError(error.message);
      } else {
        setHistoryError("An unexpected error occurred.");
      }
    }
  };

  // Delete all saved analysis history.
  const handleDeleteHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all saved analysis history? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);
    setSettingsMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/history/`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete analysis history."
        );
      }

      setHistory([]);
      setSelectedHistoryItem(null);
      setAnalysisResult(null);

      setSettingsMessage(
        `${data.deleted_count} saved analysis record(s) deleted successfully.`
      );
    } catch (error) {
      console.error("Could not delete history:", error);

      if (error instanceof TypeError) {
        setSettingsMessage(
          "Unable to connect to the backend. Please make sure the server is running."
        );
      } else if (error instanceof Error) {
        setSettingsMessage(error.message);
      } else {
        setSettingsMessage(
          "An unexpected error occurred while deleting history."
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Change the current navigation page.
  const handleNavigation = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setHistoryError("");
    setSettingsMessage("");

    if (page === "History") {
      setSelectedHistoryItem(null);
      loadHistory();
    }

    if (page === "Settings") {
      setSelectedHistoryItem(null);
      loadHistory();
    }

    if (page === "New Analysis") {
      setSelectedHistoryItem(null);
    }
  };

  // Return from an individual saved analysis to the history list.
  const returnToHistory = () => {
    setSelectedHistoryItem(null);
    setHistoryError("");
    loadHistory();
  };

  const navigation = [
    { label: "New Analysis", icon: Home },
    { label: "History", icon: Clock },
    { label: "About", icon: Info },
    { label: "Settings", icon: Settings },
  ];

  // Choose an icon based on the detected indicator.
  const getIndicatorIcon = (name: string) => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes("url") || lowerName.includes("link")) {
      return Link;
    }

    if (
      lowerName.includes("sender") ||
      lowerName.includes("impersonation") ||
      lowerName.includes("brand")
    ) {
      return Fingerprint;
    }

    return AlertTriangle;
  };

  const getSeverityClass = (severity: string) => {
    return severity.toLowerCase();
  };

  // Format the date returned by the backend.
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getClassificationColor = (classification: string) => {
    if (classification === "High Risk") return "#dc2626";
    if (classification === "Medium Risk") return "#d97706";
    return "#16a34a";
  };

  return (
    <div className="app-container">
      <div className="dashboard-shell">

        {/* Sidebar */}
        <aside
          className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
        >
          <div className="brand">
            <div className="brand-logo">
              <ShieldCheck size={91} strokeWidth={1.8} />
              <Mail className="brand-mail" size={37} />
              <CheckCircle2 className="brand-check" size={34} />
            </div>

            <h1>
              Phishing
              <br />
              Email Checker
            </h1>

            <p>Think Before You Click</p>
          </div>

          <nav className="sidebar-navigation">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`nav-item ${
                    activePage === item.label ? "active" : ""
                  }`}
                  onClick={() => handleNavigation(item.label)}
                >
                  <Icon size={25} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-safety">
            <div className="safety-heading">
              <ShieldCheck size={32} />
              <strong>Stay Safe Online</strong>
            </div>

            <p>
              Report suspicious
              <br />
              emails and protect
              <br />
              yourself and others.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-area">

          {/* Top navigation bar */}
          <header className="topbar">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <Menu size={24} />
            </button>

            <div className="topbar-right">
              <div className="secure-status">
                <ShieldCheck size={25} />
                <span>Secure Connection</span>
              </div>

              <button className="profile-button" aria-label="User profile">
                <UserCircle size={33} />
              </button>
            </div>
          </header>

          {/* NEW ANALYSIS PAGE */}
          {activePage === "New Analysis" && (
            <section className="workspace">

              {/* Left column: Email input */}
              <div className="email-column">
                <div className="section-heading">
                  <div className="heading-title">
                    <Search size={39} />
                    <h2>Analyse an Email</h2>
                  </div>

                  <p>
                    Paste the email details below to check for phishing threats
                  </p>
                </div>

                <div className="email-form">
                  <div className="form-group">
                    <label htmlFor="subject">Email Subject</label>
                    <input
                      id="subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sender-name">From Name</label>
                    <input
                      id="sender-name"
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Enter sender name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sender-email">From Email Address</label>
                    <input
                      id="sender-email"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="Enter sender email address"
                    />
                  </div>

                  <div className="form-group body-group">
                    <label htmlFor="email-body">Email Body</label>
                    <textarea
                      id="email-body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Paste the email body here..."
                    />
                  </div>

                  <button
                    className="scan-button"
                    onClick={handleScan}
                    disabled={scanning}
                  >
                    <Search size={25} />
                    <span>
                      {scanning ? "Scanning..." : "Scan Email"}
                    </span>
                  </button>

                  {errorMessage && (
                    <div className="api-error" role="alert">
                      <AlertTriangle size={20} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* High-risk notification setting */}
                  {riskNotifications &&
                    analysisResult?.classification === "High Risk" && (
                      <div
                        role="alert"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px",
                          marginTop: "15px",
                          borderRadius: "8px",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #fecaca",
                        }}
                      >
                        <AlertTriangle size={23} />

                        <div>
                          <strong>High-Risk Email Warning</strong>
                          <p style={{ margin: "5px 0 0" }}>
                            This email contains significant phishing
                            indicators. Avoid clicking links or sharing
                            sensitive information.
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Right column: Analysis results */}
              <div className="results-column">

                {/* Risk summary */}
                <div className="risk-summary">
                  <AlertTriangle
                    className="risk-main-icon"
                    size={83}
                  />

                  <div className="risk-message">
                    <h2>
                      {analysisResult
                        ? analysisResult.classification === "High Risk"
                          ? "High Risk – Likely Phishing!"
                          : analysisResult.classification === "Medium Risk"
                            ? "Medium Risk – Exercise Caution!"
                            : "Low Risk – No Strong Indicators!"
                        : "Ready to Analyse"}
                    </h2>

                    <p>
                      {analysisResult
                        ? `${analysisResult.indicators.length} risk indicator(s) detected.`
                        : "Submit an email to see its actual analysis results."}
                    </p>
                  </div>

                  <div className="risk-score">
                    <div className="score-circle">
                      <strong>
                        {analysisResult
                          ? analysisResult.risk_score
                          : "--"}
                      </strong>
                      <span>/100</span>
                    </div>
                  </div>
                </div>

                {/* Risk indicators */}
                <div className="indicators-section">
                  <div className="section-label">
                    <List size={30} strokeWidth={3} />
                    <h2>Detected Risk Indicators</h2>
                  </div>

                  {analysisResult ? (
                    analysisResult.indicators.length > 0 ? (
                      analysisResult.indicators.map((indicator, index) => {
                        const IndicatorIcon = getIndicatorIcon(indicator.name);
                        const severityClass = getSeverityClass(
                          indicator.severity
                        );

                        return (
                          <div
                            className={`indicator-card ${severityClass}-indicator`}
                            key={`${indicator.name}-${index}`}
                          >
                            <IndicatorIcon
                              size={31}
                              className="indicator-icon red-icon"
                            />

                            <div className="indicator-content">
                              <h3>{indicator.name}</h3>
                              <p>{indicator.description}</p>
                            </div>

                            <span className={`severity ${severityClass}`}>
                              {indicator.severity}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="indicator-card">
                        <CheckCircle2
                          size={31}
                          className="indicator-icon"
                        />

                        <div className="indicator-content">
                          <h3>No indicators detected</h3>
                          <p>
                            Our current detection rules did not identify
                            strong phishing indicators.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="indicator-card">
                      <Search
                        size={31}
                        className="indicator-icon"
                      />

                      <div className="indicator-content">
                        <h3>Awaiting Analysis</h3>
                        <p>
                          Detected risk indicators will appear here after
                          you scan an email.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                <div className="recommendation-card">
                  <Lightbulb
                    size={37}
                    className="recommendation-icon"
                  />

                  <div>
                    <h3>Our Recommendation</h3>
                    <p>
                      {analysisResult
                        ? analysisResult.recommendation
                        : "Scan an email to receive a recommendation based on the detected evidence."}
                    </p>
                  </div>
                </div>

                {/* Analysis details */}
                <div className="analysis-details">
                  <button
                    className="details-toggle"
                    onClick={() => setDetailsOpen(!detailsOpen)}
                  >
                    <span>Analysis Details</span>

                    {detailsOpen ? (
                      <ChevronUp size={25} />
                    ) : (
                      <ChevronDown size={25} />
                    )}
                  </button>

                  {detailsOpen && (
                    <div className="details-content">
                      <p>
                        <strong>Subject:</strong> {subject}
                      </p>

                      <p>
                        <strong>Sender name:</strong> {senderName}
                      </p>

                      <p>
                        <strong>Sender email:</strong> {senderEmail}
                      </p>

                      {analysisResult ? (
                        <>
                          <p>
                            <strong>Analysis status:</strong> Completed
                          </p>

                          <p>
                            <strong>Risk score:</strong>{" "}
                            {analysisResult.risk_score}/100
                          </p>

                          <p>
                            <strong>Classification:</strong>{" "}
                            {analysisResult.classification}
                          </p>

                          <p>
                            <strong>Detection indicators:</strong>{" "}
                            {analysisResult.indicators.length}
                          </p>

                          <p>
                            <strong>URLs found:</strong>
                          </p>

                          {analysisResult.urls_found.length > 0 ? (
                            <ul>
                              {analysisResult.urls_found.map((url, index) => (
                                <li key={`${url}-${index}`}>{url}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No URLs were found in the email body.</p>
                          )}

                          <p>
                            <strong>Scoring note:</strong> This is a
                            rule-based heuristic score, not a probability
                            that the email is phishing.
                          </p>
                        </>
                      ) : (
                        <p>
                          No analysis has been completed yet. Submit the
                          email to retrieve results from the backend.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* HISTORY PAGE */}
          {activePage === "History" && !selectedHistoryItem && (
            <section
              style={{
                padding: "30px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginBottom: "25px",
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 8px", color: "#172b4d" }}>
                    Analysis History
                  </h2>

                  <p style={{ margin: 0, color: "#64748b" }}>
                    Review your previously analysed emails and their results.
                  </p>
                </div>

                <button
                  onClick={loadHistory}
                  disabled={historyLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 16px",
                    border: "1px solid #dbe3ed",
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "#243b60",
                    cursor: historyLoading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={17} />
                  {historyLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {historyError && (
                <div
                  role="alert"
                  style={{
                    padding: "14px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    color: "#b91c1c",
                  }}
                >
                  {historyError}
                </div>
              )}

              {historyLoading ? (
                <div
                  style={{
                    padding: "45px 20px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <RefreshCw
                    size={30}
                    style={{ marginBottom: "12px" }}
                  />
                  <p>Loading your analysis history...</p>
                </div>
              ) : history.length === 0 ? (
                <div
                  style={{
                    padding: "55px 20px",
                    textAlign: "center",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                >
                  <Clock
                    size={45}
                    color="#64748b"
                    style={{ marginBottom: "12px" }}
                  />

                  <h3 style={{ color: "#243b60", margin: "0 0 8px" }}>
                    No Analysis History Yet
                  </h3>

                  <p style={{ color: "#64748b" }}>
                    Emails you analyse will appear here.
                  </p>

                  <button
                    className="scan-button"
                    onClick={() => handleNavigation("New Analysis")}
                    style={{ marginTop: "15px" }}
                  >
                    <Search size={20} />
                    <span>Analyse an Email</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <p style={{ color: "#64748b", margin: "0 0 5px" }}>
                    {history.length} saved analysis
                    {history.length === 1 ? "" : "es"}
                  </p>

                  {history.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "18px",
                        flexWrap: "wrap",
                        padding: "20px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      <div style={{ flex: "1", minWidth: "220px" }}>
                        <h3
                          style={{
                            margin: "0 0 8px",
                            color: "#243b60",
                            fontSize: "16px",
                          }}
                        >
                          {item.subject}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 7px",
                            color: "#64748b",
                            fontSize: "14px",
                          }}
                        >
                          From: {item.sender_name} ({item.sender_email})
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          <Clock
                            size={13}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: "5px",
                            }}
                          />
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "22px",
                              color: getClassificationColor(
                                item.classification
                              ),
                            }}
                          >
                            {item.risk_score}/100
                          </strong>

                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "12px",
                            }}
                          >
                            Risk score
                          </span>
                        </div>

                        <span
                          style={{
                            padding: "7px 11px",
                            borderRadius: "20px",
                            background:
                              item.classification === "High Risk"
                                ? "#fee2e2"
                                : item.classification === "Medium Risk"
                                  ? "#fef3c7"
                                  : "#dcfce7",
                            color: getClassificationColor(
                              item.classification
                            ),
                            fontSize: "12px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.classification}
                        </span>

                        <button
                          onClick={() => openHistoryItem(item.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            padding: "10px 14px",
                            border: "none",
                            borderRadius: "7px",
                            background: "#243b60",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SAVED ANALYSIS DETAILS */}
          {activePage === "History" && selectedHistoryItem && (
            <section
              style={{
                padding: "30px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <button
                onClick={returnToHistory}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  padding: "10px 14px",
                  border: "1px solid #dbe3ed",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#243b60",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={18} />
                Back to History
              </button>

              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ color: "#243b60", marginTop: 0 }}>
                  Saved Analysis #{selectedHistoryItem.id}
                </h2>

                <p>
                  <strong>Subject:</strong> {selectedHistoryItem.subject}
                </p>

                <p>
                  <strong>Sender name:</strong>{" "}
                  {selectedHistoryItem.sender_name}
                </p>

                <p>
                  <strong>Sender email:</strong>{" "}
                  {selectedHistoryItem.sender_email}
                </p>

                <p>
                  <strong>Date analysed:</strong>{" "}
                  {formatDate(selectedHistoryItem.created_at)}
                </p>

                <p>
                  <strong>Risk score:</strong>{" "}
                  {selectedHistoryItem.risk_score}/100
                </p>

                <p>
                  <strong>Classification:</strong>{" "}
                  {selectedHistoryItem.classification}
                </p>

                <p>
                  <strong>Recommendation:</strong>{" "}
                  {selectedHistoryItem.recommendation}
                </p>

                <div style={{ marginTop: "20px" }}>
                  <strong>Email body:</strong>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      padding: "15px",
                      marginTop: "10px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      color: "#334155",
                      fontFamily: "inherit",
                    }}
                  >
                    {selectedHistoryItem.body}
                  </pre>
                </div>
              </div>

              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                <h3 style={{ color: "#243b60", marginTop: 0 }}>
                  Detected Risk Indicators
                </h3>

                {selectedHistoryItem.indicators.length > 0 ? (
                  selectedHistoryItem.indicators.map((indicator, index) => (
                    <div
                      key={`${indicator.name}-${index}`}
                      style={{
                        padding: "14px 0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <strong>{indicator.name}</strong>

                      <p style={{ color: "#64748b", margin: "7px 0" }}>
                        {indicator.description}
                      </p>

                      <p style={{ color: "#64748b", margin: "5px 0" }}>
                        <strong>Evidence:</strong> {indicator.evidence}
                      </p>

                      <p style={{ color: "#64748b", margin: "5px 0" }}>
                        <strong>Severity:</strong> {indicator.severity}
                        {" · "}
                        <strong>Points:</strong> {indicator.points}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No risk indicators were detected.</p>
                )}

                <h3 style={{ color: "#243b60", marginTop: "22px" }}>
                  URLs Found
                </h3>

                {selectedHistoryItem.urls_found.length > 0 ? (
                  <ul>
                    {selectedHistoryItem.urls_found.map((url, index) => (
                      <li key={`${url}-${index}`}>{url}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No URLs were found in this email.</p>
                )}
              </div>
            </section>
          )}

          {/* ABOUT PAGE */}
          {activePage === "About" && (
            <section style={{ padding: "30px" }}>
              <h2 style={{ color: "#243b60" }}>
                About Phishing Email Checker
              </h2>

              <p style={{ color: "#64748b", lineHeight: 1.7 }}>
                Phishing Email Checker helps users identify suspicious
                emails by analysing sender details, email content,
                suspicious links, impersonation attempts and other
                phishing indicators.
              </p>

              <p style={{ color: "#64748b", lineHeight: 1.7 }}>
                The application uses a rule-based detection engine to
                calculate a risk score and provide recommendations.
                Its score is a heuristic assessment, not a probability
                that an email is phishing.
              </p>
            </section>
          )}

          {/* SETTINGS PAGE */}
          {activePage === "Settings" && (
            <section
              style={{
                padding: "30px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ marginBottom: "28px" }}>
                <h2 style={{ color: "#243b60", margin: "0 0 8px" }}>
                  Settings
                </h2>

                <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                  Manage your notification preferences, analysis data and
                  information about the detection engine.
                </p>
              </div>

              {/* Risk Notifications */}
              <div
                style={{
                  padding: "22px",
                  marginBottom: "20px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <Bell size={25} color="#243b60" />
                  <h3 style={{ color: "#243b60", margin: 0 }}>
                    Risk Notifications
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <strong style={{ color: "#334155" }}>
                      High-Risk Email Warnings
                    </strong>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        margin: "6px 0 0",
                      }}
                    >
                      Display a warning whenever an analysed email is
                      classified as High Risk.
                    </p>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      cursor: "pointer",
                      color: "#334155",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={riskNotifications}
                      onChange={(e) => setRiskNotifications(e.target.checked)}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />

                    {riskNotifications ? (
                      <>
                        <Bell size={18} />
                        Enabled
                      </>
                    ) : (
                      <>
                        <BellOff size={18} />
                        Disabled
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Data Management */}
              <div
                style={{
                  padding: "22px",
                  marginBottom: "20px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <Database size={25} color="#243b60" />
                  <h3 style={{ color: "#243b60", margin: 0 }}>
                    Data Management
                  </h3>
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  Manage the analysis records stored in your local
                  application database.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    padding: "15px",
                    margin: "18px 0",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <strong style={{ color: "#243b60" }}>
                      Saved Analysis Records
                    </strong>

                    <p
                      style={{
                        color: "#64748b",
                        margin: "5px 0 0",
                        fontSize: "13px",
                      }}
                    >
                      Number of records currently saved in the database.
                    </p>
                  </div>

                  <strong
                    style={{
                      color: "#243b60",
                      fontSize: "25px",
                    }}
                  >
                    {historyLoading ? "..." : history.length}
                  </strong>
                </div>

                <button
                  onClick={handleDeleteHistory}
                  disabled={deleteLoading || historyLoading || history.length === 0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "9px",
                    padding: "11px 16px",
                    border: "none",
                    borderRadius: "8px",
                    background:
                      deleteLoading || historyLoading || history.length === 0
                        ? "#cbd5e1"
                        : "#dc2626",
                    color: "#ffffff",
                    cursor:
                      deleteLoading || historyLoading || history.length === 0
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={18} />
                  {deleteLoading ? "Deleting..." : "Clear Analysis History"}
                </button>

                {settingsMessage && (
                  <p
                    role="status"
                    style={{
                      marginTop: "14px",
                      color: settingsMessage.includes("successfully")
                        ? "#15803d"
                        : "#b91c1c",
                      fontSize: "14px",
                    }}
                  >
                    {settingsMessage}
                  </p>
                )}
              </div>

              {/* About the Detection Engine */}
              <div
                style={{
                  padding: "22px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <Cog size={25} color="#243b60" />
                  <h3 style={{ color: "#243b60", margin: 0 }}>
                    About the Detection Engine
                  </h3>
                </div>

                <p style={{ color: "#64748b", lineHeight: 1.7 }}>
                  The Phishing Email Checker uses a Python-based,
                  rule-based detection engine to examine email details
                  and identify common phishing indicators.
                </p>

                <strong style={{ color: "#334155" }}>
                  What the engine checks
                </strong>

                <ul
                  style={{
                    color: "#64748b",
                    lineHeight: 1.9,
                    paddingLeft: "22px",
                  }}
                >
                  <li>Suspicious URLs and potentially deceptive links.</li>
                  <li>Known URL shorteners.</li>
                  <li>Lookalike domains and brand impersonation.</li>
                  <li>Urgent or threatening language.</li>
                  <li>Requests for passwords or other sensitive information.</li>
                  <li>Sender display-name and email-address inconsistencies.</li>
                </ul>

                <strong style={{ color: "#334155" }}>
                  Risk classification ranges
                </strong>

                <div
                  style={{
                    overflowX: "auto",
                    marginTop: "12px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#334155",
                          }}
                        >
                          Classification
                        </th>

                        <th
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#334155",
                          }}
                        >
                          Score Range
                        </th>

                        <th
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#334155",
                          }}
                        >
                          Meaning
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          Low Risk
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#64748b",
                          }}
                        >
                          0–29
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#64748b",
                          }}
                        >
                          Few strong indicators detected.
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#d97706",
                            fontWeight: 600,
                          }}
                        >
                          Medium Risk
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#64748b",
                          }}
                        >
                          30–59
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#64748b",
                          }}
                        >
                          Some suspicious indicators detected.
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "12px",
                            color: "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          High Risk
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            color: "#64748b",
                          }}
                        >
                          60–100
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            color: "#64748b",
                          }}
                        >
                          Significant phishing indicators detected.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    padding: "14px",
                    marginTop: "18px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    color: "#92400e",
                    fontSize: "14px",
                    lineHeight: 1.7,
                  }}
                >
                  <strong>Important limitation</strong>
                  <p style={{ margin: "5px 0 0" }}>
                    The risk score is a heuristic assessment based on
                    detection rules. It is not a probability that an
                    email is phishing. A Low Risk result does not
                    guarantee that an email is safe.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* How it works section: New Analysis page only */}
      {activePage === "New Analysis" && (
        <section className="how-it-works">
          <h2 className="how-title">How It Works</h2>

          <div className="workflow-layout">
            <div className="workflow-card">
              <span className="step-number">1</span>
              <h3>Enter Email</h3>
              <Mail size={43} className="workflow-icon" />
              <p>
                Paste the email details
                <br />
                into the app.
              </p>
            </div>

            <span className="workflow-arrow">➜</span>

            <div className="workflow-card">
              <span className="step-number">2</span>
              <h3>Analysis</h3>
              <Cog size={45} className="workflow-icon" />
              <p>
                Our smart engine checks
                <br />
                for phishing signs.
              </p>
            </div>

            <span className="workflow-arrow">➜</span>

            <div className="workflow-card">
              <span className="step-number">3</span>
              <h3>Get Results</h3>
              <ShieldCheck
                size={47}
                className="workflow-icon success-icon"
              />
              <p>
                See the risk level,
                <br />
                reasons and advice.
              </p>
            </div>

            <span className="workflow-arrow">➜</span>

            <div className="workflow-card">
              <span className="step-number">4</span>
              <h3>Stay Protected</h3>
              <LockKeyhole size={44} className="workflow-icon" />
              <p>
                Avoid scams and
                <br />
                keep your data safe.
              </p>
            </div>

            <div className="key-features">
              <h2>Key Features</h2>

              <ul>
                <li>
                  <CheckCircle2 />
                  <span>Detects phishing links and scams</span>
                </li>

                <li>
                  <CheckCircle2 />
                  <span>Explains the risks in simple terms</span>
                </li>

                <li>
                  <CheckCircle2 />
                  <span>Keeps a history of your analyses</span>
                </li>

                <li>
                  <CheckCircle2 />
                  <span>Built with Python & React</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
