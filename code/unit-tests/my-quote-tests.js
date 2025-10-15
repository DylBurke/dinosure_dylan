/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('Dinosure Quote Validation and Pricing', function () {
  
  describe('validateQuoteRequest', function () {
    const validQuoteData = {
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cover_amount: 50000 * 100, // R50,000 in cents
      birth_date: new Date(new Date().getFullYear() - 20, 0, 1), // 20 years old
      species: 'Tyrannosaurus Rex',
      health_checks_updated: true,
    };

    it('should pass quote data validation for correct data', function () {
      const validation = validateQuoteRequest(validQuoteData);
      expect(validation.error).to.equal(null);
    });

    it('should fail validation for invalid data', function () {
      const invalidQuoteData = {
        start_date: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000), // 70 days from now (too far)
        cover_amount: 5000 * 100, // R5,000 (too low)
        birth_date: new Date(new Date().getFullYear() - 60, 0, 1), // 60 years old (too old)
        species: 'Brontosaurus', // Invalid species
        health_checks_updated: 'yes', // Should be boolean
      };
      
      const validation = validateQuoteRequest(invalidQuoteData);
      expect(validation.error).to.not.equal(null);
      expect(validation.error.details.length).to.be.greaterThan(0);
    });
  });

  describe('getQuote pricing scenarios', function () {
    
    it('should calculate correct premium for 20-year-old Tyrannosaurus Rex with R90,000.00 coverage', function () {
      const quoteData = {
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cover_amount: 90000 * 100, // R90,000 in cents
        birth_date: new Date(new Date().getFullYear() - 20, 0, 1), // 20 years old
        species: 'Tyrannosaurus Rex',
        health_checks_updated: true,
      };

      const quotePackage = getQuote(quoteData)[0];
      expect(quotePackage.suggested_premium).to.equal(14580); // R145.80 in cents
    });

    it('should calculate correct premium for 36-year-old Velociraptor with R50,000.00 coverage', function () {
      const quoteData = {
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cover_amount: 50000 * 100, // R50,000 in cents
        birth_date: new Date(new Date().getFullYear() - 36, 0, 1), // 36 years old
        species: 'Velociraptor',
        health_checks_updated: true,
      };

      const quotePackage = getQuote(quoteData)[0];
      expect(quotePackage.suggested_premium).to.equal(13680); // R136.80 in cents
    });

    it('should calculate correct premium for 16-year-old Brachiosaurus with R65,000.00 coverage', function () {
      const quoteData = {
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cover_amount: 65000 * 100, // R65,000 in cents
        birth_date: new Date(new Date().getFullYear() - 16, 0, 1), // 16 years old
        species: 'Brachiosaurus',
        health_checks_updated: true,
      };

      const quotePackage = getQuote(quoteData)[0];
      expect(quotePackage.suggested_premium).to.equal(13728); // R137.28 in cents
    });

    it('should add R250 premium when health checks are not updated', function () {
      const quoteDataWithHealthChecks = {
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cover_amount: 50000 * 100,
        birth_date: new Date(new Date().getFullYear() - 25, 0, 1),
        species: 'Iguanodon',
        health_checks_updated: true,
      };

      const quoteDataWithoutHealthChecks = {
        ...quoteDataWithHealthChecks,
        health_checks_updated: false,
      };

      const quoteWithHealthChecks = getQuote(quoteDataWithHealthChecks)[0];
      const quoteWithoutHealthChecks = getQuote(quoteDataWithoutHealthChecks)[0];

      const difference = quoteWithoutHealthChecks.suggested_premium - quoteWithHealthChecks.suggested_premium;
      expect(difference).to.equal(25000); // R250 in cents
    });

    it('should store all input data in module', function () {
      const quoteData = {
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cover_amount: 50000 * 100,
        birth_date: new Date(new Date().getFullYear() - 25, 0, 1),
        species: 'Stegosaurus',
        health_checks_updated: true,
      };

      const quotePackage = getQuote(quoteData)[0];
      
      expect(quotePackage.module.start_date).to.deep.equal(quoteData.start_date);
      expect(quotePackage.module.cover_amount).to.equal(quoteData.cover_amount);
      expect(quotePackage.module.birth_date).to.deep.equal(quoteData.birth_date);
      expect(quotePackage.module.species).to.equal(quoteData.species);
      expect(quotePackage.module.health_checks_updated).to.equal(quoteData.health_checks_updated);
      expect(quotePackage.module.age).to.equal(25);
    });
  });
});
