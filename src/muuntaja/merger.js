//const sourceRecord = MarcRecord.clone(source, sourceValidators);
//return reducers.reduce((baseRecord, reducer) => reducer(baseRecord, sourceRecord), MarcRecord.clone(base, baseValidators));

export default ({base, source, reducers}) => reducers.reduce((baseRecord, reducer) => reducer(baseRecord, source), base);
