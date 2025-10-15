/*
 * RATINGS
 */

/**
 * Calculates the risk premium based on the rating factors
 * @param {Record<string, any>} data The input data required to calculate the risk premium
 * @return The risk premium
 */
const calculateRiskPremium = (data) => {
  const { cover_amount, age, cardio_fitness_level, smoker } = data;

  const cardioFitnessLevelMultiplier = cardio_fitness_level === 'couch potato' ? 0.5 : 0.1;
  const smokerMultiplier = smoker ? 1 : 0;

  const totalRiskPremium = (cover_amount / 10000) * (age / 10 + smokerMultiplier + cardioFitnessLevelMultiplier);

  return totalRiskPremium;
};

/**
 * Calculates the early warning network benefit premium based on the rating factors
 * @param {Record<string, any>} data The input data required to calculate the early warning network benefit premium
 * @return The early warning network benefit premium
 */
const calculateEarlyWarningNetworkBenefitPremium = (data) => {
  const earlyWarningNetworkBenefitPremium = data.early_warning_network_benefit ? 3 * 100 : 0;

  return earlyWarningNetworkBenefitPremium;
};

/**
 * Calculates the extraction benefit premium based on the rating factors
 * @param {Record<string, any>} data The input data required to calculate the extraction benefit premium
 * @return The extraction benefit premium
 */
const calculateExtractionBenefitPremium = (data) => {
  const extractionBenefitPremium = data.extraction_benefit ? 5 * 100 : 0;

  return extractionBenefitPremium;
};
