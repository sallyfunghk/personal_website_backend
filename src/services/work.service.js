const workRepo = require('../adapters/repositories/work.repository');

const { Err } = require('../utils/err');
const { CODE } = require('../utils/mapper');

module.exports = {
    getAllWorks: async () => {
        const works = await workRepo.getAll()
            .catch(err => {
                throw new Err('cannot get all works from database', CODE.DATABASE_ERROR);
            });

        return works;
    },
    getWorkById: async (workId) => {
        // Step 0: Data validation
        if (!workId) {
            throw new Err('workId is required', CODE.INVALID_PARAM);
        }

        const work = await workRepo.getById(workId)
            .catch(err => {
                logger.error(err.message);
                throw new Err('cannot get work by id from database', CODE.DATABASE_ERROR);
            });
        if (!work.id) {
            throw new Err('no work found', CODE.INVALID_PARAM);
        }

        return work;
    },
    createWork: async (work) => {
        // Step 0: Data validation
        const currentYear = new Date().getFullYear();

        if (!work.title || !work.company_name || !work.start_date_month || !work.start_date_year || !work.is_current === '') {
            throw new Err('title, company_name, start_date_month, start_date_year and is_current are required', CODE.INVALID_PARAM);
        }
        if (work.is_current !== 0 && work.is_current !== 1) {
            throw new Err('is_current must be 0 or 1', CODE.INVALID_PARAM);
        }
        if (!Number.isInteger(work.start_date_month) || work.start_date_month < 1 || work.start_date_month > 12) {
            throw new Err('start_date_month must between 1 - 12 (inclusive)', CODE.INVALID_PARAM);
        }
        if (!Number.isInteger(work.start_date_year) || work.start_date_year < 1900 || work.start_date_year > currentYear) {
            throw new Err(`start_date_year must between 1900 - ${currentYear} (inclusive)`, CODE.INVALID_PARAM);
        }
        if (work.is_current === 0) {
            if (!work.end_date_month || !work.end_date_year) {
                throw new Err('end_date_month and end_date_year are required if is_current is false', CODE.INVALID_PARAM);
            }
            if (!Number.isInteger(work.end_date_month) || work.end_date_month < 1 || work.end_date_month > 12) {
                throw new Err('end_date_month must between 1 - 12 (inclusive)', CODE.INVALID_PARAM);
            }
            if (!Number.isInteger(work.end_date_year) || work.end_date_year < 1900 || work.end_date_year > currentYear) {
                throw new Err(`end_date_year must between 1900 - ${currentYear} (inclusive)`, CODE.INVALID_PARAM);
            }
            const startDate = new Date(work.start_date_year, work.start_date_month - 1, 1);
            const endDate = new Date(work.end_date_year, work.end_date_month - 1, 1);
            if (startDate > endDate) {
                throw new Err('start_date must before end_date', CODE.INVALID_PARAM);
            }
        }

        // Step 1: Insert work into database
        const dbWorkId = await workRepo.create({
            title: work.title,
            companyName: work.company_name,
            description: work.description ?? '',
            startDateMonth: work.start_date_month,
            startDateYear: work.start_date_year,
            endDateMonth: work.is_current === 0 ? work.end_date_month : null,
            endDateYear: work.is_current === 0 ? work.end_date_year : null,
            isCurrent: work.is_current
        })
            .catch(err => {
                logger.error(err.message);
                throw new Err('cannot create work from database', CODE.DATABASE_ERROR);
            });

        return work;
    },
    updateWorkById: async (id, work) => {
        // Step 0: Data validation
        const currentYear = new Date().getFullYear();

        if (!id) {
            throw new Err('id is required', CODE.INVALID_PARAM);
        }
        if (!work.title || !work.company_name || !work.start_date_month || !work.start_date_year || !work.is_current === '') {
            throw new Err('title, company_name, start_date_month, start_date_year and is_current are required', CODE.INVALID_PARAM);
        }
        if (work.is_current !== 0 && work.is_current !== 1) {
            throw new Err('is_current must be 0 or 1', CODE.INVALID_PARAM);
        }
        if (!Number.isInteger(work.start_date_month) || work.start_date_month < 1 || work.start_date_month > 12) {
            throw new Err('start_date_month must between 1 - 12 (inclusive)', CODE.INVALID_PARAM);
        }
        if (!Number.isInteger(work.start_date_year) || work.start_date_year < 1900 || work.start_date_year > currentYear) {
            throw new Err(`start_date_year must between 1900 - ${currentYear} (inclusive)`, CODE.INVALID_PARAM);
        }
        if (work.is_current === 0) {
            if (!work.end_date_month || !work.end_date_year) {
                throw new Err('end_date_month and end_date_year are required if is_current is false', CODE.INVALID_PARAM);
            }
            if (!Number.isInteger(work.end_date_month) || work.end_date_month < 1 || work.end_date_month > 12) {
                throw new Err('end_date_month must between 1 - 12 (inclusive)', CODE.INVALID_PARAM);
            }
            if (!Number.isInteger(work.end_date_year) || work.end_date_year < 1900 || work.end_date_year > currentYear) {
                throw new Err(`end_date_year must between 1900 - ${currentYear} (inclusive)`, CODE.INVALID_PARAM);
            }
            const startDate = new Date(work.start_date_year, work.start_date_month - 1, 1);
            const endDate = new Date(work.end_date_year, work.end_date_month - 1, 1);
            if (startDate > endDate) {
                throw new Err('start_date must before end_date', CODE.INVALID_PARAM);
            }
        }

        // Step 1: Check work existed in database
        const dbWork = await workRepo.getById(id)
            .catch(err => {
                logger.error(err.message);
                throw new Err('cannot get work by id from database', CODE.DATABASE_ERROR);
            });
        if (!dbWork.id) {
            throw new Err('no work found', CODE.INVALID_PARAM);
        }

        // Step 2: Update work
        const changedRows = await workRepo.updateById({
            id: id,
            title: work.title,
            companyName: work.company_name,
            description: work.description ?? '',
            startDateMonth: work.start_date_month,
            startDateYear: work.start_date_year,
            endDateMonth: work.is_current === 0 ? work.end_date_month : null,
            endDateYear: work.is_current === 0 ? work.end_date_year : null,
            isCurrent: work.is_current
        })
            .catch(err => {
                logger.error(err.message);
                throw new Err('cannot update work from database', CODE.DATABASE_ERROR);
            });

        return changedRows;
    },
    deleteWorkById: async (id) => {
        // Step 0: Data validation
        if (!id) {
            throw new Err('id is required', CODE.INVALID_PARAM);
        }

        // Step 1: Check work existed in database
        const dbWork = await workRepo.getById(id)
            .catch(err => {
                logger.error(err.message);
                throw new Err('cannot get work by id from database', CODE.DATABASE_ERROR);
            });
        if (!dbWork.id) {
            throw new Err('no work found', CODE.INVALID_PARAM);
        }

        // Step 2: Delete work
        const changedRows = await workRepo.updateById({
            id: id,
            deleted: 1,
        })
            .catch(err => {
                logger.error(err.message);
                throw new Err('cannot update work from database', CODE.DATABASE_ERROR);
            });

        return changedRows;
    },

}