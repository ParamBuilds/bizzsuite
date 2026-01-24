import { useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

// Common weak passwords to reject
const commonPasswords = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', 'master', 'dragon', 'letmein', 'login', 'admin', 'welcome',
  'password1', 'iloveyou', 'sunshine', 'princess', 'football', 'baseball',
];

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  isValid: boolean;
  isCommon: boolean;
} {
  if (!password) {
    return { score: 0, label: '', color: '', isValid: false, isCommon: false };
  }

  const isCommon = commonPasswords.some(
    (common) => password.toLowerCase().includes(common)
  );

  const passedRequirements = requirements.filter((req) => req.test(password)).length;
  const score = passedRequirements;

  let label = '';
  let color = '';

  if (isCommon) {
    return { score: 0, label: 'Common password - easily guessed', color: 'bg-destructive', isValid: false, isCommon: true };
  }

  if (score <= 2) {
    label = 'Weak';
    color = 'bg-destructive';
  } else if (score <= 3) {
    label = 'Fair';
    color = 'bg-warning';
  } else if (score <= 4) {
    label = 'Good';
    color = 'bg-success/70';
  } else {
    label = 'Strong';
    color = 'bg-success';
  }

  return {
    score,
    label,
    color,
    isValid: score >= 4 && !isCommon,
    isCommon,
  };
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              'font-medium',
              strength.score <= 2 && 'text-destructive',
              strength.score === 3 && 'text-warning',
              strength.score >= 4 && 'text-success'
            )}
          >
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                index <= strength.score ? strength.color : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Common password warning */}
      {strength.isCommon && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>This is a commonly used password and is easily guessed. Please choose a more unique password.</span>
        </div>
      )}

      {/* Requirements list */}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req) => {
            const passed = req.test(password);
            return (
              <li
                key={req.label}
                className={cn(
                  'flex items-center gap-2 text-xs transition-colors',
                  passed ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
