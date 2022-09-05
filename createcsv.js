const { createReadStream, createWriteStream } = require('fs');
const { AsyncParser } = require('json2csv');


const available =[]


function formatColumns(item){
    if (!available.includes(item[columnName].trim())){
        available.push(item[columnName].trim())
        let codeArray = item[columnName].split(" ");
        let code ="";

        switch(codeArray.length){
            case 1:
                codeArray.forEach(innerItem=>{
                    code = innerItem.substring(0,6)
                })
                break;
            case 2:
                codeArray.forEach(innerItem=>{
                    code += innerItem.substring(0,3);
                })
                break;

            case 3:
                codeArray.forEach(innerItem=>{
                    code += innerItem.substring(0,2);
                })
                break;
            case 4:
            case 5:
                codeArray.forEach(innerItem=>{
                    code += innerItem.substring(0,1)
                })
                break;
            case 6:
                codeArray.forEach(innerItem=>{
                    code += innerItem.substring(0,1)
                })
                break;
        }
        code = code.replace(/[^\w\s]/gi, '')
        let regExp = /\(([^)]+)\)/;
        let matches = regExp.exec(item[columnName])
        code = code.trim();
        if(matches){
            if(code.length > 4){
                const withoutLast3 = code.slice(0, -3);
                code = withoutLast3 + matches[0];
            } 
            if (code.length < 4){
                code += matches[0];
            }
            
        }
        
        code = code.replace(/[^\w\s]/gi, '')

        return {  ID: startID++, NAME:item[columnName], CODE:code};
    }
    
}

const createcsv = (fields, inputPath, outputPath,startID,columnName)=>{

    const opts = { fields, quote :'', transforms:[formatColumns]};
    const transformOpts = { highWaterMark: 8192,encoding: 'utf-8' };
    const input = createReadStream(inputPath,  { encoding: 'utf8' });
    const output = createWriteStream(outputPath, { encoding: 'utf8' });
    const asyncParser = new AsyncParser(opts, transformOpts);
    const parsingProcessor = asyncParser.fromInput(input).toOutput(output);

    parsingProcessor.promise(false).catch(err => console.error(err));
}

module.exports = createcsv;