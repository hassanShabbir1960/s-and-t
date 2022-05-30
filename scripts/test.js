
String.prototype.format = function () {
    // store arguments in an array
    var args = arguments;
    // use replace to iterate over the string
    // select the match and check if related argument is present
    // if yes, replace the match with the argument
    return this.replace(/{([0-9]+)}/g, function (match, index) {
      // check if the argument is present
      return typeof args[index] == 'undefined' ? match : args[index];
    });
  };

var makeQuerybody = function (query) {

    /// Case 1 -  Exact match phrase

    if (query.includes("=")){
        query = query.replace('=','');
        qBody = '{"size":25,"query":{"bool": {"must": [{"match_phrase": {"Text": "{0}" }}]} }}'.format(query)
        return qBody
    }
    else{
        qBody = '{"size":25,"query":{"bool": {"must": [{"query_string": {"query": "{0}" }}]} }}'.format(query)
        return qBody
    }
    
  }

// var txt = " [File:MBE] Criminal"
// init = txt.indexOf('[');
// fin = txt.indexOf(']');
// file_text = (txt.substr(init+1,fin-init-1))
// file_text = file_text.replace("File:","")
// file_text = file_text.replace("file:","")
// console.log(file_text);

// remaining_string = txt.slice(txt.indexOf(']')+1 )
// console.log(remaining_string)

// //str = str.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
// //str = str.replace(/[\r\n]{3,}/g, "\n");
// //str = str.replace(/(\r\n|\r|\n){2}/g, '$1').replace(/(\r\n|\r|\n){3,}/g, '$1\n');

// //console.log(str);
// //console.log(str);

// //console.log(makeQuerybody("(intentional killing)"))

// // qBody = '{"size":25,"query":{"bool": {"must": [{"match_phrase": {"Text": "{0}" }}]} }}'.format("criminal")
// // console.log(qBody.slice(0,78))
// filter_body = ',"filter": [{"match": {"Destination": "{0}"}}]'.format("MBE")
// final_body = qBody.slice(0,qBody.indexOf(']')+1) + filter_body + qBody.slice(qBody.indexOf(']')+1) 
// // console.log(final_body)



var str = "Hello, this is Mike [example]uu";

console.log(str.replace(/\s*\[.*?\]\s*/g, ' '));
