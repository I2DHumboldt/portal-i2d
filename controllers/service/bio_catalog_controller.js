/* 
   Portal web de la Infraestructura Institucional de Datos del IAvH
   Copyright (C) 2016 Germán Carrillo para el IAvH
   E-mail:   gcarrillo@linuxmail.org

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program. If not, see <http://www.gnu.org/licenses>
*/

var httpRequest = require('request'),
    searchUrl = 'http://localhost:9200/', 
    elasticsearch = require('elasticsearch'),
    client = new elasticsearch.Client({
      host: searchUrl
    });

exports.search = function(request, response) {
  var q = request.query.q;

  if (q === undefined){
    response.status(500).send({statusCode:500, message: 'Parameter q is missing.'});
    return;
  }

  console.log(" ***** POST (q: " + q + ") ***** ");
  client.searchTemplate( {
      index: 'ceiba',
      type: 'recurso',
      body : {
          'id': 'dsl',
          'params': {
              'query': '"' + q + '"',
              'from': 1,
              'size': 5
          }
      }
  } ).then( function( body ){
      var hits = body.hits.hits,
          results = {},
          retrievedCount = hits.length,
          totalCount = body.hits.total;
      for (var i=0; i<retrievedCount; i++){
          results[hits[i]._id] = [hits[i]._source.resource.title,
            hits[i]._source.resource.abstract];
      }
      response.status(200).send({query:q, resources:results, retrieved:retrievedCount, total:totalCount});      
  }, function ( error ) {
      console.trace(error.message);
      response.status(500).send({statusCode:500, message: "An error occurred during the HTTP request. "+error.message});
  });
};