import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import styles from './OtpVerify.module.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function OtpVerify() {
  const { orderRef } = useParams<{ orderRef: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();

  const phone = (location.state as { phone?: string; email?: string })?.phone ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1) {
      const full = [...newDigits.slice(0, index), digit].join('');
      if (full.length === OTP_LENGTH) {
        handleVerify(full);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = [...digits];
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch; });
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => !d);
    const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === OTP_LENGTH) handleVerify(pasted);
  };

  const handleVerify = useCallback(async (otp?: string) => {
    const code = otp ?? digits.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }
    if (!orderRef) return;
    setLoading(true);
    setError('');
    try {
      await verifyOtp(orderRef, code);
      navigate(`/track/${orderRef}`, { replace: true });
    } catch {
      setError(t('invalidOtp'));
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, [digits, orderRef, navigate, t]);

  const handleResend = async () => {
    if (cooldown > 0 || !orderRef) return;
    setResending(true);
    try {
      await resendOtp(orderRef);
      toast(t('otpResent'), 'success');
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      toast(t('error'), 'error');
    } finally {
      setResending(false);
    }
  };

  const otp = digits.join('');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>📱</span>
        </div>

        <h1 className={styles.title}>{t('verifyOrder')}</h1>

        <p className={styles.subtitle}>
          {t('otpSent')}{' '}
          {phone ? (
            <strong className={styles.phone}>
              +91 {phone.replace(/(\d{5})(\d{5})/, '•••••$2')}
            </strong>
          ) : (
            'your phone'
          )}
        </p>

        <p className={styles.orderRefLabel}>
          Order: <span className={styles.orderRef}>{orderRef}</span>
        </p>

        <div className={styles.otpRow} onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              className={`${styles.digitInput} ${error ? styles.digitError : ''} ${digit ? styles.digitFilled : ''}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`OTP digit ${i + 1}`}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
            />
          ))}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onClick={() => handleVerify()}
          disabled={otp.length < OTP_LENGTH || loading}
        >
          {loading ? t('verifying') : t('verify')}
        </Button>

        <div className={styles.resendRow}>
          {cooldown > 0 ? (
            <p className={styles.resendTimer}>
              {t('resendIn')} {cooldown}{t('seconds')}
            </p>
          ) : (
            <button
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? '…' : t('resendOtp')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
