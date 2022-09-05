const csv = require('csv-parser');
let { createReadStream, createWriteStream, writeFile, readFile } = require('fs');
const path = require("path");
const { AsyncParser, Parser } = require('json2csv');

const EventEmitter = require('node:events');

const writeComplete = new EventEmitter();

const results = [];

const csvFolder = 'data/csv';
const jsonFolder = 'data/json';
let outCSVFileName = 'User.csv';
let inMasterFile = 'employee_master_list.csv';
let inCSVFiles = ['Designation.csv','Department.csv'];
let userFieldOptions = ['UserID','UserName', 'Full Name', 'DepartmentID', 'DesignationID']
let tmpArr = {};

inCSVFiles.forEach((item, index)=>{
  tmpArr[index]=[];
  createReadStream(path.join(__dirname,csvFolder,item))
  .pipe(csv())
  .on('data', (data) =>{ 
    tmpArr[index].push(data)
  })
  .on('end',()=>{
      if( index+1 == inCSVFiles.length){
        writeComplete.emit('completed')
      }
  })
})

writeComplete.on('completed',()=>{

  
createReadStream(path.join(__dirname,csvFolder,inMasterFile))
.pipe(csv({
  mapHeaders:({ header, index})=>{
    if(header=='ID')return header = 'UserID';
    if(header == 'NAME') return header = 'Full Name';
    return header;
  },
  mapValues:({ header, index, value })=>{
    if(header=='UserID'){
      return value.replace(/[^\w\s]/gi, '')
    }
    return value
  }
}))
.on('data', (data) =>{ 
 results.push(data)
})
.on('end',()=>{
    // const employee_master_list_json = JSON.stringify(results)
    writeComplete.emit('master_data_available')
  //  console.log(results)
})

})

writeComplete.on('master_data_available',()=>{
  results.forEach((resultItem,resultIndex)=>{
    delete resultItem.SRNO;
    if(resultItem['Full Name'].length > 39){
      resultItem.UserName = resultItem['Full Name'].slice(0,39)
    }else {
      resultItem.UserName = resultItem['Full Name'];
    }
    inCSVFiles.forEach((fileItem, fileIndex)=>{
      for( let i=0; i<tmpArr[fileIndex].length;i++){
        if(resultItem.DESIGNATION == tmpArr[fileIndex][i].NAME){
          delete resultItem.DESIGNATION;
          resultItem.DesignationID = tmpArr[fileIndex][i].ID;
          results[resultIndex] = resultItem;
          break;
        }
        if(resultItem.DEPARTMENT == tmpArr[fileIndex][i].NAME){
          delete resultItem.DEPARTMENT;
          resultItem.DepartmentID = tmpArr[fileIndex][i].ID;
          results[resultIndex] = resultItem;
          break;
        }
      }
    })
    if(resultIndex+1 == results.length){
      let jsonresults = JSON.stringify(results)
      writeComplete.emit('ready_for_json', jsonresults)
    }
  })
})

function formatColumns(item){
    
}
const { Readable } = require('stream');


writeComplete.on('ready_for_json',(jsonresults)=>{
  const opts = { fields:userFieldOptions, quote :''};
  const transformOpts = { highWaterMark: 8192 };
  
  //const input = createReadStream(jsonresults,  { encoding: 'utf8' });
  const input = Readable.from(jsonresults);
  const output = createWriteStream(path.join(__dirname,csvFolder,outCSVFileName), { encoding: 'utf8' });
  const asyncParser = new AsyncParser(opts, transformOpts);
  const parsingProcessor = asyncParser.fromInput(input).toOutput(output);
  parsingProcessor.promise(false).catch(err => console.error(err));
})









