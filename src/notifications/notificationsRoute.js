import httpStatus from 'http-status';
import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

/**
 * @param {String} uri config uri see NOTE_MONGO_URI env variable
 * @returns {Router}
 */
export default function (uri) {
  const logger = createLogger();
  const appName = 'Notifications';
  const debug = false;
  const operatorCreator = (() => {
    const operators = new Map();
    const cacheKeyForOperator = 'mongo_operator';

    return async function() {
      //check cache
      if (operators.has(cacheKeyForOperator)) {
        return operators.get(cacheKeyForOperator);
      }

      //try to create, update cache and return the operator
      try {
        const operator = await getOperator(uri);
        operators.set(cacheKeyForOperator, operator);
        return operator;
      } catch (error) {
        console.error('Error initializing operator:', error);// eslint-disable-line
        return undefined;
      }
    };
  })();

  return new Router()
    .use(handleFailedQueryParams(appName))
    .get('/:client', handleFailedRouteParams(appName), getNotifications)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));

  /**
   * Get handler
   *
   * @param {String} req.params.client client requesting notifications
   * @returns {JSON}
   */
  async function getNotifications(req, res, next) {
    logger.log('info', `statusRoute/getNotifications, httpStatus: ${httpStatus.OK}`);
    logger.verbose('Getting notifications');
    try {
      const {client} = req.params;
      if (!client) {
        throw new Error('Client param missing from from getNotifications');
      }

      const items = debug ? getDebugData(client) : await getNoteItemsFromDb(client);
      res.json({'notifications': items});
    } catch (error) {
      console.log(error); // eslint-disable-line
      return next(error);
    }
  }

  /**
   * Using mongo notes operator get from database notification items relevant to client
   *
   * @param {String} client what spesific client requests their notificaitons
   * @returns {Array} resolves to array of objects, can be empty array
   */
  async function getNoteItemsFromDb(client) {
    try {
      const mongoNotesOperator = await operatorCreator(uri);
      if (!mongoNotesOperator) {
        const operatorMissingWarning = `No mongo notes operator. See that mongo uri is set into env. Defaulting to empty array`;
        throw new Error(operatorMissingWarning);
      }
      const items = await mongoNotesOperator.getNoteItemsForApp(client);
      return items;
    } catch (error) {
      console.log(error); // eslint-disable-line
      logger.log('info', error);
      return [];
    }
  }

  /**
   *
   * Simulates data fetched from db. More controll for debug purposes, most likely later deleted
   *
   * @param {String} client what spesific client requests their notificaitons
   * @returns {Array} resolves to array of objects, can be empty array
   */
  function getDebugData(client) {
    //Placeholder data
    //see melinda-ui-commons/mongoNotes.js for valid options
    const notifications = [
      //test dialogs
      {
        id: '65805a34d500f6a4ff2eccc4',
        messageStyle: 'info',
        messageText: 'Tiesitkö että tämä on sinulle inffo.',
        componentStyle: 'dialog',
        blocksInteraction: false,
        isDismissible: true,
        endDate: new Date('2023-12-30T12:30:15.002'),
        url: 'https://www.kansalliskirjasto.fi/',
        context: ['muuntaja']
      },
      {
        id: '65805a34d500f6a4ff2eccc5',
        messageStyle: 'alert',
        messageText: 'Hei. Huomaathan että.',
        componentStyle: 'dialog',
        blocksInteraction: false,
        isDismissible: true,
        endDate: new Date('2023-12-30T12:30:15.002'),
        context: ['muuntaja', 'merge']
      },
      {
        id: '65805a34d500f6a4ff2eccc6',
        messageStyle: 'error',
        messageText: 'Tapahtui virhe',
        componentStyle: 'dialog',
        blocksInteraction: false,
        isDismissible: true,
        endDate: new Date('2023-12-30T12:30:15.002'),
        context: ['viewer']
      },
      //Success wont be needed in notifications, use it here to test clients UI
      {
        id: '65805a34d500f6a4ff2eccc7',
        messageStyle: 'success',
        messageText: 'Kaikki Onnistui',
        componentStyle: 'dialog',
        blocksInteraction: false,
        isDismissible: true,
        endDate: new Date('2023-12-30T12:30:15.002'),
        context: ['all']
      },
      //test static banner
      {
        id: '65805a34d500f6a4ff2eccc8',
        messageStyle: 'info',
        messageText: 'Seuraavassa lähitulevaisuudessa tapahtuu asioita ja homma ei toimi x aikaan',
        componentStyle: 'banner_static',
        blocksInteraction: false,
        isDismissible: false,
        endDate: new Date('2023-12-30T12:30:15.002'),
        context: ['muuntaja']
      },
      //throw single banner
      {
        id: '65805a34d500f6a4ff2eccc9',
        messageStyle: 'success',
        messageText: 'Kaikki Onnistui',
        componentStyle: 'banner',
        blocksInteraction: false,
        isDismissible: false,
        endDate: new Date('2023-12-30T12:30:15.002'),
        context: ['muuntaja']
      }
      ////couple of blocking dialogs that take priority
      // {
      //   id: '65805a34d500f6a4ff2eccc10',
      //   messageStyle: 'alert',
      //   messageText: 'Jokin meni vikaan',
      //   componentStyle: 'dialog',
      //   blocksInteraction: true,
      //   isDismissible: false,
      //   endDate: new Date('2023-12-30T12:30:15.002'),
      //   context: ['all']
      // },
      // {
      //   id: '65805a34d500f6a4ff2eccc11',
      //   messageStyle: 'error',
      //   messageText: 'Jokin meni rikki',
      //   componentStyle: 'dialog',
      //   blocksInteraction: true,
      //   isDismissible: false,
      //   endDate: new Date('2023-12-30T12:30:15.002'),
      //   context: ['all']
      // }
    ];

    const filteredItems = notifications.filter(obj => obj.context && (obj.context.includes(client) || obj.context.includes('all')));
    return filteredItems;
  }

  /**
   * Dynamically load mongo notes script and try to create usable operator
   */
  async function getOperator() {
    try {
      const module = await import('@natlibfi/melinda-ui-commons/src/scripts/notes.js');
      const createMongoNotesOperator = module.default;
      return uri ? await createMongoNotesOperator(uri) : undefined;
    } catch (error) {
      console.error('Error loading operator operator:', error);// eslint-disable-line
      return undefined;
    }
  }

}
