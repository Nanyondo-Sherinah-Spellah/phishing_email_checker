
import pytest

from app.services.detector import analyse_email


def test_detects_urgent_language():
    result = analyse_email(
        subject="Urgent: Account suspended",
        sender_name="Support",
        sender_email="support@example.com",
        body="Your account will be suspended. Act now.",
    )

    assert result["risk_score"] > 0
    assert any(
        indicator["name"] == "Urgent Language"
        for indicator in result["indicators"]
    )


def test_detects_suspicious_brand_domain():
    result = analyse_email(
        subject="Verify your Amazon account",
        sender_name="Support",
        sender_email="support@example.com",
        body="Please visit https://amaz0n.com/verify to continue.",
    )

    brand_indicator = next(
        (
            indicator
            for indicator in result["indicators"]
            if indicator["name"] == "Possible Brand Impersonation"
        ),
        None,
    )

    assert brand_indicator is not None
    assert "amaz0n.com" in brand_indicator["evidence"]


@pytest.mark.parametrize(
    "suspicious_url",
    [
        "https://amaz0n-update.com/verify",
        "https://paypa1-security.com/login",
        "https://g00gle-login.com/verify",
    ],
)
def test_detects_common_brand_character_substitutions(suspicious_url):
    result = analyse_email(
        subject="Account verification",
        sender_name="Support",
        sender_email="support@example.com",
        body=f"Please verify your account here: {suspicious_url}",
    )

    assert any(
        indicator["name"] == "Possible Brand Impersonation"
        for indicator in result["indicators"]
    )


def test_legitimate_amazon_domain_is_not_flagged():
    result = analyse_email(
        subject="Amazon order confirmation",
        sender_name="Support",
        sender_email="support@amazon.com",
        body="Visit https://amazon.com/orders to view your order.",
    )

    assert not any(
        indicator["name"] == "Possible Brand Impersonation"
        for indicator in result["indicators"]
    )


def test_detects_sensitive_information_request():
    result = analyse_email(
        subject="Account verification",
        sender_name="Support",
        sender_email="support@example.com",
        body="Please provide your password and verification code.",
    )

    assert any(
        indicator["name"] == "Sensitive Information Request"
        for indicator in result["indicators"]
    )


def test_clean_email_has_no_detected_indicators():
    result = analyse_email(
        subject="Meeting reminder",
        sender_name="Jane",
        sender_email="jane@example.com",
        body="Hello, our team meeting is scheduled for tomorrow at 10 AM.",
    )

    assert result["risk_score"] == 0
    assert result["indicators"] == []
    assert result["classification"] == "Low Risk"


def test_risk_score_never_exceeds_100():
    result = analyse_email(
        subject="URGENT: Your account will be suspended immediately",
        sender_name="Amazon Security",
        sender_email="security@amaz0n-update.com",
        body=(
            "Act now. Provide your password and OTP. "
            "Visit https://amaz0n-update.com/verify"
        ),
    )

    assert 0 <= result["risk_score"] <= 100
