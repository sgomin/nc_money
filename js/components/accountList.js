angular.module('moneyApp')
.controller('accountListCtrl', function($scope, $filter, $route, $routeParams, AccountService) {
  var ctrl = this;

  ctrl.routeParams = $routeParams;

  ctrl.accounts = [];
  ctrl.show = true;
  ctrl.invalid = false;

  ctrl.loading = true;

  // Reflect account changes in accountList
  AccountService.registerObserverCallback(function(ev) {
      if (ev.event === 'delete') {
        if (ctrl.accounts.length === 1) {
          $route.updateParams({
            tid: $routeParams.tid,
            aid: undefined
          });
        } else {
          for (var i = 0, length = ctrl.accounts.length; i < length; i++) {
            if (ctrl.accounts[i].id === ev.account.id) {
              $route.updateParams({
                tid: $routeParams.tid,
                aid: (ctrl.accounts[i+1]) ? ctrl.accounts[i+1].id : ctrl.accounts[i-1].id
              });
              break;
            }
          }
        }
        for (var i = 0; i < ctrl.accounts.length; i++) {
          if (parseInt(ctrl.accounts[i].id) === parseInt(ev.account.id)) {
            ctrl.accounts.splice(i,1);
          }
        }
      } else if (ev.event === 'create') {
        ev.account.balance = 0;
        ctrl.accounts.push(ev.account);
        $route.updateParams({
          tid: $routeParams.tid,
          aid: ev.account.id
        });
      } else if (ev.event === 'update') {
        ctrl.newAccount = 0;
        ctrl.newAccount = ev.account;
        for (var i = 0; i < ctrl.accounts.length; i++) {
          if (ctrl.accounts[i].id === ev.account.id) {
            ctrl.newAccount.balance = ctrl.accounts[i].balance;
            ctrl.accounts[i] = ctrl.newAccount;
          }
        }
      }
  });

  // Get accounts
  AccountService.getAccounts().then(function(accounts) {
    if (accounts.length > 0) {
      //$scope.$apply(function() {
        ctrl.accounts = accounts;
        ctrl.loading = false;
      //});
    } else {
      ctrl.loading = false;
    }
  });

  // var unbindListWatch = $scope.$watch('ctrl.accountList', function() {
  //   if (ctrl.accountList && ctrl.accountList.length > 0) {
  //     if ($routeParams.aid && $routeParams.tid) {
  //       ctrl.accountList.forEach(function(account) {
  //         if(account.id === $routeParams.aid) {
  //           ctrl.setSelectedId($routeParams.aid);
  //           ctrl.loading = false;
  //         }
  //       });
  //     }
  //     if (ctrl.loading && $(window).width() > 768) {
  //       ctrl.setSelectedId(ctrl.accountList[0].id);
  //     }
  //     ctrl.loading = false;
  //     unbindListWatch();
  //   }
  // });

  // $scope.$watch('ctrl.routeParams.aid', function(newValue, oldValue) {
  //   if(typeof oldValue != 'undefined' && typeof newValue == 'undefined' && $(window).width() <= 768) {
  //     ctrl.show = true;
  //     return;
  //   }
  //   if (newValue === undefined) {
  //     if(ctrl.accountList && ctrl.accountList.length > 0) {
  //       $route.updateParams({
  //         tid: $routeParams.tid,
  //         aid: ctrl.accountList[0].id
  //       });
  //     } else {
  //       // watch for next accountList update
  //       // var unbindWatch = $scope.$watch('ctrl.accountList', function() {
  //         if (ctrl.accountList && ctrl.accountList.length > 0) {
  //           $route.updateParams({
  //             tid: $routeParams.tid,
  //             aid: ctrl.accountList[0].id
  //           });
  //         }
  //         // unbindWatch();
  //       // });
  //     }
  //   } else {
  //     ctrl.show = false;
  //   }
  // });

  // $scope.$watch('ctrl.routeParams.tid', function() {
  //   ctrl.accountList = [];
  //   if($(window).width() > 768) {
  //     // var unbindWatch = $scope.$watch('ctrl.accountList', function() {
  //       if (ctrl.accountList && ctrl.accountList.length > 0) {
  //         $route.updateParams({
  //           tid: $routeParams.tid,
  //           aid: ctrl.accountList[0].id
  //         });
  //       }
  //       // unbindWatch();
  //     // });
  //   }
  // });

  // $scope.$watch('ctrl.accountList[0].name', function(name) {
  //   ctrl.invalid = (name === '');
  // });

  ctrl.hasAccounts = function() {
    if (!ctrl.accounts) {
      return false;
    }
    return ctrl.contacts.length > 0;
  };

  ctrl.setSelectedId = function(accountId) {
    $route.updateParams({
      aid: accountId
    });
  };

  ctrl.getSelectedId = function() {
    return $routeParams.aid;
  };

});

angular.module('moneyApp')
.directive('accountList', function() {
  return {
    priority: 1,
    scope: {},
    controller: 'accountListCtrl',
    controllerAs: 'ctrl',
    bindToController: {

    },
    templateUrl: OC.linkTo('money', 'templates/accountList.html')
  };
});
