import {parseBoolean} from '@natlibfi/melinda-commons';
import {readEnvironmentVariable} from '@natlibfi/melinda-backend-commons';

export const httpPort = readEnvironmentVariable('HTTP_PORT', {defaultValue: '8080'});
export const enableProxy = readEnvironmentVariable('ENABLE_PROXY', {defaultValue: false, format: v => parseBoolean(v)});

export const xServiceURL = readEnvironmentVariable('ALEPH_X_SVC_URL');
export const userLibrary = readEnvironmentVariable('ALEPH_USER_LIBRARY');

export const ownAuthzURL = readEnvironmentVariable('OWN_AUTHZ_URL');
export const ownAuthzApiKey = readEnvironmentVariable('OWN_AUTHZ_API_KEY');
//export const ownAuthzApiKey = 'xxx';

export const sruUrl = readEnvironmentVariable('SRU_URL');
export const fintoUrl = readEnvironmentVariable('FINTO_URL');

export const notificationMongoUri = readEnvironmentVariable('NOTE_MONGO_URI');

export const jwtOptions = {
  secretOrPrivateKey: readEnvironmentVariable('JWT_SECRET'),
  issuer: readEnvironmentVariable('JWT_ISSUER', {defaultValue: 'melinda-'}),
  audience: readEnvironmentVariable('JWT_AUDIENCE', {defaultValue: 'melinda-'}),
  algorithms: readEnvironmentVariable('JWT_ALGORITHMS', {defaultValue: ['HS512'], format: (v) => JSON.parse(v)})
};

export const melindaApiOptions = {
  melindaApiUrl: readEnvironmentVariable('MELINDA_API_URL', {defaultValue: false}),
  melindaApiUsername: readEnvironmentVariable('MELINDA_API_USERNAME', {defaultValue: ''}),
  melindaApiPassword: readEnvironmentVariable('MELINDA_API_PASSWORD', {defaultValue: ''})
};
