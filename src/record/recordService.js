import {createLogger} from '@natlibfi/melinda-backend-commons';
import {createMelindaApiRecordClient} from '@natlibfi/melinda-rest-api-client';

export default function (melindaApiOptions) {
  const logger = createLogger();
  const restApiRecordClient = createMelindaApiRecordClient(melindaApiOptions);

  return {addRecord, validateRecord};

  async function addRecord(record) {
    logger.info('RECORD SERVICE: addRecord');
    const result = await restApiRecordClient.create(record, {noop: 0});
    return result;
  }

  async function validateRecord(record) {
    logger.info('RECORD SERVICE: validateRecord');
    const result = await restApiRecordClient.create(record, {noop: 1});
    return result;
  }

}
