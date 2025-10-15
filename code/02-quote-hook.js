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
  const result = Joi.validate(
    data,
    Joi.object()
      .keys({
        cover_amount: Joi.number()
          .integer()
          .min(100000 * 100)
          .max(5000000 * 100)
          .required(),
        age: Joi.number().integer().min(18).max(63).required(),
        cardio_fitness_level: Joi.valid(['couch potato', 'marathon runner']).required(),
        smoker: Joi.boolean().optional(),
        early_warning_network_benefit: Joi.boolean().required(),
        extraction_benefit: Joi.boolean().required(),
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
  // Do the math and logic to calculate the premium, benefits, etc.
  // using `data`, hardcoded rating tables, data stores, or external services/APIs

  const riskPremium = Math.round(calculateRiskPremium(data));
  const earlyWarningNetworkBenefitPremium = Math.round(calculateEarlyWarningNetworkBenefitPremium(data));
  const extractionBenefitPremium = Math.round(calculateExtractionBenefitPremium(data));

  const totalPremium = riskPremium + earlyWarningNetworkBenefitPremium + extractionBenefitPremium;

  const quotePackage = new QuotePackage({
    // Below are standard fields for all products
    package_name: 'Dino protection', // The name of the "package" of cover
    sum_assured: data.cover_amount, // Set the total, aggregated cover amount
    base_premium: totalPremium, // Should be an integer, pence
    suggested_premium: totalPremium, // Should be an integer, pence
    billing_frequency: 'monthly', // Can be monthly or yearly
    module: {
      // Save any data, calculations, or results here for future re-use.
      cover_amount: data.cover_amount,
      age: data.age,
      cardio_fitness_level: data.cardio_fitness_level,
      smoker: data.smoker,
      early_warning_network_benefit: data.early_warning_network_benefit,
      extraction_benefit: data.extraction_benefit,
      premium_breakdown: {
        risk_premium: riskPremium,
        early_warning_network_benefit_premium: earlyWarningNetworkBenefitPremium,
        extraction_benefit_premium: extractionBenefitPremium,
      },
    },
    input_data: { ...data },
  });

  return [quotePackage];
};
