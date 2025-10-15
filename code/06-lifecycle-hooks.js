/*
 * LIFECYCLE HOOKS
 */

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
