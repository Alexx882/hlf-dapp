var app = angular.module("filesShop", []); 

class Offer {
    constructor(filename, type, price, available) {
        this.filename = filename;
        this.type = type;
        this.price = price;
        this.available = available;
    }
}

app.controller('offerController', function ($scope, $http) {
    $scope.offers = [];
    $scope.offersShown = [];
    $scope.colorMapping = {
        "video": "primary",
        "image": "success",
        "music": "info",
        "text": "warning"
    };
    $scope.iconMapping = {
        "video": "video",
        "image": "image",
        "music": "audio",
        "text": "alt"
    };

    $scope.searchtext = "";

    $scope.search = function () {
        $scope.searchByRegex($scope.searchtext);
    };

    $scope.searchByRegex = function (regex) {
        $scope.offersShown = [];

        if (regex.length == 0) {
            for (let i = 0; i < $scope.offers.length; i++)
                $scope.offersShown.push($scope.offers[i]);
        }
        else {
            var reg = new RegExp(regex);
            for (let i = 0; i < $scope.offers.length; i++)
                if ($scope.offers[i].filename.match(reg))
                    $scope.offersShown.push($scope.offers[i]);
        }
    };

    $scope.loggedIn = document.getElementById("username").value.length > 0;
    $scope.username = document.getElementById("username").value;

    $scope.offers.push(new Offer("sarah-cums_hard (1).mp4", "video", 5000, true));
    $scope.offers.push(new Offer("sarah-cums_hard (2).mp4", "video", 13000, true));
    $scope.offers.push(new Offer("alexander-drinks pisss.mp4", "video", 99, true));
    $scope.offers.push(new Offer("little_slut_in_pool.jpg", "image", 100000, true));
    $scope.offers.push(new Offer("cindy_crying_orgasm.mp3", "music", 28456, true));
    $scope.offers.push(new Offer("story_of_kelly.txt", "text", 100, true));
    $scope.offers.push(new Offer("story_of_mary.txt", "text", 100, true));
    $scope.offers.push(new Offer("story_of_christine.txt", "text", 100, true));
    $scope.offers.push(new Offer("sarah-cums_hard (3).mp4", "video", 5000, true));
    $scope.offers.push(new Offer("crazy adventure of sarah.mp4", "video", 85000, true));
    $scope.searchByRegex("");

    // $http({
    //     method: 'GET',
    //     url: 'http://www.google.com'
    // }).then(function successCallback(response) {
    //     console.log("done successfully.");
    // }, function errorCallback(response) {
    //     console.log("done errorously.");
    // });
});