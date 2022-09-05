const csv = require('csv-parser');
let { createReadStream, createWriteStream, writeFile, readFile } = require('fs');
const path = require("path");
const createcsv = require('./createcsv')

const EventEmitter = require('node:events');
class NewEvents extends EventEmitter {}
const newEvents = new NewEvents();

const results = [];

const csvFolder = 'data/csv';
const jsonFolder = 'data/json';
let inJsonFileName = 'employee_master_list.json';
let outCSVFileName = 'Designation.csv';
global.columnName = 'DESIGNATION';
global.startID = 5;
let outJsonFileName = 'employee_master_list.json';
let inCSVFileName = 'employee_master_list.csv';

createReadStream(path.join(__dirname,csvFolder,inCSVFileName))
    .pipe(csv())
    .on('data', (data) =>{ 
        results.push(data)
    })
    .on('end',()=>{
        const employee_master_list_json = JSON.stringify(results)
        writeFile(path.join(__dirname,jsonFolder,outJsonFileName),employee_master_list_json,(err)=>{
            if (err)
            console.log(err);
          else {
            newEvents.emit('json_write_completed');
          }
        })
    })
    let fieldOptions = ['NAME', 'ID', 'CODE'];
    let userFieldOptions = ['UserID','UserName', 'Full Name', 'OrganizationID', 'DepartmentID', 'DesignationID']
    let inputPath = path.join(__dirname,jsonFolder,inJsonFileName);
    let outputPath = path.join(__dirname,csvFolder,outCSVFileName);
    newEvents.on('json_write_completed',()=>{
        console.log("File written successfully\n");
        createcsv(fieldOptions,inputPath,outputPath,columnName, startID)
    })





