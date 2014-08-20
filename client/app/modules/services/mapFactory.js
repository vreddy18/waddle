angular.module('waddle.services.mapFactory', [])

.factory('MapFactory', function($q){

  var QuadTree = function (latlng, id) {
    this.lat = latlng[0];
    this.lng = latlng[1];
    this.id = id;
    this.NE = null;
    this.SE = null;
    this.NW = null;
    this.SW = null;
  }

  QuadTree.prototype.insert = function (latlng, id) {
    var myLat = latlng[0];
    var myLng = latlng[1];

    if (myLat >= this.lat && myLng >= this.lng) {
      this.NE ? this.NE.insert(latlng, id) : this.NE = new QuadTree(latlng, id);
    } else if (myLat < this.lat && myLng >= this.lng) {
      this.SE ? this.SE.insert(latlng, id) : this.SE = new QuadTree(latlng, id);
    } else if (myLat >= this.lat && myLng < this.lng) {
      this.NW ? this.NW.insert(latlng, id) : this.NW = new QuadTree(latlng, id);
    } else if (myLat < this.lat && myLng < this.lng) {
      this.SW ? this.SW.insert(latlng, id) : this.SW = new QuadTree(latlng, id);
    }
  };

  QuadTree.prototype.markersInBounds = function (SW, NE) {
    var upperLat = NE.lat;
    var upperLng = NE.lng;
    var lowerLat = SW.lat;
    var lowerLng = SW.lng;

    var res = [];

    var recur = function (node) {

      if (node === null) {
        return;
      }

      if (node.lat >= lowerLat && node.lat <= upperLat && node.lng >= lowerLng && node.lng <= upperLng) {
        res.push(node.id);
      }

      if (node.lat >= lowerLat) {
        if (node.lng >= lowerLng) {
          recur(node.SW);
        }
        if (node.lng <= upperLng) {
          recur(node.SE);
        }
      }
      if (node.lat <= upperLat) {
        if (node.lng >= lowerLng) {
          recur(node.NW);
        }
        if (node.lng <= upperLng) {
          recur(node.NE);
        }
      }
    };

    recur(this);

    return res;
  };

  var markerQuadTree = null;
  
	return {
    QuadTree: QuadTree,
		markerQuadTree: markerQuadTree
	};
});