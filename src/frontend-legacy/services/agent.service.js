// agent service
app.factory('AgentService', function($http) {

  return {

    getAll: function() {
      return $http.get('/api/agents').then(function(response) {
        return response.data;
      });
    },

    getById: function(id) {
      return $http.get('/api/agents/' + id).then(function(response) {
        console.log('agent', response.data);
        return response.data;
      });
    }

  };

});
