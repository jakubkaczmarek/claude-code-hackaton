// filter service - handles all the filter stuff
app.factory('FilterService', function($rootScope) {

  var filters = {
    keyword: '',
    type: '',
    status: '',
    location: '',
    bedroomsMin: '',
    priceMin: '',
    priceMax: '',
    sortKey: 'newest'
  };

  return {

    getFilters: function() {
      return filters;
    },

    setFilter: function(key, value) {
      filters[key] = value;
      $rootScope.$broadcast('filtersChanged');
    },

    resetFilters: function() {
      filters.keyword = '';
      filters.type = '';
      filters.status = '';
      filters.location = '';
      filters.bedroomsMin = '';
      filters.priceMin = '';
      filters.priceMax = '';
      filters.sortKey = 'newest';
      $rootScope.$broadcast('filtersChanged');
    },

    apply: function(properties) {
      var result = [];

      for (var i = 0; i < properties.length; i++) {
        var p = properties[i];
        var match = true;

        if (filters.keyword) {
          if (p.title) {
            if (p.description) {
              if (p.address) {
                var searchStr = p.title.toLowerCase() + ' ' + p.description.toLowerCase() + ' ' + p.address.suburb.toLowerCase() + ' ' + p.address.city.toLowerCase();
                if (searchStr.indexOf(filters.keyword.toLowerCase()) === -1) {
                  match = false;
                }
              } else {
                match = false;
              }
            } else {
              match = false;
            }
          } else {
            match = false;
          }
        }

        if (filters.type) {
          if (p.type !== filters.type) {
            match = false;
          }
        }

        if (filters.status) {
          if (p.status !== filters.status) {
            match = false;
          }
        }

        if (filters.location) {
          if (p.location !== filters.location) {
            match = false;
          }
        }

        if (filters.bedroomsMin) {
          if (p.bedrooms < parseInt(filters.bedroomsMin)) {
            match = false;
          }
        }

        if (filters.priceMin) {
          if (p.price < parseInt(filters.priceMin)) {
            match = false;
          }
        }

        if (filters.priceMax) {
          if (filters.priceMax !== '') {
            if (p.price > parseInt(filters.priceMax)) {
              match = false;
            }
          }
        }

        if (match === true) {
          result.push(p);
        }
      }

      // sort
      if (filters.sortKey === 'price-asc') {
        result.sort(function(a, b) {
          return a.price - b.price;
        });
      } else {
        if (filters.sortKey === 'price-desc') {
          result.sort(function(a, b) {
            return b.price - a.price;
          });
        } else {
          if (filters.sortKey === 'newest') {
            result.sort(function(a, b) {
              if (a.listedAt > b.listedAt) { return -1; }
              if (a.listedAt < b.listedAt) { return 1; }
              return 0;
            });
          } else {
            if (filters.sortKey === 'bedrooms-desc') {
              result.sort(function(a, b) {
                return b.bedrooms - a.bedrooms;
              });
            }
          }
        }
      }

      return result;
    }

  };

});
