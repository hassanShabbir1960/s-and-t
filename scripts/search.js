
var basePath = 'https://elodocuments.es.us-central1.gcp.cloud.es.io:9243';
var index = 'sandt'


var myHeaders = new Headers();
myHeaders.append("Authorization", "Basic ZWxhc3RpYzpOQjM5aGxLWnRwdk52cmZVTE1VZ0U2Tzg=");
myHeaders.append("Content-Type", "application/json");


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

var loadingdiv = $('#loading');
var noresults = $('#noresults');
var resultdiv = $('#results');
var searchbox = $('input#search');
var timer = 0;

// Executes the search function 500 milliseconds after user stops typing
searchbox.keyup(function () {
  clearTimeout(timer);
  timer = setTimeout(search, 1000);
});


var makeQuerybody = function (query) {

  /// Case 1 -  Exact match phrase

  if (query.includes("=")){
      query = query.replace('=','');
      qBody = '{"size":25,"query":{    "bool": {"must": [{"match_phrase": {"Text": "{0}" }}]} }}'.format(query)
      return qBody
  }
  else{
      qBody = '{"size":25,"query":{    "bool": {"must": [{"query_string": {"query": "{0}" }}]} }}'.format(query)
      return qBody
  }
  
}



var clean_query = function (query) {

  init = query.indexOf('[');
  fin = query.indexOf(']');
  file_text = (query.substr(init+1,fin-init-1))

  file_text = file_text.replace("File:","")
  file_text = file_text.replace("file:","")
  filter_body = ',"filter": [{"match": {"Destination": "{0}"}}]'.format(file_text)

  console.log(file_text);


  //remaining_string = query.slice(query.indexOf(']')+1 )
  remaining_string = query.replace(/\s*\[.*?\]\s*/g, ' ')

  console.log(remaining_string)

  return {"filter_text":filter_body,"cleaned_query":remaining_string}

}



var applyFilters = function (qBody,filter_body) {
  final_body = qBody.slice(0,qBody.indexOf(']')+1) + filter_body + qBody.slice(qBody.indexOf(']')+1) 
  return final_body

}

// Get response from elasticsearch
var getResponse = function (query) {
  
  var url = basePath + '/' + index + '/' + '_search';
  if (query.includes("[") && query.includes("]")) {
    vals = clean_query(query)
    remaining_query = vals.cleaned_query 
    filter_body = vals.filter_text
    qBody = makeQuerybody(remaining_query);
    final_body = applyFilters(qBody,filter_body);
    

  }
  else{
    final_body = makeQuerybody(query);
  }
  console.log("This is query",final_body);
  return fetch(url, {
      method: 'POST',
      headers:myHeaders,
      body: final_body
  })
  .then(function(response) {
    return response.text();
  })
  .then(function(data){
    var data_obj = JSON.parse(data);
    return data_obj
  })
}

// Function to perform highlihting
var removeUnwantedWords = function (query) {

  temp = (query.replace(/[^a-zA-Z ]/g, ""));     
  temp = temp.replaceAll("AND","")
  temp = temp.replaceAll("OR","")
  temp = temp.replaceAll("NOT","")
  return temp
}

var gatherAllwords = function(temp,query){
  temp = removeUnwantedWords(query)
  var textArray = temp.split(/(\s+)/);
  
  var array = [];


  for (var t=0; t<textArray.length; t++){
    if (textArray[t].length >1 ){
    array.push(textArray[t].toLowerCase());
    capt = textArray[t].charAt(0).toUpperCase() + textArray[t].slice(1);
    array.push(capt);
    array.push(textArray[t].toUpperCase());
    
    }
  }
  return array;
}

var highlihting = function(array,text){
  for (var t=0; t<array.length; t++){
    if (array[t].length >1 ){
        // console.log(array[t]);
        // console.log("fsdfdsfsfdssfd");
        
        text = text.replaceAll(array[t],' <span style= "background: #CCCC00" >'+ array[t] + '</span>'  );
        
    //break;//console.log(text);
    }
    
  }
  return text
}

async function search() {
  // Clear results before searching
  noresults.hide();
  resultdiv.empty();
  loadingdiv.show();
  // Get the query from the user
  let query = searchbox.val();
  // Only run a query if the string contains at least three characters
  if (query.length > 2) {
    // Make the HTTP request with the query as a parameter and wait for the JSON results
    let response = await getResponse(query)
    // Get the part of the JSON response that we care about
    let results = await response['hits']['hits'];
    if (results.length > 0) {
      loadingdiv.hide();
      // Iterate through the results and write them to HTML
      
      resultdiv.append('<p>Found ' + response['hits']['total']['value']+ ' results.</p>');
      
      temp = removeUnwantedWords(query);
      var array = gatherAllwords(temp,query);

      var i= 1
      console.log(results);
      for (var item in results) {

        let uh_text = results[item]._source.Text
       
        text = highlihting(array,uh_text)
        let path = results[item]._source.Destination
        resultdiv.append(" <Strong> <u><p> Match " + i + " : </p</u> </Strong>") 
        resultdiv.append('<span style="color: #008000">  File path :' + path+ '</span> ');
        resultdiv.append('<div class="result">' + text+ '</p></div></div>');
        resultdiv.append('===============================================');
        i+=1

      }
    } else {
      noresults.show();
    }
  }
  loadingdiv.hide();
}

// Tiny function to catch images that fail to load and replace them
function imageError(image) {
  image.src = 'images/no-image.png';
}
