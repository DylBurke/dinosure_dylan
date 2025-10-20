/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('Dinosure Alteration Hooks', function () {

  describe('validateAlterationPackageRequest', function () {

    it('should pass validation for valid data', function () {
      const params = {
        alteration_hook_key: 'update_cover',
        policy: {
          sum_assured: 5000000,
          monthly_premium: 13375,
        },
      };

      const alterationData = {
        cover_amount: 7500000, // R75,000 in cents
      };

      const validation = validateAlterationPackageRequest(params, alterationData);
      expect(validation.error).to.equal(null);
    });

    it('should fail validation for invalid data', function () {
      const params = {
        alteration_hook_key: 'update_cover',
        policy: {
          sum_assured: 5000000,
          monthly_premium: 13375,
        },
      };

      const alterationData = {
        cover_amount: 5000 * 100, // R5,000 - too low
      };

      const validation = validateAlterationPackageRequest(params, alterationData);
      expect(validation.error).to.not.equal(null);
      expect(validation.error.details.length).to.be.greaterThan(0);
    });
  });

  describe('getAlteration', function () {

    it('should calculate correct premium for 20-year-old Tyrannosaurus Rex changing from R90,000 to R75,000', function () {
      const params = {
        alteration_hook_key: 'update_cover',
        policy: {
          package_name: 'DinoSure',
          sum_assured: 9000000, // R90,000 in cents
          monthly_premium: 14580,
          module: {
            age: 20,
            species: 'Tyrannosaurus Rex',
            health_checks_updated: true,
          },
        },
        policyholder: {},
      };

      const alterationData = {
        cover_amount: 7500000, // R75,000 in cents
      };

      const alterationPackage = getAlteration(params, alterationData);

      // Expected: 7,500,000 × 20 × 0.0001 × 0.81 = 15,000 × 0.81 = 12,150 cents = R121.50
      expect(alterationPackage.sum_assured).to.equal(7500000);
      expect(alterationPackage.monthly_premium).to.equal(12150);
    });

    it('should calculate correct premium for 36-year-old Velociraptor changing from R50,000 to R75,000', function () {
      const params = {
        alteration_hook_key: 'update_cover',
        policy: {
          package_name: 'DinoSure',
          sum_assured: 5000000, // R50,000 in cents
          monthly_premium: 13680,
          module: {
            age: 36,
            species: 'Velociraptor',
            health_checks_updated: true,
          },
        },
        policyholder: {},
      };

      const alterationData = {
        cover_amount: 7500000, // R75,000 in cents
      };

      const alterationPackage = getAlteration(params, alterationData);

      // Expected: 7,500,000 × 36 × 0.0001 × 0.76 = 27,000 × 0.76 = 20,520 cents = R205.20
      expect(alterationPackage.sum_assured).to.equal(7500000);
      expect(alterationPackage.monthly_premium).to.equal(20520);
    });
  });

  describe('applyAlteration', function () {

    it('should apply alteration and update policy with new cover and premium', function () {
      const params = {
        alteration_hook_key: 'update_cover',
        policy: {
          package_name: 'DinoSure',
          sum_assured: 5000000,
          monthly_premium: 13375,
          base_premium: 13375,
          start_date: new Date('2025-01-01'),
          end_date: null,
          module: {
            age: 25,
            species: 'Stegosaurus',
            health_checks_updated: true,
            cover_amount: 5000000,
          },
        },
        policyholder: {},
        alteration_package: {
          sum_assured: 7500000,
          monthly_premium: 22312,
          change_description: 'Cover amount updated',
          billing_frequency: 'monthly',
          module: {
            age: 25,
            species: 'Stegosaurus',
            health_checks_updated: true,
            cover_amount: 7500000,
            old_cover_amount: 5000000,
            old_premium: 13375,
          },
          input_data: { cover_amount: 7500000 },
        },
      };

      const alteredPolicy = applyAlteration(params);

      expect(alteredPolicy.package_name).to.equal('DinoSure');
      expect(alteredPolicy.sum_assured).to.equal(7500000);
      expect(alteredPolicy.monthly_premium).to.equal(22312);
      expect(alteredPolicy.module.cover_amount).to.equal(7500000);
      expect(alteredPolicy.module.old_cover_amount).to.equal(5000000);
      expect(alteredPolicy.module.old_premium).to.equal(13375);
    });
  });
});
