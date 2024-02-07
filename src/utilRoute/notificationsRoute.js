import httpStatus from 'http-status';
import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';
import {handleFailedQueryParams} from '../requestUtils/handleFailedQueryParams';
import {handleFailedRouteParams} from '../requestUtils/handleFailedRouteParams';
import {handleRouteNotFound} from '../requestUtils/handleRouteNotFound';
import {handleError} from '../requestUtils/handleError';

export default function () {
  const logger = createLogger();
  const appName = 'Notifications';

  return new Router()
    .use(handleFailedQueryParams(appName))
    .get('/:client', handleFailedRouteParams(appName), getNotifications)
    .use(handleRouteNotFound(appName))
    .use(handleError(appName));

  function getNotifications(req, res, next) {
    logger.log('info', `statusRoute/getNotifications, httpStatus: ${httpStatus.OK}`);

    try {
      logger.verbose('Getting notifications ...');

      const notifications = [];

      //Placeholder data
      //see melinda-ui-commons/mongoNotes.js for valid options

      // const notifications = [
      //   //test dialogs
      //   {
      //     id: '65805a34d500f6a4ff2eccc4',
      //     messageStyle: 'info',
      //     messageText: 'Tiesitkö että tämä on sinulle inffo.',
      //     componentStyle: 'dialog',
      //     blocksInteraction: false,
      //     isDismissible: true,
      //     endDate: new Date('2023-12-30T12:30:15.002'),
      //     url: 'https://www.google.com',
      //     context: ['muuntaja']
      //   },
      //   {
      //     id: '65805a34d500f6a4ff2eccc5',
      //     messageStyle: 'alert',
      //     messageText: 'Hei. Huomaathan että.',
      //     componentStyle: 'dialog',
      //     blocksInteraction: false,
      //     isDismissible: true,
      //     endDate: new Date('2023-12-30T12:30:15.002'),
      //     context: ['muuntaja', 'merge']
      //   },
      //   {
      //     id: '65805a34d500f6a4ff2eccc6',
      //     messageStyle: 'error',
      //     messageText: 'Tapahtui virhe',
      //     componentStyle: 'dialog',
      //     blocksInteraction: false,
      //     isDismissible: true,
      //     endDate: new Date('2023-12-30T12:30:15.002'),
      //     context: ['viewer']
      //   },
      //   //Success wont be needed in notifications, use it here to test clients UI
      //   {
      //     id: '65805a34d500f6a4ff2eccc7',
      //     messageStyle: 'success',
      //     messageText: 'Kaikki Onnistui',
      //     componentStyle: 'dialog',
      //     blocksInteraction: false,
      //     isDismissible: true,
      //     endDate: new Date('2023-12-30T12:30:15.002'),
      //     context: ['all']
      //   },
      //   //test static banner
      //   {
      //     id: '65805a34d500f6a4ff2eccc8',
      //     messageStyle: 'info',
      //     messageText: 'Seuraavassa lähitulevaisuudessa tapahtuu asioita ja homma ei toimi x aikaan',
      //     componentStyle: 'banner_static',
      //     blocksInteraction: false,
      //     isDismissible: false,
      //     endDate: new Date('2023-12-30T12:30:15.002'),
      //     context: ['muuntaja']
      //   },
      //   //throw single banner
      //   {
      //     id: '65805a34d500f6a4ff2eccc9',
      //     messageStyle: 'success',
      //     messageText: 'Kaikki Onnistui',
      //     componentStyle: 'banner',
      //     blocksInteraction: false,
      //     isDismissible: false,
      //     endDate: new Date('2023-12-30T12:30:15.002'),
      //     context: ['muuntaja']
      //   }
      //   ////couple of blocking dialogs that take priority
      //   // {
      //   //   id: '65805a34d500f6a4ff2eccc10',
      //   //   messageStyle: 'alert',
      //   //   messageText: 'Jokin meni vikaan',
      //   //   componentStyle: 'dialog',
      //   //   blocksInteraction: true,
      //   //   isDismissible: false,
      //   //   endDate: new Date('2023-12-30T12:30:15.002'),
      //   //   context: ['all']
      //   // },
      //   // {
      //   //   id: '65805a34d500f6a4ff2eccc11',
      //   //   messageStyle: 'error',
      //   //   messageText: 'Jokin meni rikki',
      //   //   componentStyle: 'dialog',
      //   //   blocksInteraction: true,
      //   //   isDismissible: false,
      //   //   endDate: new Date('2023-12-30T12:30:15.002'),
      //   //   context: ['all']
      //   // }
      // ];

      //proper backend fetch here// eslint-disable-line
      const clientRequested = req.params.client;
      const filteredItems = notifications.filter(obj => obj.context && (obj.context.includes(clientRequested) || obj.context.includes('all')));
      res.json({'notifications': filteredItems});
    } catch (error) {
      console.log(error); // eslint-disable-line
      return next(error);
    }
  }
}
