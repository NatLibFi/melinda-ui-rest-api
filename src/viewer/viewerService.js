export function createLogService(restApiLogClient) {

  return {getMatchLog, getMatchValidationLog, getMergeLog, getCorrelationIdList, protectLog, removeLog};

  async function getMatchLog(params) {
    const result = await restApiLogClient.getLog({logItemType: 'MATCH_LOG', ...params});
    const matchLogs = result.filter(log => log.logItemType === 'MATCH_LOG');
    return {...matchLogs};
  }

  async function getMatchValidationLog(params) {
    const result = await restApiLogClient.getLog({logItemType: 'MATCH_VALIDATION_LOG', ...params});
    const matchValidationLogs = result.filter(log => log.logItemType === 'MATCH_VALIDATION_LOG');
    return {...matchValidationLogs};
  }

  async function getMergeLog(params) {
    const result = await restApiLogClient.getLog({logItemType: 'MERGE_LOG', ...params});
    const mergeLogs = result.filter(log => log.logItemType === 'MERGE_LOG');
    return {...mergeLogs};
  }

  async function getCorrelationIdList(params) {
    const result = await restApiLogClient.getLogsList(params);
    return result;
  }

  async function protectLog(correlationId, params) {
    const result = await restApiLogClient.protectLog(correlationId, params);
    return result;
  }

  async function removeLog(correlationId, params) {
    const result = await restApiLogClient.removeLog(correlationId, params);
    return result;
  }

}
