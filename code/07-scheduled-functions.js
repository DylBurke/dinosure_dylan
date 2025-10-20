/*
 * SCHEDULED FUNCTIONS
 */

/**
 * Anniversary cover increase - runs on January 1st each year for active policies.
 * Increases cover by R10k for policies older than one year and recalculates premium.
 * @param {object} params
 * @param {PlatformPolicy} params.policy The policy to potentially update.
 * @param {PlatformPolicyholder} params.policyholder The policyholder linked to the policy.
 * @param {Date} params.effective_date The date on which the scheduled function is running.
 * @return {ProductModuleAction[]} An array of actions to be queued by the platform.
 */
const anniversary_cover_increase = ({ policy, policyholder, effective_date }) => {
  const policyStartDate = moment(policy.start_date);
  const effectiveDate = moment(effective_date);

  // Check if policy is older than one year
  const yearsSinceStart = effectiveDate.diff(policyStartDate, 'years', true);

  if (yearsSinceStart >= 1) {
    // Increase cover by R10 000 (1,000,000 cents)
    const newCoverAmount = policy.sum_assured + 1000000;

    // Return action to update the policy
    return [
      {
        name: 'update_policy',
        data: {
          module: {
            ...policy.module,
            cover_amount: newCoverAmount,
            anniversary_increase_applied: effectiveDate.toISOString(),
            previous_cover_amount: policy.sum_assured,
            previous_premium: policy.monthly_premium,
          },
        },
      },
    ];
  }

  // Policy is less than one year old, no action needed
  return [];
};
