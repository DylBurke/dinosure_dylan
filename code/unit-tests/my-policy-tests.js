/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('Dinosure Policy Issue', function () {

  describe('getPolicy', function () {

    it('should create policy with all quote and application data', function () {
      const mockApplication = {
        application_id: 'app_123',
        policyholder_id: 'policyholder_123',
        quote_package_id: 'quote_pkg_123',
        product_module_definition_id: 'product_123',
        package_name: 'Dinosure Protection',
        sum_assured: 5000000,
        base_premium: 13375,
        monthly_premium: 13375,
        created_at: new Date().toISOString(),
        created_by: {
          type: 'user',
          id: 'string'
        },
        currency: 'ZAR',
        billing_frequency: 'monthly',
        status: 'pending',
        application_status: 'open',
        module: {
          start_date: new Date('2025-02-01'),
          cover_amount: 5000000,
          birth_date: new Date('2000-01-01'),
          species: 'Stegosaurus',
          health_checks_updated: true,
          age: 25,
          dinosaur_name: 'Rexy',
          dinosaur_colour: 'Sea green',
          ndrn: 555555,
        },
      };

      const mockPolicyholder = {
        id: 'policyholder_123',
      };

      const billing_day = 1;

      const policy = getPolicy(mockApplication, mockPolicyholder, billing_day);

      // Check policy fields
      expect(policy.package_name).to.equal('DinoSure');
      expect(policy.sum_assured).to.equal(mockApplication.sum_assured);
      expect(policy.base_premium).to.equal(mockApplication.base_premium);
      expect(policy.monthly_premium).to.equal(mockApplication.monthly_premium);
      expect(policy.start_date).to.deep.equal(mockApplication.module.start_date);
      expect(policy.end_date).to.equal(null);

      // Check that module contains all data from quote and application
      expect(policy.module.start_date).to.deep.equal(mockApplication.module.start_date);
      expect(policy.module.cover_amount).to.equal(mockApplication.module.cover_amount);
      expect(policy.module.species).to.equal(mockApplication.module.species);
      expect(policy.module.dinosaur_name).to.equal(mockApplication.module.dinosaur_name);
      expect(policy.module.dinosaur_colour).to.equal(mockApplication.module.dinosaur_colour);
      expect(policy.module.ndrn).to.equal(mockApplication.module.ndrn);
    });
  });
});
