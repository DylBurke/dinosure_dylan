/**
 * QUOTE HOOK
 */

/**
 * Validates the quote request data.
 * @param {Record<string, any>} data The data received in the body of the
 *     [Create a quote](https://docs.rootplatform.com/reference/getting-a-quote-2) request
 *     (without the `type` property).
 * @return {{error: any; result: any}} The [validation result](https://joi.dev/api/?v=12.1.0#validatevalue-schema-options-callback).
 *    If there are no errors, the `value` property will contain the validated data, which is passed to `getQuote`.
 * @see {@link https://docs.rootplatform.com/docs/quote-hook Quote hook}
 */
const validateQuoteRequest = (data) => {
  // Custom validation can be specified in the function body
  const currentDate = new Date();
  const maxStartDate = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from right neow
  const minBirthYear = currentDate.getFullYear() - 50;
  
  const result = Joi.validate(
    data,
    Joi.object()
      .keys({
        start_date: Joi.date()
          .min(currentDate)
          .max(maxStartDate)
          .required(),
        cover_amount: Joi.number()
          .integer()
          .min(10000 * 100) // R10,000 in cents
          .max(100000 * 100) // R100,000 in cents
          .required(),
        birth_date: Joi.date()
          .min(new Date(minBirthYear, 0, 1))
          .max(currentDate)
          .required(),
        species: Joi.valid(['Tyrannosaurus Rex', 'Stegosaurus', 'Velociraptor', 'Brachiosaurus', 'Iguanodon'])
          .required(),
        health_checks_updated: Joi.boolean().required(),
      })
      .required(),
    { abortEarly: false },
  );
  return result;
};

/**
 * Generates an array of quote packages from the quote request data.
 * @param {Record<string, any>} data The validated data returned by `validateQuoteRequest` as `result.value`.
 * @return {QuotePackage[]} The quote package(s) that will be returned by the
 *     [Create a quote](https://docs.rootplatform.com/reference/getting-a-quote-2) endpoint.
 * @see {@link https://docs.rootplatform.com/docs/quote-hook Quote hook}
 */
const getQuote = (data) => {
  // Calculate age from birth_date
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(data.birth_date).getFullYear();
  const age = currentYear - birthYear;

  // Core premium calculation: (cover_amount / 10000) * age
  const corePremium = (data.cover_amount / 10000) * age;

  // Species dependent adjustment
  const speciesMultipliers = {
    'Tyrannosaurus Rex': 0.81,
    'Stegosaurus': 1.19,
    'Velociraptor': 0.76,
    'Brachiosaurus': 1.32,
    'Iguanodon': 1.07
  };

  let adjustedPremium = corePremium * speciesMultipliers[data.species];

  // Health checks adjustment - add R250 p/m if not up to date
  if (!data.health_checks_updated) {
    adjustedPremium += 25000; // R250 in cents
  }

  const totalPremium = Math.round(adjustedPremium);

  const quotePackage = new QuotePackage({
    // Below are standard fields for all products
    package_name: 'Dinosure Protection', // The name of the "package" of cover
    sum_assured: data.cover_amount, // Set the total, aggregated cover amount
    base_premium: totalPremium, // Should be an integer, SA cents
    suggested_premium: totalPremium, // Should be an integer, SA cents
    billing_frequency: 'monthly', // Can be monthly or yearly
    module: {
      // Save any data, calculations, or results here for future re-use.
      start_date: data.start_date,
      cover_amount: data.cover_amount,
      birth_date: data.birth_date,
      species: data.species,
      health_checks_updated: data.health_checks_updated,
      age: age,
      premium_breakdown: {
        core_premium: Math.round(corePremium),
        species_adjustment: Math.round(corePremium * speciesMultipliers[data.species]) - Math.round(corePremium),
        total_premium: totalPremium,
      },
    },
    input_data: { ...data },
  });

  return [quotePackage];
};
