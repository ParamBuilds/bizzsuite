

## Plan: Update Edge Function to Use Verified Domain

### What Needs to Change

Update the `from` field in the `send-license-key` edge function from:
```typescript
from: "BizSuite <onboarding@resend.dev>"
```

To your verified domain:
```typescript
from: "BizSuite <noreply@yourdomain.com>"
```

### Implementation Steps

1. **Update edge function** (`supabase/functions/send-license-key/index.ts`)
   - Change line 87 to use your verified domain email address
   - Example: `from: "BizSuite <noreply@bizsuite.in>"`

2. **Redeploy the function**
   - The function will automatically redeploy when we save changes

3. **Test the email delivery**
   - Resend a license key to the user `c4fed669-a799-4c79-a983-a03ddc1bcb52`
   - Verify email arrives in inbox (not spam)

### Note

Before implementing, please confirm:
- What domain have you verified (or plan to verify) in Resend?
- What email address format do you want to use? (e.g., `noreply@yourdomain.com`, `support@yourdomain.com`, `license@yourdomain.com`)

