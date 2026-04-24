// property service
app.factory('PropertyService', function($http) {

  var cachedData = null;

  return {

    getAll: function() {
      if (cachedData != null) {
        console.log('returning cached properties');
        // fake promise so controller code works
        var fakePromise = {
          then: function(cb) {
            cb(cachedData);
            return { then: function() {}, catch: function() {} };
          }
        };
        return fakePromise;
      }

      return $http.get('/api/properties').then(function(response) {
        console.log('properties loaded', response.data);
        cachedData = response.data;
        return response.data;
      });
    },

    getById: function(id) {
      return $http.get('/api/properties/' + id).then(function(response) {
        console.log('got property', response.data);
        return response.data;
      });
    },

    clearCache: function() {
      cachedData = null;
    }

  };

});
