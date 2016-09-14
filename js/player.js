/*$(function(){
  soundManager.setup({
    useHTML5Audio: true,
    preferFlash: true,
    onready: function() {
      // Ready to use; soundManager.createSound() etc. can now be called.
    }
  });
})
*/
function Player($http, $timeout) {
  return {
    restrict: "E",
    templateUrl: "/player.html",
    scope: {},
    link: function($scope){
      $scope.tracks = [];
      $scope.track = {};
      $scope.player = undefined;
      $scope.isPlaying = false;
      $scope.autoPlay = true;
      SC.initialize({
        client_id: '8ceba3a1ed41b04787f560e70efa7c2f',
      });
      SC.resolve("http://soundcloud.com/musikelta/tracks").then(function(tracks){
        $timeout(function(){
          $scope.initPlayer(tracks);
        });
      });

      var stream = function(url){
        var firstRun = $scope.player === undefined;
        $scope.pause();
        SC.stream(url).then(function(player){
          if (player.options.protocols[0] === 'rtmp') {
              player.options.protocols.splice(0, 1);
          }
          $scope.player = player;
          if(!firstRun || $scope.autoPlay){
            $timeout(function(){
              $scope.play();
            });
          }
          $scope.player.once("finish", function(){
            $timeout(function(){
              $scope.forward();
            });
          });
        });
      };

      $scope.initPlayer = function(tracks){
        $scope.tracks = tracks;
        $scope.forward();
      }

      $scope.play = function(){
        if($scope.player && !$scope.player.isPlaying()){
          $scope.player.play();
          $scope.isPlaying = true;
        }
      }
      $scope.pause = function(){
        if($scope.player && $scope.player.isPlaying()){
          $scope.player.pause();
          $scope.isPlaying = false;
        }
      }
      $scope.toggle = function(){
        if($scope.isPlaying){
          $scope.pause();
        }else{
          $scope.play();
        }
      }
      $scope.forward = function(){
        if($scope.player){
          $scope.player.seek(1);
        }
        $scope.tracks.unshift($scope.tracks.pop());
        $scope.track = $scope.tracks[0];
        stream("/tracks/"+$scope.track.id);
      }

      $scope.backward = function(){
        if($scope.player){
          $scope.player.seek(1);
        }
        $scope.tracks.push($scope.tracks.shift());
        $scope.track = $scope.tracks[0];
        stream("/tracks/"+$scope.track.id);
      }
    }
  };
}
