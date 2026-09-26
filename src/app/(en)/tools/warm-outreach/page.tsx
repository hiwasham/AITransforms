'use client';

import PasswordGate from '@/components/PasswordGate';
import { useEffect, useRef } from 'react';

// SHA-256 hash of "warmoutreach2024"
// To generate a new hash, run: node -e "console.log(require('crypto').createHash('sha256').update('your-password').digest('hex'))"
const PASSWORD_HASH = 'be62c58182c1628f5b5ecc4b71bf4caf838634d8b2d8ac06d14995e947e54754';

export default function WarmOutreachDashboardPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // The iframe loads the standalone HTML dashboard
    // We keep it as-is to preserve its localStorage persistence and all functionality
  }, []);

  return (
    <PasswordGate correctPasswordHash={PASSWORD_HASH}>
      <div className="fixed inset-0 w-full h-full">
        <iframe
          ref={iframeRef}
          src="/warm-outreach/lead-dashboard-v2.html"
          className="w-full h-full border-0"
          title="Warm Outreach Dashboard"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </PasswordGate>
  );
}
