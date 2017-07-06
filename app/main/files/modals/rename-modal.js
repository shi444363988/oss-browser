angular.module('web')
  .controller('renameModalCtrl', ['$scope','$uibModalInstance','$uibModal','item','currentInfo', 'callback','ossSvs2','Dialog','Toast',
    function ($scope, $modalInstance, $modal, item, currentInfo, callback, ossSvs2, Dialog, Toast) {


      angular.extend($scope, {
        currentInfo: currentInfo,
        item: item,
        keep: {
          name: item.name
        },
        cancel: cancel,
        onSubmit: onSubmit,
        reg: {
          folderName: /^[^\/]+$/
        },
        isLoading: false
      });

      function cancel() {
        $modalInstance.dismiss('close');
      }

      function onSubmit(form) {
        if (!form.$valid)return;

        if($scope.item.isFolder){
          var newPath = currentInfo.key==''?item.name: (currentInfo.key.replace(/(\/$)/,'') +'/' + item.name);
          newPath += '/';
          //console.log(item.path, newPath)
          if(item.path==newPath)return;

          $scope.isLoading=true;
          ossSvs2.checkFolderExists(currentInfo.region,currentInfo.bucket, newPath).then(function(has){
            if(has){
              Dialog.confirm('是否覆盖','已经有同名目录，是否覆盖?', function(b){
                if(b){
                  showMoveFolder(newPath);
                }else{
                  $scope.isLoading=false;
                }
              })
            }else{
              showMoveFolder(newPath);
            }
          }, function(err){
            $scope.isLoading=false;
          });
        }
        else{
          var newPath = currentInfo.key=='' ? item.name : (currentInfo.key.replace(/(\/$)/,'') +'/' + item.name);
          if(item.path==newPath)return;

          $scope.isLoading=true;

          ossSvs2.getFileInfo(currentInfo.region, currentInfo.bucket,newPath).then(function(data){
            Dialog.confirm('是否覆盖','已经有同名文件，是否覆盖?', function(b){
              if(b){
                renameFile(newPath);
              }else{
                $scope.isLoading=false;
              }
            })
          },function(err){
             renameFile(newPath);
          });
        }

      }
      function renameFile(newPath){
        Toast.info('正在重命名...');
        ossSvs2.moveFile(currentInfo.region, currentInfo.bucket, item.path, newPath).then(function(){
          Toast.success('重命名成功');
          $scope.isLoading=false;
          callback();
          cancel();
        }, function(){
          $scope.isLoading=false;
        });
      }

      function showMoveFolder(newPath){
        $modal.open({
          templateUrl: 'main/files/modals/move-modal.html',
          controller: 'moveModalCtrl',
          backdrop: 'static',
          resolve: {
            items: function () {
              return angular.copy([item]);
            },
            moveTo: function(){
              return angular.copy(currentInfo);
            },
            renamePath: function(){
              return newPath;
            },
            isCopy: function () {
              return false;
            },
            fromInfo: function () {
              return angular.copy(currentInfo);
            },
            callback: function () {
              return function () {
                Toast.success('重命名成功');
                $scope.isLoading=false;
                callback();
                cancel();
              };
            }
          }
        });
      }
    }])
;
