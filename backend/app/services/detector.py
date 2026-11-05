
import re
from difflib import SequenceMatcher
from urllib.parse import urlparse


# Common URL shorteners that can conceal the final destination.
URL_SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "cutt.ly",
    "ow.ly",
    "shorturl.at",
}


# Brands used for an initial, limited impersonation check.
KNOWN_BRANDS = {
    "amazon": {"amazon.com"},
    "paypal": {"paypal.com"},
    "google": {"google.com"},
    "microsoft": {"microsoft.com"},
    "apple": {"apple.com"},
    "facebook": {"facebook.com"},
}


URGENT_PHRASES = [
    "immediately",
    "urgent",
    "act now",
    "within 24 hours",
    "account suspended",
    "account will be suspended",
    "final warning",
    "limited time",
    "verify now",
    "failure to respond",
]


SENSITIVE_REQUESTS = [
    "password",
    "one-time password",
    "otp",
    "verification code",
    "bank details",
    "credit card",
    "debit card",
    "social security number",
    "login credentials",
]


URL_PATTERN = re.compile(
    r"https?://[^\s<>\"']+|www\.[^\s<>\"']+",
    re.IGNORECASE,
)


EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$"
)


def extract_urls(text: str) -> list[str]:
    """Extract URLs from the email text."""
    return URL_PATTERN.findall(text)


def get_domain(url: str) -> str | None:
    """Extract the hostname from a URL."""
    if url.lower().startswith("www."):
        url = "https://" + url

    try:
        hostname = urlparse(url).hostname
        return hostname.lower().rstrip(".") if hostname else None
    except ValueError:
        return None


def domain_matches_brand(domain: str, brand: str) -> bool:
    """Check whether a domain belongs to a brand's known domains."""
    return any(
        domain == trusted_domain
        or domain.endswith("." + trusted_domain)
        for trusted_domain in KNOWN_BRANDS[brand]
    )


def normalize_domain_label(label: str) -> str:
    """
    Replace common number and symbol substitutions
    used in lookalike domains.
    """

    substitutions = str.maketrans({
        "0": "o",
        "1": "l",
        "3": "e",
        "5": "s",
        "7": "t",
        "@": "a",
        "$": "s",
    })

    return label.lower().translate(substitutions)


def is_lookalike_domain(domain: str, brand: str) -> bool:
    """
    Check whether a domain contains a label that resembles
    a known brand after normalisation.
    """

    domain_label = domain.split(".")[0]

    # Examine separate words in domains such as amaz0n-update.
    domain_parts = re.split(r"[-_]", domain_label)

    for part in domain_parts:
        normalized_part = normalize_domain_label(part)

        # Detect exact brand matches after character substitution.
        if normalized_part == brand and part != brand:
            return True

        # Detect other close spelling variations.
        similarity = SequenceMatcher(
            None,
            normalized_part,
            brand,
        ).ratio()

        if similarity >= 0.80 and normalized_part != brand:
            return True

    return False


def add_indicator(
    indicators: list[dict],
    name: str,
    description: str,
    evidence: str,
    severity: str,
    points: int,
) -> None:
    """Add an evidence-backed indicator to the results."""
    indicators.append(
        {
            "name": name,
            "description": description,
            "evidence": evidence,
            "severity": severity,
            "points": points,
        }
    )


def analyse_email(
    subject: str,
    sender_name: str,
    sender_email: str,
    body: str,
) -> dict:
    """
    Analyse an email using explainable phishing detection rules.

    Returns a risk score, classification, indicators and recommendation.
    """

    indicators = []

    full_text = f"{subject}\n{body}".lower()
    urls = extract_urls(body)

    # 1. Check the sender email format.
    if not EMAIL_PATTERN.fullmatch(sender_email.strip()):
        add_indicator(
            indicators,
            name="Invalid Sender Address",
            description=(
                "The sender address does not follow a normal email format."
            ),
            evidence=f"Sender address: {sender_email}",
            severity="medium",
            points=15,
        )

    # 2. Check for suspicious URL characteristics.
    for url in urls:
        domain = get_domain(url)

        if not domain:
            continue

        if domain.startswith("xn--") or ".xn--" in domain:
            add_indicator(
                indicators,
                name="Internationalised Domain",
                description=(
                    "The URL uses an encoded internationalised domain."
                ),
                evidence=f"URL: {url}",
                severity="medium",
                points=15,
            )

        if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", domain):
            add_indicator(
                indicators,
                name="IP-Based Link",
                description=(
                    "The link uses an IP address instead of a domain name."
                ),
                evidence=f"URL: {url}",
                severity="high",
                points=25,
            )

        if domain in URL_SHORTENERS:
            add_indicator(
                indicators,
                name="Shortened URL",
                description=(
                    "The link uses a URL-shortening service that "
                    "hides its final destination."
                ),
                evidence=f"URL: {url}",
                severity="medium",
                points=15,
            )

        # Check for brand names with suspiciously similar domains.
        for brand in KNOWN_BRANDS:
            if domain_matches_brand(domain, brand):
                continue

            if is_lookalike_domain(domain, brand):
                add_indicator(
                    indicators,
                    name="Possible Brand Impersonation",
                    description=(
                        f"The URL domain appears to imitate "
                        f"the known brand '{brand}'."
                    ),
                    evidence=f"Suspicious domain: {domain}",
                    severity="high",
                    points=25,
                )
                break

    # 3. Check for urgency and pressure tactics.
    for phrase in URGENT_PHRASES:
        if phrase in full_text:
            add_indicator(
                indicators,
                name="Urgent Language",
                description=(
                    "The email uses language that may pressure "
                    "the recipient into acting quickly."
                ),
                evidence=f"Detected phrase: '{phrase}'",
                severity="medium",
                points=10,
            )
            break

    # 4. Check for requests for sensitive information.
    for phrase in SENSITIVE_REQUESTS:
        if phrase in full_text:
            add_indicator(
                indicators,
                name="Sensitive Information Request",
                description=(
                    "The email mentions credentials or sensitive "
                    "financial information."
                ),
                evidence=f"Detected term: '{phrase}'",
                severity="high",
                points=20,
            )
            break

    # 5. Check whether a sender claims to represent a brand
    # but uses an unrelated email domain.
    sender_domain = (
        sender_email.rsplit("@", 1)[-1].lower()
        if "@" in sender_email
        else ""
    )

    for brand, trusted_domains in KNOWN_BRANDS.items():
        if brand in sender_name.lower() and sender_domain:
            if not any(
                sender_domain == trusted
                or sender_domain.endswith("." + trusted)
                for trusted in trusted_domains
            ):
                add_indicator(
                    indicators,
                    name="Possible Sender Impersonation",
                    description=(
                        f"The sender display name mentions '{brand}', "
                        "but the email domain is not one of its listed domains."
                    ),
                    evidence=(
                        f"Sender name: {sender_name}; "
                        f"sender domain: {sender_domain}"
                    ),
                    severity="high",
                    points=25,
                )
                break

    # 6. Calculate the risk score.
    # This score is a heuristic, not a probability of phishing.
    raw_score = sum(item["points"] for item in indicators)
    risk_score = min(raw_score, 100)

    if risk_score >= 60:
        classification = "High Risk"
        recommendation = (
            "Do not click links, open attachments or share personal "
            "information. Verify the sender through an official channel."
        )

    elif risk_score >= 30:
        classification = "Medium Risk"
        recommendation = (
            "Exercise caution. Verify the sender and inspect links "
            "before taking action."
        )

    else:
        classification = "Low Risk"
        recommendation = (
            "No strong phishing indicators were detected by these rules. "
            "This does not guarantee that the email is safe."
        )

    return {
        "risk_score": risk_score,
        "classification": classification,
        "indicators": indicators,
        "recommendation": recommendation,
        "urls_found": urls,
    }
