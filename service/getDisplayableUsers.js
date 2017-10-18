angular.module('UserStats').factory('UserList', function(){
    return {
        getUsers: function(currentUser,allUsers,successCallback,errorCallback){
            var access = allUsers[currentUser].access;
            var pool = allUsers[currentUser].pool;
            var returnUsers = {};

            if(access == "single"){
                returnUsers[currentUser] = allUsers[currentUser];
            }else if(access == "team"){
                $.each(allUsers, function(user, data) {
                    if(data.pool == pool){
                        returnUsers[user] = data;
                    }
                });
            }else{
                returnUsers = allUsers;
            }

            successCallback(returnUsers);
        }
    };
});