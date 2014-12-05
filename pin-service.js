angular.module('pin', []).factory('PinService', function ($q, $rootScope, $ionicLoading, $ionicPopup) {
    
    var PIN_LIFE = 5 * 60 * 1000; // pin entry lives five minutes
    var PIN_PREFS_KEY = 'mip_pin';

    
    function createPinForm() {

        var def = $q.defer();

        $scope = $rootScope.$new();
        $scope.pinForm = {
            pin1: '',
            pin2: ''
        };

        function savePin (pin) {
            
            plugins.appPreferences.store(
                function(pin){
                    alert('success saving pin');
                },
                function(err){
                    alert('error saving pin');
                },
                PIN_PREFS_KEY, pin
            );
            
        }

        $ionicPopup.show({
            templateUrl: 'lib/ionic-pin-service/templates/create_pin.html',
            title: 'Set PIN',
            subTitle: 'Please enter your new PIN twice.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        def.reject('cancelled');
                    }
              },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        savePin($scope.pinForm.pin1);
                    }
              },
            ]
        });

        return def.promise;
    }
    
    
    function enterPinForm() {

        var def = $q.defer();

        $scope = $rootScope.$new();
        $scope.pinForm = {
                pin: ''
        };

        $ionicPopup.show({
            templateUrl: 'lib/ionic-pin-service/templates/enter_pin.html',
            title: 'Enter Pin',
            subTitle: 'Please enter your pin.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        def.reject('cancelled');
                    }
              },
                {
                    text: '<b>Enter</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $ionicLoading.show({
                            template: '<li class="ion-looping" data-pack="default" data-tags="refresh, animation" data-animation="true"></li> Please wait...'
                        });

                    plugins.appPreferences.fetch(
                        function(pin){

                            $ionicLoading.hide();

                            if (pin == $scope.pinForm.pin) {
                                console.log('pins matched');
                                def.resolve(true);
                            }
                            else {
                                console.log('pins DID NOT match');
                                console.log(pin + " ("+ typeof pin + ")  <> " + $scope.pinForm.pin + " (" + typeof $scope.pinForm.pin + ")");
                                def.reject(false);
                            }
                        },
                        function(err){
                            $ionicLoading.hide();
                            def.reject(err);
                        },
                        PIN_PREFS_KEY
                    );
                
                }
              },
            ]
        });

        return def.promise;
    }

    return {
        
        /**
         * Check to see if pin is set. If not, ask user to set it.
         */
        initialize: function() {

            $ionicLoading.show({
                template: '<li class="ion-looping" data-pack="default" data-tags="refresh, animation" data-animation="true"></li> Please wait...'
            });
            
            plugins.appPreferences.fetch(
                function(pin){
                    $ionicLoading.hide();
                    console.log('read pin from prefs: '+pin);
                    
                    if (pin == null || pin == "null") {
                        createPinForm();
                    }
                },
                function(err){
                    console.log('error loading pin from prefs: '+err);
                    $ionicLoading.hide();
                    createPinForm();
                },
                PIN_PREFS_KEY
            );
            
        },
        
        /**
         * Ask user for their pin.
         */
        authenticate: enterPinForm
        
    };
    
});
