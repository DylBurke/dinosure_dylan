/**
 * @file This file is used by the 'rp test' command and allows you to write and run unit tests locally.
 * When running unit tests, the unit test code files are appended to the product module code files, and executed using mocha.
 * The unit test files are automatically commented out when the product module definition is pushed to Root,
 * ensuring that the unit tests are not executed in production.
 */

describe('Dinosure Lifecycle Hooks', function () {

  describe('beforePolicyReactivated', function () {

    it('should allow reactivation for cancelled policy', function () {
      const params = {
        policy: {
          status: 'cancelled',
          module: {
            age: 25,
            species: 'Stegosaurus',
          },
        },
        policyholder: {},
      };

      const actions = beforePolicyReactivated(params);

      expect(actions).to.be.an('array');
      expect(actions.length).to.equal(1);
      expect(actions[0].name).to.equal('update_policy');
      expect(actions[0].data.module.reactivation_date).to.exist;
      expect(actions[0].data.module.age).to.equal(25);
      expect(actions[0].data.module.species).to.equal('Stegosaurus');
    });

    it('should allow reactivation for lapsed policy', function () {
      const params = {
        policy: {
          status: 'lapsed',
          module: {
            age: 30,
            species: 'Tyrannosaurus Rex',
          },
        },
        policyholder: {},
      };

      const actions = beforePolicyReactivated(params);

      expect(actions).to.be.an('array');
      expect(actions.length).to.equal(1);
      expect(actions[0].name).to.equal('update_policy');
      expect(actions[0].data.module.reactivation_date).to.exist;
      expect(actions[0].data.module.age).to.equal(30);
      expect(actions[0].data.module.species).to.equal('Tyrannosaurus Rex');
    });

    it('should prevent reactivation for expired policy', function () {
      const params = {
        policy: {
          status: 'expired',
          module: {
            age: 25,
            species: 'Velociraptor',
          },
        },
        policyholder: {},
      };

      expect(() => beforePolicyReactivated(params)).to.throw(Error);
      expect(() => beforePolicyReactivated(params)).to.throw(/cannot be reactivated/);
    });

    it('should prevent reactivation for active policy', function () {
      const params = {
        policy: {
          status: 'active',
          module: {
            age: 25,
            species: 'Brachiosaurus',
          },
        },
        policyholder: {},
      };

      expect(() => beforePolicyReactivated(params)).to.throw(Error);
      expect(() => beforePolicyReactivated(params)).to.throw(/cannot be reactivated/);
    });
  });
});
