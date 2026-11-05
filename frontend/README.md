# Phishing Email Checker

A rule-based web application for analysing email content, identifying potential phishing indicators, and communicating email security risks in a clear and understandable way.

## 1. Project Description

The Phishing Email Checker is a cybersecurity application designed to help users recognise potentially malicious or deceptive emails.

Users can submit email information, including the subject, sender details, and message body. The application analyses the submitted content using predefined detection rules and produces a risk score, risk classification, detected indicators, and recommended safety actions.

The application is intended for awareness, preliminary assessment, and educational purposes. It does not replace professional security tools or human security investigation.

## 2. Problem Statement

Phishing is a social engineering technique in which attackers use deceptive emails to trick recipients into revealing sensitive information, transferring money, opening malicious attachments, or visiting unsafe websites.

Some phishing emails imitate trusted organisations, use urgent language, include suspicious links, or request passwords and other confidential information.

Users may find it difficult to distinguish legitimate messages from deceptive ones, particularly when attackers imitate familiar brands or communication styles.

The project addresses this problem by providing an accessible tool that examines email content for common phishing indicators and explains the potential risks to the user.

## 3. Target Users

The application is intended for:

- Individuals who want to assess suspicious emails.
- Students learning about phishing and email security.
- Small organisations seeking a basic email-awareness tool.
- Cybersecurity learners and educators demonstrating phishing detection concepts.

## 4. Main Features

- **Email analysis:** Accepts email subjects, sender information, and message content for analysis.
- **Suspicious URL detection:** Identifies potentially suspicious URL patterns, including URL shorteners, IP-address-based URLs, and lookalike domains.
- **Brand impersonation detection:** Checks for possible attempts to imitate recognised organisations.
- **Suspicious language detection:** Identifies indicators such as urgency, threats, and requests for sensitive information.
- **Risk scoring:** Assigns a heuristic risk score to the submitted email.
- **Risk classification:** Groups results into Low, Medium, and High risk categories.
- **Indicator explanations:** Displays the suspicious characteristics identified during analysis.
- **Safety recommendations:** Provides suggested actions based on the analysis.
- **Analysis history:** Allows users to review previous analyses, where enabled by the application.

## 5. Technologies Used

| Component                                 | Technology        |
| ----------------------------------------- | ----------------- |
| Frontend                                  | React             |
| Programming language                      | TypeScript        |
| Frontend development server               | Vite              |
| Backend framework                         | FastAPI           |
| Backend language                          | Python            |
| Database                                  | SQLite            |
| Database toolkit                          | SQLAlchemy        |
| Python environment and dependency manager | uv                |
| API documentation                         | FastAPI / OpenAPI |
| Testing                                   | pytest            |

## 6. Project Structure

The project is organised into separate frontend, backend, and documentation directories.

```text
phishing-email-checker/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   └── detector.py
│   │   └── main.py
│   ├── tests/
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── ...
│
└
```

Note: This is the documented high-level structure. Update it to reflect the complete directory and file names in the final repository.

## 7. Installation Instructions

### Prerequisites

Install the following:

- Python 3.12 or a compatible supported version.
- uv.
- Node.js and npm.
- Git.
- Visual Studio Code or another suitable code editor.

### Clone the repository

```bash
git clone https://github.com/Nanyondo-Sherinah-Spellah/phishing_email_checker.git
cd phishing-email-checker
```


### Backend setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Install the project dependencies:

```bash
uv sync
```

If the project uses a different dependency installation process, follow the instructions in its `pyproject.toml`.

## 8. Starting the Application

The backend and frontend must run in separate terminals.

### Start the backend

From the project root:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server should display a local address, normally:

```text
http://localhost:5173/
```

Open the displayed address in a web browser to access the application.

Keep both terminals running while using the application.

## 9. API Documentation

FastAPI provides interactive API documentation through Swagger UI.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

The documentation allows developers to inspect available endpoints and submit test requests.

The application includes the following known endpoints:

| Method | Endpoint                     | Purpose                         |
| ------ | ---------------------------- | ------------------------------- |
| GET    | `/`                          | Backend root endpoint           |
| GET    | `/api/health`                | Health check                    |
| POST   | `/api/analyse`               | Analyse submitted email content |
| GET    | `/api/history/`              | Retrieve analysis history       |
| GET    | `/api/history/{analysis_id}` | Retrieve a specific analysis    |
| DELETE | `/api/history/`              | Clear analysis history          |

The exact request and response schemas should be confirmed against the running API documentation.

## 10. Running Tests

### Backend tests

Navigate to the backend directory:

```bash
cd backend
```

Run:

```bash
uv run pytest -v
```

Review the output to identify passed, failed, or skipped tests.

### Frontend production build

Navigate to the frontend directory:

```bash
cd frontend
```

Run:

```bash
npm run build
```

A successful build indicates that the frontend has compiled without build-blocking errors. It does not, by itself, establish that every frontend feature works correctly.

Record the actual test and build results when preparing the project submission.

## 11. Fictional Usage Example

The following example is fictional and intended only to demonstrate the application's purpose.

**Email subject:** Urgent: Verify Your Account

**Sender display name:** Example Bank Security Team

**Sender address:** [security@example-bank.test](mailto\:security@example-bank.test)

**Email body:**

> Dear Customer,
>
> Your account will be suspended today unless you verify your details immediately.
>
> Click the link below to confirm your account and prevent access restrictions:
>
> [http://example-bank-verification.test/login](http://example-bank-verification.test/login)
>
> Failure to act may result in permanent account suspension.

**Expected analysis considerations:**

- Urgent language and a threat of account suspension.
- A request to verify account details.
- A potentially deceptive verification link.
- Possible impersonation of a financial institution.

The application should report the indicators it actually detects and calculate the risk classification using its implemented rules. No fixed score is assumed in this example.

The `.test` domains are fictional examples and should not be treated as real banking websites.

## 12. Privacy and Security Considerations

- Use fictional or otherwise authorized sample emails during testing.
- Do not submit passwords, OTPs, financial details, or other sensitive personal information.
- Do not automatically visit suspicious URLs.
- Do not submit private email content or URLs to external reputation services without explicit consent.
- Treat analysis results as preliminary indicators rather than definitive proof.
- Review how analysis history is stored, accessed, and deleted before using the application with real email content.
- Restrict access to the application and its database to authorized users.
- Avoid including personal email content, credentials, API keys, or other secrets in screenshots, logs, or project documentation.

**Important:** The current implementation includes SQLite-backed analysis history. Users should be informed about what information is retained, where it is stored, and how it can be deleted. The privacy implications must be assessed before real user data is used.

## 13. Limitations

- Detection is based on predefined rules rather than a trained machine-learning model.
- Risk scores are heuristic values and do not represent statistical probabilities.
- The application may produce false positives or fail to identify some phishing emails.
- New phishing techniques may not be recognized by existing rules.
- The application does not guarantee that an email classified as Low Risk is safe.
- It does not replace email security gateways, antivirus software, threat intelligence platforms, or professional security assessments.
- Testing with fictional samples cannot establish performance against all real-world phishing campaigns.

## 14. Project Purpose

The Phishing Email Checker demonstrates how a practical defensive cybersecurity tool can help users recognize common phishing indicators, understand potential email-related risks, and make more informed security decisions.

It also provides a learning platform for exploring rule-based detection, API development, application testing, secure data handling, and cybersecurity reporting.

## 15. Project Repository

Repository: `https://github.com/Nanyondo-Sherinah-Spellah/phishing_email_checker.git`

## 16. User guide

To open the reports(pdfs) in the doc folder, install the vscode
-pdf extension in your vscode