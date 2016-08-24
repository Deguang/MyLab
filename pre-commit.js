var fs = require('fs'),
    readline = require('readline'),
    exec = require('child_process').exec;

// 获取本次提交文件列表，并对文件内容进行匹配判断
var processCode = 0,
    check = exec('git diff-index --cached --name-only HEAD', (error, stdout, stderr) => {

    if (error) {
        console.log(error.stack);
        console.log('`Error code: ' + error.code);
    }
    var files = stdout.split('\n').filter((i) => {
        if(i == '') {
            return ;
        }
        // 冲突判断
        var conflict = {
                count: 0,
                lineNum: []
            },
            lineNum = 0;
        var rl = readline.createInterface({
            input: fs.createReadStream(i, {encoding: 'utf8'}),
            output: null
        });
        rl.on('line', (line) => {
            lineNum ++;
            if(line.indexOf('<<<<<<< HEAD') != '-1') {
                conflict.count ++;
                conflict.lineNum.push(lineNum);
            }
        })
        rl.on('close', function(){
            if(!!conflict.count) {
                console.error('[Error] ' + i + ' has ' + conflict.count + ' unsolved conflict, fobidden commit!');
                console.error('        conflict line num: ' + conflict.lineNum.join(','));
            }
        })

        // scss编译结果验证
        if(i.split('.')[1] == 'css') {
            var content = fs.readFileSync(i, 'utf8');
            if(content.indexOf('body:before') != '-1') {
                console.log('[Error] ' + i.split('.')[0] + '.scss compile error, fobidden commit!');
            }
        }
        return ;
    })
});

check.then(process.exit(processCode));

