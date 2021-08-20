/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for transforming MARC records in Melinda
*
* Copyright (C) 2015-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-muuntaja
*
* melinda-muuntaja program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

/*eslint-disable quotes*/

import {preset as MergeValidationPreset} from '../../marc-record-merge-validate-service';
import {preset as PostMergePreset} from '../../marc-record-merge-postmerge-service';
import TargetRecord from './target-record';
import TargetSubrecord from './target-subrecord';
import * as subrecordMergeTypes from '../subrecord-merge-types';

module.exports = {
  "name": "Muunna osakohteet",
  "description": "TESTIPROFIILI",
  "mergeType": "demo",
  "record": {
    "targetRecord": TargetRecord,
    "validationRules": MergeValidationPreset.melinda_host,
    "postMergeFixes": PostMergePreset.defaults,
    "mergeConfiguration": {
      "fields": {
        "1..": {"action": "copy", "options": {"dropOriginal": true}}
      }
    }
  },
  "subrecords": {
    "mergeType": subrecordMergeTypes.MERGE,
    "targetRecord": TargetSubrecord,
    "validationRules": MergeValidationPreset.melinda_component,
    "postMergeFixes": PostMergePreset.defaults,
    "mergeConfiguration": {
      "fields": {
        "245": {"action": "copy", "options": {"dropOriginal": true}},
        "336": {"action": "copy", "options": {"dropOriginal": true}},
        "77.": {"action": "copy", "options": {"compareWithout": ["9"]}}
      }
    }
  }
};

/*eslint-enable quotes*/
