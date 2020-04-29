angular.module("myApp", []).controller("MainController", ["$scope", "$timeout", function($scope, $timeout) {

    var vm = this;

    vm.isSignedIn = false;

    vm.initData = {
        wantSave: {col:1, row:15, value: 0},
        salary: {col:0, row:13, value: 0},
        food: {col:2, row:60, value: 0},
        home: {col:1, row:13, value: 0},
        other: {col:3, row:60, value:0},
        fun: {col:4, row:60, value:0},
        expensesSum: {col:6, row:1, value:0}
    };

    vm.formData = {
        wantSave: {address:"B16:B16", value: null},
        salary: {colId:0, colName:"A", address:"", value: null},
        food: {colId:2, colName:"C", address:"", value: null},
        home: {colId:1, colName:"B", address:"", value: null},
        other: {colId:3, colName:"D", address:"", value: null},
        fun: {colId:4, colName:"E", address:"", value: null},
        expensesSum: {colId:6, colName:"G", address:"", value: null}
    };

    const CLIENT_ID = "1065006613256-kq5d6m2ki006in7jgnatp1pr7b6fqejs.apps.googleusercontent.com",
        API_KEY = "AIzaSyCik-Ie_P1Xc8tFsotMZRWBmM4RVSloums",
        SPREADSHEETID = "1iRU0TSHetWU4dydr1WU63SWu-q9TB7rvAyniboSaOno",
        DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        SCOPES = "https://www.googleapis.com/auth/spreadsheets",
        FULL_TABLE_RANGE = "A1:G61";
        SHEET_NAME = "Arkusz1";

    vm.saveData = saveData;
    vm.handleAuthClick = handleAuthClick;
    vm.handleSignoutClick = handleSignoutClick;

    $timeout(function () {
        handleClientLoad();
    });

    function handleClientLoad() {
        gapi.load("client:auth2", initGoogleApiClient);
    }

    function initGoogleApiClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())

        }, function(error) {
            console.error(JSON.stringify(error, null, 2));
        });
    }

    function updateSigninStatus(value) {
        $scope.$apply(function() {
            vm.isSignedIn = value;

            if (value) {
                initData();
            }
        });
    }

    function handleAuthClick() {
        gapi.auth2.getAuthInstance().signIn();
    }

    function handleSignoutClick() {
        gapi.auth2.getAuthInstance().signOut();
    }

    function getDataByRange(range) {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEETID,
            range: SHEET_NAME + "!" + range,
        }).then(function(response) {
            console.log(response.result.values);
            mapToModel(response.result.values);
            setNextFreeCellAddress(response.result.values);
        }, function(response) {
            console.error("Error: " + response.result.error.message);
        });
    }

    function addDataInRange(body, range) {
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEETID,
            range: SHEET_NAME + "!" + range,
            valueInputOption: "USER_ENTERED",
            resource: body
        }).then((response) => {
            initData();
            console.log(response.result)
        });
    }

    function mapToModel(rawData) {
        $scope.$apply(function() {
            Object.keys(vm.initData).forEach(function(key) {
                vm.initData[key].value = rawData[vm.initData[key].row][vm.initData[key].col];
            });

            if (vm.initData.wantSave.value > 0) {
                vm.formData.wantSave.value = vm.initData.wantSave.value;
            }
        });
        console.log(vm.initData);
    }

    function setNextFreeCellAddress(rawData) {
        $scope.$apply(function() {
            Object.keys(vm.formData).forEach(function(key) {
                if (angular.isUndefined(vm.formData[key].colId) || angular.isUndefined(vm.formData[key].colName)) {
                    return;
                }
                var rowId = rawData.findIndex(function (value) {
                    return !value[vm.formData[key].colId];
                });
                rowId++;
                vm.formData[key].address = vm.formData[key].colName + rowId + ":" + vm.formData[key].colName + rowId
            });
        });
        console.log(vm.formData);
    }

    function initData() {
        getDataByRange(FULL_TABLE_RANGE);
    }

    function saveData() {
        Object.keys(vm.formData).forEach(function(key) {
            if (vm.formData[key].value) {
                console.log(vm.formData[key].value);
                addDataInRange({values: [[vm.formData[key].value]]}, vm.formData[key].address)
            }
        });
    }

}]);
