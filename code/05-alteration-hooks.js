/*
 * ALTERATION HOOKS
 */

/**
 * Validates the alteration package request data.
 * @param {object} context The context object containing alteration hook key and policy.
 * @param {string} context.alteration_hook_key The alteration hook identifier.
 * @param {PlatformPolicy} context.policy The policy to which the alteration package will be applied.
 * @param {Record<string, any>} params The data received in the body of the alteration request.
 * @return {{error: any; value: any}} The validation result.
 */
const validateAlterationPackageRequest = ({ alteration_hook_key, policy }, params) => {
  if (alteration_hook_key === 'update_cover') {
    const result = Joi.validate(
      params,
      Joi.object()
        .keys({
          cover_amount: Joi.number()
            .integer()
            .min(10000 * 100) // R10k in cents
            .max(100000 * 100) // R100k in cents
            .required(),
        })
        .required(),
      { abortEarly: false },
    );
    return result;
  }

  throw new Error(`Invalid alteration hook key "${alteration_hook_key}"`);
};

/**
 * Generates an alteration package from the alteration request data.
 * @param {object} context The context object containing alteration hook key, policy and policyholder.
 * @param {string} context.alteration_hook_key The alteration hook identifier.
 * @param {PlatformPolicy} context.policy The policy to which the alteration package will be applied.
 * @param {PlatformPolicyholder} context.policyholder The policyholder linked to the policy.
 * @param {Record<string, any>} params The validated data returned by validateAlterationPackageRequest.
 * @return {AlterationPackage} The alteration package.
 */
const getAlteration = ({ alteration_hook_key, policy, policyholder }, params) => {
  if (alteration_hook_key === 'update_cover') {
    const newCoverAmount = params.cover_amount;
    const age = policy.module.age;

    // Recalculate premium using the same formula as quote
    const corePremium = (newCoverAmount / 10000) * age;
    const speciesMultipliers = {
      'Tyrannosaurus Rex': 0.81,
      'Stegosaurus': 1.19,
      'Velociraptor': 0.76,
      'Brachiosaurus': 1.32,
      'Iguanodon': 1.07
    };

    let adjustedPremium = corePremium * speciesMultipliers[policy.module.species];

    // Health checks adjustment
    if (!policy.module.health_checks_updated) {
      adjustedPremium += 25000; // R250 in cents
    }

    const newPremium = Math.round(adjustedPremium);

    const alterationPackage = new AlterationPackage({
      sum_assured: newCoverAmount,
      monthly_premium: newPremium,
      change_description: `Cover amount updated from R${policy.sum_assured / 100} to R${newCoverAmount / 100}`,
      billing_frequency: 'monthly',
      module: {
        ...policy.module,
        cover_amount: newCoverAmount,
        old_cover_amount: policy.sum_assured,
        old_premium: policy.monthly_premium,
      },
      input_data: { ...params },
    });

    return alterationPackage;
  }

  throw new Error(`Invalid alteration hook key "${alteration_hook_key}"`);
};

/**
 * Applies the alteration package to the policy.
 * @param {object} context The context object containing alteration hook key, policy, policyholder and alteration package.
 * @param {string} context.alteration_hook_key The alteration hook identifier.
 * @param {PlatformPolicy} context.policy The policy to which the alteration package will be applied.
 * @param {PlatformPolicyholder} context.policyholder The policyholder linked to the policy.
 * @param {PlatformAlterationPackage} context.alteration_package The alteration package to be applied.
 * @return {AlteredPolicy} The altered policy.
 */
const applyAlteration = ({ alteration_hook_key, policy, policyholder, alteration_package }) => {
  if (alteration_hook_key === 'update_cover') {
    const alteredPolicy = new AlteredPolicy({
      package_name: policy.package_name,
      sum_assured: alteration_package.sum_assured,
      base_premium: alteration_package.monthly_premium,
      monthly_premium: alteration_package.monthly_premium,
      end_date: moment(policy.end_date),
      start_date: moment(policy.start_date),
      charges: policy.charges,
      module: {
        ...alteration_package.module,
      },
    });

    return alteredPolicy;
  }

  throw new Error(`Invalid alteration hook key "${alteration_hook_key}"`);
};
