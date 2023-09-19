import HttpStatus from 'http-status';
import express, {Router} from 'express';

export default function () {
    console.log('   ---------- this comes from pingroute.js')

    return new Router()
      .get('/', ping());
  
    function ping(req, res) {
        console.log('   ----------     from pingroute.js: function PING')        
        return res.status(HttpStatus.OK).end();
    }
      
  } 
