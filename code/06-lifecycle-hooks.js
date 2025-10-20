/*
 * LIFECYCLE HOOKS
 */

/**
 * Executed before a policy is reactivated.
 * @param {object} params
 * @param {PlatformPolicy} params.policy The policy being reactivated.
 * @param {PlatformPolicyholder} params.policyholder The policyholder linked to the policy.
 * @return {ProductModuleAction[]} An array of actions to be queued by the platform.
 */
const beforePolicyReactivated = ({ policy, policyholder }) => {
  // Only allow reactivation if policy is cancelled or lapsed
  if (policy.status === 'cancelled' || policy.status === 'lapsed') {
    // Add reactivation date to module data
    return [
      {
        name: 'update_policy',
        data: {
          module: {
            ...policy.module,
            reactivation_date: new Date().toISOString(),
          },
        },
      },
    ];
  }

  // Prevent reactivation for expired or other statuses
  throw new Error(`Policy with status "${policy.status}" cannot be reactivated. Only cancelled or lapsed policies can be reactivated.`);
};

/**
 * Executed after any claims block is updated.
 * @param {object} params
 * @param {PlatformClaim} params.claim The claim object, including the updated claims blocks.
 * @param {PlatformPolicy} params.policy The policy against which the claim was opened.
 * @param {PlatformPolicyholder} params.policyholder The policyholder linked to the claim.
 * @return {ProductModuleAction[]} An array of actions to be queued by the platform.
 */
const afterClaimBlockUpdated = ({ claim, policy, policyholder }) => {
  if (
    claim.block_states.extraction_fulfillment_request.fulfillment_request_id &&
    !policy.module.extraction_has_been_claimed
  ) {
    return [
      {
        name: 'update_policy',
        data: {
          module: {
            ...policy.module,
            extraction_has_been_claimed: true,
          },
        },
      },
    ];
  } else if (
    claim.block_states.fence_repair_fulfillment_request.fulfillment_request_id &&
    !policy.module.fence_repair_has_been_claimed
  ) {
    return [
      {
        name: 'update_policy',
        data: {
          module: {
            ...policy.module,
            fence_repair_has_been_claimed: true,
          },
        },
      },
    ];
  }
};
