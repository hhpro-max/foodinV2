const BaseRepository = require('./base.repository');
const { Profile, NaturalPerson, LegalPerson } = require('../models');

class ProfileRepository extends BaseRepository {
  constructor(sequelize, naturalPersonRepo, legalPersonRepo) {
    super(sequelize, Profile);
    this.naturalPersonRepo = naturalPersonRepo;
    this.legalPersonRepo = legalPersonRepo;
  }

  async findByUserId(userId) {
    return await this.findOne({ userId }, {
      include: [
        { model: NaturalPerson, as: 'naturalPerson' },
        { model: LegalPerson, as: 'legalPerson' },
      ],
    });
  }

  async findByCustomerCode(customerCode) {
    return await this.findOne({ customerCode });
  }

  async updateWithPersonData(profileId, profileData, personData, personType) {
    const transaction = await this.sequelize.transaction();

    try {
      // Update profile
      if (Object.keys(profileData).length > 0) {
        await this.update(profileId, profileData, { transaction });
      }

      // Update person data
      if (personType === 'natural' && Object.keys(personData).length > 0) {
        await this.naturalPersonRepo.updateByProfileId(profileId, personData, { transaction });
      } else if (personType === 'legal' && Object.keys(personData).length > 0) {
        await this.legalPersonRepo.updateByProfileId(profileId, personData, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = ProfileRepository;