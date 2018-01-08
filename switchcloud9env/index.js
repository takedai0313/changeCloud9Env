'use strict';

const fs = require("fs")
const AWS = require('aws-sdk');
const cloud9 = new AWS.Cloud9({
    apiVersion: '2017-09-23',
    region: 'ap-southeast-1'
});

AWS.config.loadFromPath('./configure.json');

exports.handler = (event, context, callback) => {
    const env = JSON.parse(fs.readFileSync(process.env.cloud9Env, 'utf8'));
    const envList = env.envList;
    const accountNo = env.accountNo;
    const lang = event.lang;
    
    Object.keys(envList).forEach((key) => {
        if(lang === key){
            const inputparm = {
                environmentId: `${envList[key]}`,
                permissions: 'read-write',
                userArn: `arn:aws:iam::${accountNo}:user/${event.name}`
            };
            cloud9.createEnvironmentMembership(inputparm, (err, data) => {
               // ユーザの有無に関わらず登録(既にいるならエラーになるだけ)
               if (err) console.log(err, err.stack);
               else     console.log("success to create membership"); 
            });
        }else{
            const inputparm = {
                environmentId: `${envList[key]}`,
                userArn: `arn:aws:iam::${accountNo}:user/${event.name}`
            };
            cloud9.deleteEnvironmentMembership(inputparm, (err, data) => {
                // ユーザの有無に関わらずメンバシップ削除(いないならエラーになるだけ)
               if (err) console.log(err, err.stack);
               else     console.log("success to delete membership");
            });
        }
    });
    callback(null);
};