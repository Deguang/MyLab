'use strict';

var exec = require('child_process').exec,  
    jsHint = require('jshint').JSHINT,
    fs = require('fs');

var content = fs.readFileSync('./.jshintrc','utf-8'),  
    content = JSON.parse(content);

var pass = 0;

exec('git diff HEAD --name-only --diff-filter=ACMR -- static/mobile/**.js',(error, stdout, stderr) => {  
    if(stdout.length){
        var array = stdout.split('\n');
        array.pop();
        array.forEach((path) => {
            jsHint(fs.readFileSync(path,'utf-8'),content,content.globals);
            jsHint.errors.forEach((o) => {
                console.log(path + ': line ' +o.line + ', col ' + o.character + ', ' + o.reason);
                pass = 1;
            });
        });
        process.exit(pass);
    }
    if (error !== null) {
        console.log('exec error: ' + error);
    }
});
