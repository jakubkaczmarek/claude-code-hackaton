// favorites - uses localstorage
app.factory('FavoritesService', function() {

  var STORAGE_KEY = 'realestate_favorites';

  function loadIds() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  }

  function saveIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  return {

    getIds: function() {
      return loadIds();
    },

    isFavorite: function(id) {
      var ids = loadIds();
      var found = false;
      for (var i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
          found = true;
        }
      }
      return found;
    },

    toggle: function(id) {
      var ids = loadIds();
      var alreadyThere = false;
      for (var i = 0; i < ids.length; i++) {
        if (ids[i] === id) {
          alreadyThere = true;
        }
      }
      if (alreadyThere === true) {
        var newIds = [];
        for (var j = 0; j < ids.length; j++) {
          if (ids[j] !== id) {
            newIds.push(ids[j]);
          }
        }
        saveIds(newIds);
      } else {
        ids.push(id);
        saveIds(ids);
      }
    },

    getCount: function() {
      return loadIds().length;
    }

  };

});
