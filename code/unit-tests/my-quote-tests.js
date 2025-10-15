/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('getQuote', function () {
  const quoteData = {
    cover_amount: 200000 * 100,
    age: 30,
    cardio_fitness_level: 'couch potato',
    smoker: false,
    early_warning_network_benefit: true,
    extraction_benefit: false,
  };

  it('should pass quote data validation for correct data', function () {
    const validation = validateQuoteRequest(quoteData);
    expect(validation.error).to.equal(null);
  });

  it('should return a suggested premium of £73.00 (in pence)', function () {
    const quotePackage = getQuote(quoteData)[0];

    expect(quotePackage.suggested_premium).to.equal(7300); // pence
  });
});
