import httpStatus from 'http-status';
import {Router} from 'express';
import {createLogger} from '@natlibfi/melinda-backend-commons';

export default function createNotificationsRoute() {
  const logger = createLogger();

  return new Router()
    .use('/', getNotifications);

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
          type: 'info',
          message: 'Tiesitkö että tämä on sinulle inffo.',
          style: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002')
        },
        {
          type: 'alert',
          message: 'Hei. Huomaathan että.',
          style: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002')
        },
        {
          type: 'error',
          message: 'Tapahtui virhe',
          style: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002')
        },
        //Success wont be needed in notifications, use it here to test clients UI
        {
          type: 'success',
          message: 'Kaikki Onnistui',
          style: 'dialog',
          preventOperation: false,
          hidable: true,
          removeDate: new Date('2023-12-30T12:30:15.002')
        },
        //test static banner
        {
          type: 'info',
          message: 'Seuraavassa lähitulevaisuudessa tapahtuu asioita ja homma ei toimi x aikaan',
          style: 'static_banner',
          preventOperation: false,
          hidable: false,
          removeDate: new Date('2023-12-30T12:30:15.002')
        },
        //throw single banner
        {
          type: 'success',
          message: 'Kaikki Onnistui',
          style: 'banner',
          preventOperation: false,
          hidable: false,
          removeDate: new Date('2023-12-30T12:30:15.002')
        }
        */
      ];

      res.json({notifications});
    } catch (error) {
        console.log(error); // eslint-disable-line
      return next(error);
    }
  }
}
