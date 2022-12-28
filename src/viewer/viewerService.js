export function createLogService(restApiLogClient) {

  return {getMatchLog, getMatchValidationLog, getMergeLog, getLogsList};

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

  async function getLogsList(params) {
    const result = await restApiLogClient.getLogs(params);
    return result;
  }

}
