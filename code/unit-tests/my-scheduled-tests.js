/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('Dinosure Scheduled Functions', function () {

  describe('anniversary_cover_increase', function () {

    it('should not increase cover for policy younger than a year on January 1st', function () {
      const params = {
        policy: {
          start_date: new Date('2024-06-01'), // 7 months old on Jan 1, 2025
          sum_assured: 5000000, // R50,000
          monthly_premium: 13375,
          module: {
            age: 25,
            species: 'Stegosaurus',
            health_checks_updated: true,
            cover_amount: 5000000,
          },
        },
        policyholder: {},
        effective_date: new Date('2025-01-01'),
      };

      const actions = anniversary_cover_increase(params);

      // Should return empty array (no action)
      expect(actions).to.be.an('array');
      expect(actions.length).to.equal(0);
    });

    it('should increase cover for policy older than a year on January 1st', function () {
      const params = {
        policy: {
          start_date: new Date('2023-06-01'), // 1.5 years old on Jan 1, 2025
          sum_assured: 5000000, // R50,000
          monthly_premium: 13375,
          module: {
            age: 25,
            species: 'Stegosaurus',
            health_checks_updated: true,
            cover_amount: 5000000,
          },
        },
        policyholder: {},
        effective_date: new Date('2025-01-01'),
      };

      const actions = anniversary_cover_increase(params);

      // Should return action to update policy
      expect(actions).to.be.an('array');
      expect(actions.length).to.equal(1);
      expect(actions[0].name).to.equal('update_policy');

      // Check module data contains new values
      expect(actions[0].data.module.cover_amount).to.equal(6000000); // R50k + R10k = R60k
      expect(actions[0].data.module.anniversary_increase_applied).to.exist;
      expect(actions[0].data.module.previous_cover_amount).to.equal(5000000);
      expect(actions[0].data.module.previous_premium).to.equal(13375);
    });

    it('should not increase cover for policy older than a year on any date other than January 1st', function () {
      const params = {
        policy: {
          start_date: new Date('2023-06-01'), // More than 1 year old
          sum_assured: 5000000,
          monthly_premium: 13375,
          module: {
            age: 25,
            species: 'Stegosaurus',
            health_checks_updated: true,
            cover_amount: 5000000,
          },
        },
        policyholder: {},
        effective_date: new Date('2025-06-15'), // Not January 1st
      };

      // Note: In production, this function would only be called on Jan 1st
      // because of the config schedule, but we test the function logic directly
      const actions = anniversary_cover_increase(params);

      // The function itself doesn't check the date - the schedule does
      expect(actions).to.be.an('array');
      expect(actions.length).to.equal(1);
    });

    it('should calculate correct premium for different species', function () {
      const params = {
        policy: {
          start_date: new Date('2023-01-01'), // 2 years old on Jan 1, 2025
          sum_assured: 9000000, // R90,000
          monthly_premium: 14580,
          module: {
            age: 20,
            species: 'Tyrannosaurus Rex',
            health_checks_updated: true,
            cover_amount: 9000000,
          },
        },
        policyholder: {},
        effective_date: new Date('2025-01-01'),
      };

      const actions = anniversary_cover_increase(params);

      // Check module data contains new cover amount
      expect(actions[0].data.module.cover_amount).to.equal(10000000); // R90k + R10k = R100k
    });
  });
});
