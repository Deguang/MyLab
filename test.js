function test(num) {
    if(typeof num != 'Number') {
        return 0;
    }
    return num++;
}    
test('asd');
