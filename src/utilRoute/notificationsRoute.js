import httpStatus from 'http-status';
import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';

export default function createNotificationsRoute() {
  const logger = createLogger();

  return new Router()
    .use('/:client', getNotifications);

  function getNotifications(req, res, next) {
    logger.log('info', `statusRoute/getNotifications, httpStatus: ${httpStatus.OK}`);

    //Placeholder data // eslint-disable-line
    // types that client side understands // eslint-disable-line
    //info/success/alert/error/ // eslint-disable-line
    //dialog/banner/static_banner
    try {
      logger.verbose('Getting notifications ...');

      const notifications = [

        /*
        //test dialogs
        {
          _id: '65805a34d500f6a4ff2eccc4',
          type: 'info',
          message: 'Tiesitkö että tämä on sinulle inffo.',
          componentStyle: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002'),
          context: {
            app: ['muuntaja']
          }
        },
        {
          _id: '65805a34d500f6a4ff2eccc5',
          type: 'alert',
          message: 'Hei. Huomaathan että.',
          componentStyle: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002'),
          context: {
            app: ['muuntaja', 'merge']
          }
        },
        {
          _id: '65805a34d500f6a4ff2eccc6',
          type: 'error',
          message: 'Tapahtui virhe',
          componentStyle: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002'),
          context: {
            app: ['viewer']
          }
        },
        //Success wont be needed in notifications, use it here to test clients UI
        {
          _id: '65805a34d500f6a4ff2eccc7',
          type: 'success',
          message: 'Kaikki Onnistui',
          componentStyle: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002'),
          context: {
            app: ['all']
          }
        },
        //test static banner
        {
          _id: '65805a34d500f6a4ff2eccc8',
          type: 'info',
          message: 'Seuraavassa lähitulevaisuudessa tapahtuu asioita ja homma ei toimi x aikaan',
          componentStyle: 'static_banner',
          preventOperation: false,
          hidable: false,
          removeDate: new Date('2023-12-30T12:30:15.002'),
          context: {
            app: ['muuntaja']
          }
        },
        //throw single banner
        {
          _id: '65805a34d500f6a4ff2eccc9',
          type: 'success',
          message: 'Kaikki Onnistui',
          componentStyle: 'banner',
          preventOperation: false,
          hidable: false,
          removeDate: new Date('2023-12-30T12:30:15.002'),
          context: {
            app: ['muuntaja']
          }
        }
        */
      ];
      //proper backend fetch here// eslint-disable-line
      const clientRequested = req.params.client;
      const filteredItems = notifications.filter(obj => obj.context && (obj.context.app.includes(clientRequested) || obj.context.app.includes('all')));
      res.json({'notifications': filteredItems});
    } catch (error) {
      console.log(error); // eslint-disable-line
      return next(error);
    }
  }
}
