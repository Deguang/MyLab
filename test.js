funtion test1(num) {
    if(typeof num != 'Number') {
        return 0;
    }
    return num++;
}

test1(2);
test1('asd');
