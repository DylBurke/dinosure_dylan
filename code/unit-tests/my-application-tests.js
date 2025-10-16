/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('Dinosure Application', function () {

  describe('validateApplicationRequest', function () {

    it('should pass validation for valid data', function () {
      const validApplicationData = {
        dinosaur_name: 'Rex',
        dinosaur_colour: 'Lilac',
        ndrn: 123456,
      };

      const mockPolicyholder = {};
      const mockQuotePackage = {};

      const validation = validateApplicationRequest(validApplicationData, mockPolicyholder, mockQuotePackage);
      expect(validation.error).to.equal(null);
    });

    it('should fail validation for invalid data', function () {
      const invalidApplicationData = {
        dinosaur_name: 'a'.repeat(101), // Too long (>100 chars)
        dinosaur_colour: 'Red', // Invalid colour
        ndrn: 50000, // Too low (<100000)
      };

      const mockPolicyholder = {};
      const mockQuotePackage = {};

      const validation = validateApplicationRequest(invalidApplicationData, mockPolicyholder, mockQuotePackage);
      expect(validation.error).to.not.equal(null);
      expect(validation.error.details.length).to.be.greaterThan(0);
    });
  });

  describe('getApplication', function () {

    it('should create application with all quote and application data', function () {
      const applicationData = {
        dinosaur_name: 'Rexy',
        dinosaur_colour: 'Sea green',
        ndrn: 555555,
      };

      const mockPolicyholder = {
        id: 'policyholder_123',
      };

      const mockQuotePackage = {
        package_name: 'Dinosure Protection',
        sum_assured: 5000000, // R50,000 in cents
        base_premium: 13375,
        suggested_premium: 13375,
        module: {
          start_date: new Date('2025-01-01'),
          cover_amount: 5000000,
          birth_date: new Date('2000-01-01'),
          species: 'Stegosaurus',
          health_checks_updated: true,
          age: 25,
        },
      };

      const application = getApplication(applicationData, mockPolicyholder, mockQuotePackage);

      // Check that pricing comes from quote
      expect(application.package_name).to.equal(mockQuotePackage.package_name);
      expect(application.sum_assured).to.equal(mockQuotePackage.sum_assured);
      expect(application.base_premium).to.equal(mockQuotePackage.base_premium);
      expect(application.monthly_premium).to.equal(mockQuotePackage.suggested_premium);

      // Check that module contains both quote and application data
      expect(application.module.start_date).to.deep.equal(mockQuotePackage.module.start_date);
      expect(application.module.cover_amount).to.equal(mockQuotePackage.module.cover_amount);
      expect(application.module.species).to.equal(mockQuotePackage.module.species);
      expect(application.module.dinosaur_name).to.equal(applicationData.dinosaur_name);
      expect(application.module.dinosaur_colour).to.equal(applicationData.dinosaur_colour);
      expect(application.module.ndrn).to.equal(applicationData.ndrn);
    });
  });
});
