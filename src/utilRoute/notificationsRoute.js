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
    try {
      logger.verbose('Getting notifications ...');
      const notifications = [
        {
          type: 'info',
          isBlocking: false,
          message: 'THis is a test data from server'
        },
        {
          type: 'alert',
          isBlocking: false,
          message: 'THis is a second test data from server'
        },
        {
          type: 'error',
          isBlocking: true,
          message: 'THis is a third test data from server'
        }
      ];

      res.json({notifications});
    } catch (error) {
        console.log(error); // eslint-disable-line
      return next(error);
    }
  }
}
