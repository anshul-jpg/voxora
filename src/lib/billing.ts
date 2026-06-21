export function getOverageRate(tier?: string): number {
  return tier === "professional" ? 0.35 : 0.45;
}

export function getBaseMinutesForTier(tier?: string): number {
  if (tier === "professional") return 500;
  if (tier === "starter") return 250;
  return 0; // free/default
}

export function calculateCallBilling({
  durationSeconds,
  baseMinutesAllocated,
  baseMinutesUsed,
  walletBalanceUSD,
  subscriptionTier,
}: {
  durationSeconds: number;
  baseMinutesAllocated: number;
  baseMinutesUsed: number;
  walletBalanceUSD: number;
  subscriptionTier?: string;
}) {
  // Call duration is rounded up to the nearest minute
  const durationMinutes = Math.ceil(durationSeconds / 60);

  // Available base minutes remaining
  const baseRemaining = Math.max(0, baseMinutesAllocated - baseMinutesUsed);

  // Consume base minutes first
  const baseMinutesToUse = Math.min(durationMinutes, baseRemaining);
  const walletMinutesToBill = durationMinutes - baseMinutesToUse;

  // Wallet deduction rate based on tier
  const overageRate = getOverageRate(subscriptionTier);
  const walletCost = walletMinutesToBill * overageRate;

  return {
    durationMinutes,
    baseMinutesToUse,
    walletMinutesToBill,
    walletCost,
    newBaseMinutesUsed: baseMinutesUsed + baseMinutesToUse,
    newWalletBalanceUSD: walletBalanceUSD - walletCost,
  };
}

export function calculateMaxDurationSeconds({
  baseMinutesAllocated,
  baseMinutesUsed,
  walletBalanceUSD,
  pendingReservedUSD = 0,
  subscriptionTier,
}: {
  baseMinutesAllocated: number;
  baseMinutesUsed: number;
  walletBalanceUSD: number;
  pendingReservedUSD?: number;
  subscriptionTier?: string;
}) {
  const overageRate = getOverageRate(subscriptionTier);

  // Minutes remaining on the base plan
  const baseMinutesRemaining = Math.max(0, baseMinutesAllocated - baseMinutesUsed);

  // Effective wallet balance accounting for pending reservations of active concurrent calls
  const effectiveWalletBalanceUSD = walletBalanceUSD - pendingReservedUSD;

  // Allowed cash buffer (down to -$15.00 overdraft)
  const bufferRemainingUSD = Math.max(0, effectiveWalletBalanceUSD - -15.0);
  const walletMinutesRemaining = bufferRemainingUSD / overageRate;

  const totalAllowedMinutes = baseMinutesRemaining + walletMinutesRemaining;

  if (totalAllowedMinutes <= 0) {
    return 0;
  }

  // Enforce a hard cap of 1800 seconds (30 minutes)
  return Math.min(1800, Math.floor(totalAllowedMinutes * 60));
}

export function getBillingRiskStatus(sub: {
  baseMinutesUsed: number;
  baseMinutesAllocated: number;
  subscriptionStatus: string;
  walletBalanceUSD: number;
}) {
  const usedRatio = sub.baseMinutesAllocated > 0 ? sub.baseMinutesUsed / sub.baseMinutesAllocated : 0;

  if (sub.subscriptionStatus === "canceled") return "Canceled";
  if (sub.subscriptionStatus === "past_due") return "Payment Failed";
  if (sub.walletBalanceUSD <= -15.0) return "Voicemail Fallback";
  if (sub.walletBalanceUSD < 0) return "Overdraft";
  if (usedRatio >= 0.9) return "90% Minutes Used";

  return "Healthy";
}
