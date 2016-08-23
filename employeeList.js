define(['jquery', 'dataTable','popWin','base','verify','form','datepicker', 'datepicker-zh'], function($) {

    var getRegularHtml = $("#employee-getRegular-win").html();
    $("#employee-getRegular-win").html("").remove();

    var jobTransferHtml = $("#employee-jobTransfer-win").html();
    $("#employee-jobTransfer-win").html("").remove();

    var dismissionHtml = $("#employee-dismission-win").html();
    $("#employee-dismission-win").html("").remove();

    var winH = $(window).height();

                

    /*在职员工列表*/
    function initEmployeeList(ajaxData){
        if(!ajaxData){
            ajaxData = {'status': 0};
        }
        var regularEmp = $('.on-employee-list').DataTable({
            // "scrollY": winH/4*3,
            "scrollX": true,
            "scrollCollapse": true,
            "aLengthMenu": [30],
            "bPaginate":true,
            "iDisplayLength": 10,
            "language": {
                sProcessing: false,
                sLengthMenu: "显示 _MENU_ 项结果",
                sZeroRecords: "没有匹配结果",
                //sInfo: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                sInfo: false,
                //sInfoEmpty: "显示第 0 至 0 项结果，共 0 项",
                sInfoEmpty: '',
                //sInfoFiltered: "(由 _MAX_ 项结果过滤)",
                sInfoFiltered: '',
                sInfoPostFix: "",
                sSearch: "",
                sUrl: "",
                sEmptyTable: "该操作记录表为空",
                sLoadingRecords: "载入中...",
                sInfoThousands: ",",
                oPaginate: {
                    sFirst: "首页",
                    sPrevious: "上页",
                    sNext: "下页",
                    sLast: "末页"
                },
                oAria: {
                    sSortAscending: ": asc",
                    sSortDescending: ": desc"
                }
            },
            "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 9 ] }],

            searching: true,
            ordering:  true,
            "order": [[7, 'asc']],
            "processing": true,
            "serverSide": true,
            "bAutoWidth": true,
            "ajax": {
                "url": "/employee/ajax-get-employee-list.html",
                "type": "post",
                "data": ajaxData,
            },

            "columns": [
                {"data": 'employee_id'},
                {"data": 'name'},
                {"data": 'mobile'},
                {"data": 'job_number'},
                {"data": 'gender_desc',
                    "render" : function(data,type,row,full){
                        var html = "";
                        if(row.gender == 1){
                            html = '<span class="gender male">男</span>';
                        }else if(row.gender == 2){
                            html = '<span class="gender female">女</span>';
                        }
                        return html
                    }
                },
                {"data": 'hire_type_desc'},
                {"data": 'department_name'},
                {"data": 'entry_date'},
                { "data": 'account_status',
                    "render": function(data,type,row,full){
                        var html = "";
                        if(data == '0'){
                            html = '<p class="switchBtn employeeSwitchBtn active" data-status="0"><span></span></p>';

                        }else if(data == '1'){
                            html = '<p class="switchBtn employeeSwitchBtn" data-status="1"><span></span></p>';
                        }else {
                            html = '<p><span>未绑定</span></p>';
                        }
                        return html;
                    }
                },
                { "data": "employee_id",
                    "render": function(data,type,row,full){
                        var html = "<div class='moseoverOperationShow'>"
                            + "<span class='emptyBtn emptyBtn-point'><i class='icon icon-operation'></i>"
                            + "</span>"
                            + "<span class='employee-operation'>"
                        if(row.hire_type == 0 && !row.regular_lock_status && !row.has_regular_approval){
                                html += '<a href="javascript:;" class="getRegularBtn"  >'
                                     + "转正"
                                     + '</a>';
                        }
                        html += '<a href="javascript:;" class="jobTransforBtn" >调岗</a>';

                        html += '<a href="javascript:;" class="dismissionBtn" >离职</a>';

                        html += '<a href="javascript:;" class="delEmployeeBtn" >删除</a></span></div>';

                        return html;
                    }
                },
            ],

            "createdRow": function (row, data, index) {
                var api  = this.api();
                $('td', row).eq(0).html('<span>' + ((api.page() * 10 ) + index + 1) + '</span>');
                //每行 保存employee_id 到第一列data属性中
                $('td', row).eq(1).html('<span style="display: table-row-group;" data-employee="' + data.employee_id + '" data-department="' + data.department_id + '" data-hire="' + data.hire_type + '" data-enterDate="' + data.entry_date + '">' + data.name + '</span>');
            },
            "drawCallback": function( settings ) {
                $('.for-float').html();
                var api = this.api();
                if(api.rows( {page:'current'} ).data().length===0){
                    $(".dataTables_empty").attr("colspan","10");
                    //隐藏分页栏
                    $('#DataTables_Table_0_paginate').hide();
                }else{

                    //显示分页栏
                    $('#DataTables_Table_0_paginate').show();
                }
                $("#loadingList").hide();
                $("#EmployeeTableLoading").fadeIn(500);
            }
        });
        return regularEmp
    };
    var dataEmployee = null;
    $(document).on('mouseleave','.moseoverOperationShow,.employee-operation',function(e){

        $('.for-float').children('.employee-operation').hide();
        if($('#EmployeeTableLoading tbody tr').length < 6){
            $('.employee-operation').hide();
        }
        $('.emptyBtn-point-pseudo').removeClass('emptyBtn-point-pseudo');
        $('.trShin').removeClass('trShin')
    });
    $(document).on('mouseenter','.employee-operation',function(e){
        $('[data-employee-specil = '+dataEmployee+']').eq(0).show();

        $('[data-employee = '+dataEmployee+']').eq(1).addClass('emptyBtn-point-pseudo');

        $('[data-employee-specil = '+dataEmployee+']').find('a').addClass('aSkin')

        $('[data-employee = '+dataEmployee+']').parents('tr').addClass('trShin')

    });
    $(document).on('mouseenter','.moseoverOperationShow',function(){

        $('.on-employee-list').css('overflow','hidden');
        $(this).find('.emptyBtn-point').addClass('emptyBtn-point-pseudo');


        if($(this).find('.employee-operation').length > 0){
            if(!!window.ActiveXObject || "ActiveXObject" in window){
                $(this).find('.employee-operation').css('top','-8px');
                if($(this).parents('tr').find('td').eq(0).find('span').text()%10 == 8){
                    $(this).find('.employee-operation').css('top','-58px');
                }
            }
            var outBox = $('.dataTables_wrapper');
            var operation = $(this).find('.employee-operation');
            var operationNum = operation.offset().top + operation.height();
            if(navigator.userAgent.indexOf("Firefox")>0){
                var operationNum = operation.offset().top + operation.height() + 100;
            }
            var outBoxNum = outBox.offset().top + outBox.height();
            //获取到每行的主要数据
            var dataMine = $(this).parents('tr').find('td').eq(1).find('span');
            dataEmployee = dataMine.attr('data-employee');
            var dataDepartment = dataMine.attr('data-department');
            var dataHire = dataMine.attr('data-hire');
            var dataEnterdate = dataMine.attr('data-enterdate');
            var employeeName = $(this).parents('td').siblings('td').eq(1).find('span').html();
            var employeeMobile = $(this).parents('td').siblings('td').eq(2).html();

            //将主要数据放进浮层里
            $(this).find('.emptyBtn-point').attr('data-employee',dataEmployee);

            operation.attr('data-mobile',employeeMobile);
            operation.attr('data-employee-name',employeeName);
            operation.attr('data-employee-specil',dataEmployee);
            operation.attr('data-department',dataDepartment);
            operation.attr('data-hire',dataHire);
            operation.attr('data-enterdate',dataEnterdate);

            var jobTransforBtn = $(this).find('.jobTransforBtn');
            var delEmployeeBtn = $(this).find('.delEmployeeBtn');


            var num = operationNum - outBoxNum + 85

            if(navigator.userAgent.indexOf("Firefox")>0){
               $('.moseoverOperationShow .employee-operation').css('top','7px')
            }

            if(operation.height() < $('#EmployeeTableLoading tbody').height() && outBoxNum < operationNum && $('#EmployeeTableLoading tbody tr').length > 5){

                operation.css('top','-130px');
                if($(this).find('.employee-operation a').length == 4){
                    operation.css('top','-177px');
                }
                if(navigator.userAgent.indexOf("Firefox")>0){
                    operation.css('top','-96px');
                    if($(this).find('.employee-operation a').length == 4){
                        operation.css('top','-130px');
                    }
                }
                if(!!window.ActiveXObject || "ActiveXObject" in window){

                    operation.css('top','-116px');
                    if($(this).find('.employee-operation a').length == 4){
                        operation.css('top','-151px');
                    }
                }
            }
        }
        $('.on-employee-list').css('overflow','visible');

        var trLength = $('#EmployeeTableLoading tbody tr').length
        if (trLength < 6){
            dataEmployee = $(this).find('.emptyBtn-point').attr('data-employee');
            $('.employee-operation').hide();
            if(operation){
                operation.addClass('toHeader')
            }
            if($('[data-employee-specil = '+dataEmployee+']').length < 3){
                $('.for-float').append(operation);
            }
            $('.employee-operation').hide();
            $('[data-employee-specil = '+dataEmployee+']').eq(0).show();
            var leftNum = $('.emptyBtn-point').offset().left - $('.for-float').offset().left - 48;
            $('.for-float').children('.employee-operation').css({
                'right': 'initial',
                'left': leftNum + 'px',
                'top': '117px',
                'bottom': 'initial'
            });
            var numLine = $(this).parents('tr').find('td').eq(0).find('span').text()%10;
            if(numLine == 5 || numLine == 4){
                $('.for-float').children('.employee-operation').css({
                    'top': '187px',
                });
            }
            $('.for-float').children('.employee-operation').find('a').css({
                'display': 'block',
                'padding': '10px'
            });

        }


    });
    /* 离职员工列表 初始化 */
    function initDismissList(ajaxData){

        if(!ajaxData){
            ajaxData = {'status': 1};
        }
        var dismissEmp = $('.dismiss-employee-list').DataTable({
            // "scrollY": winH,
            "scrollCollapse": true,
            "aLengthMenu": [30],
            "bPaginate":true,
            "iDisplayLength": 10,
            "language": {
                sProcessing: false,
                sLengthMenu: "显示 _MENU_ 项结果",
                sZeroRecords: "没有匹配结果",
                //sInfo: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                sInfo: false,
                //sInfoEmpty: "显示第 0 至 0 项结果，共 0 项",
                sInfoEmpty: '',
                //sInfoFiltered: "(由 _MAX_ 项结果过滤)",
                sInfoFiltered: '',
                sInfoPostFix: "",
                sSearch: "",
                sUrl: "",
                sEmptyTable: "该操作记录表为空",
                sLoadingRecords: "载入中...",
                sInfoThousands: ",",
                oPaginate: {
                    sFirst: "首页",
                    sPrevious: "上页",
                    sNext: "下页",
                    sLast: "末页"
                },
                oAria: {
                    sSortAscending: ": asc",
                    sSortDescending: ": desc"
                }
            },
            searching: true,
            ordering:  true,
            "order": [[8, 'desc']],
            "processing": true,
            "serverSide": true,
            "bAutoWidth": true,
            "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 9 ] }],

            "ajax": {
                "url": "/employee/ajax-get-employee-list.html",
                "type": "post",
                "data": ajaxData
            },

            "columns": [
                {"data": 'employee_id'},
                {"data": 'name'},
                {"data": 'mobile'},
                {"data": 'job_number'},
                {"data": 'gender_desc',
                    "render" : function(data,type,row,full){
                        var html = "";
                        if(row.gender == 1){
                            html = '<span class="gender male">男</span>';
                        }else if(row.gender == 2){
                            html = '<span class="gender female">女</span>';
                        }
                        return html
                    }
                },
                {"data": 'hire_type_desc'},
                {"data": 'department_name'},
                {"data": 'entry_date'},
                { "data": 'dismission_date'},
                { "data": "employee_id",
                    "render": function(data,type,row,full){
                        return '<i class="icon icon-close delEmployeeBtn" title="删除"></i>';
                    }
                },
            ],

            "createdRow": function (row, data, index) {
                var api = this.api();
                $('td', row).eq(0).html('<span>' + ((api.page() * 10) + index + 1) + '</span>');
                //每行 保存employee_id 到第一列data属性中
                $('td', row).eq(1).html('<span data-employee="' + data.employee_id + '" data-department="' + data.department_id + '" data-hire="' + data.hire_type + '">' + data.name + '</span>');
            },
            "drawCallback": function( settings ) {
                var api = this.api();
                if(api.rows( {page:'current'} ).data().length===0){
                    $(".dataTables_empty").attr("colspan","8");
                    //隐藏分页栏
                    $('#DataTables_Table_0_paginate').hide();
                }else{

                    //显示分页栏
                    $('#DataTables_Table_0_paginate').show();
                }
                $("#loadingList").hide();
                $("#EmployeeTableLoading").fadeIn(500);
            }
        });
        return dismissEmp;
    }


    /*在职员工筛选*/
    //var reqularTab = initEmployeeList();

    /*离职员工筛选*/
    //var dismissTab = initDismissList({status:1});

    //var accountStatus =  GetQueryString(status);

    var accountStatus = $('#currentHireType').attr('data-hire');
    //目标列表
    var targetTab = accountStatus == 0 ? initEmployeeList() : initDismissList({status:1});

    //单个关键词搜索
    $(document).on('keydown',".keywordSearchInput", function (e) {
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13) {
            //回车执行查询
            targetTab.search($(this).val()).draw();
        }
    });
    $(document).on('blur',".keywordSearchInput", function (e) {
        if(!$(this).val()){
            $(this).hide();
            $(this).parent().siblings('.icon-search').show();
        }
    });
    $(document).on('click', '.keyword-search .icon-search', function () {
        // 当点击搜索icon时，光标定位到搜索input中
        $(this).parent().addClass('active').find('.keywordSearchInput').show().focus();
    });

    $(document).on('keyup', ".keywordSearchInput", function (e) {
        if($(this).val().length > 0) {
            $(this).siblings('i.icon-close').show();
        } else {
            $(this).siblings('i.icon-close').hide();
        }
    });
    $(document).on('click', '.input-container .icon-close', function () {
        // 刷新表格内容，显示全部数据
        targetTab.search('').draw();
        // 清空搜索框内容，并隐藏搜索框
        $(this).hide().parent().find('.keywordSearchInput').val('').blur();
    });

    /*漏斗筛选搜索按钮*/
    $(document).on('click','.multiple-search-btn',function(){
        if($('.keyword-search .keywordSearchInput').val()) {
            $('.keyword-search .input-container .keywordSearchInput').val('').hide();
            $('.keyword-search .icon-close').hide();
            $('.keyword-search .icon-search').show();
            //$('.keyword-search .input-container .icon-close').click();
        }

        var parentBox = $(this).parents(".searchDropdown");
        parentBox.fadeOut(500);
        parentBox.find('.search-option').hide();

        var result='filter:';
        result += 'gender='+get_data_search("gender")+'&hire_type='+get_data_search("hire_type")+'&department_id='+get_data_search("department_id")+'&account_status='+get_data_search("account_status");
        targetTab.search(result).draw();
    });
    function get_data_search(dataSearch) {
        var valueStr = "";
        $("p[data-search='"+dataSearch+"']").find(".keywords").each(function(){
            if(valueStr.length > 0) {
                valueStr += ",";
            }
            valueStr += $(this).attr("data-key");
        });
        return valueStr;
    }
    //获取url参数
    function GetQueryString(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }


    //转正弹窗
    $(document).on('click','.getRegularBtn',function (ev) {
        window.event? window.event.cancelBubble = true : ev.stopPropagation();

        if($('#EmployeeTableLoading tbody tr').length < 6){
            var employeeId = $(this).parent().attr('data-employee-specil'),
                employeeName = $(this).parent().attr('data-employee-name');
        }else {
            var employeeId = $(this).parents('td').siblings('td').eq(1).find('span').data('employee'),
                employeeName = $(this).parents('td').siblings('td').eq(1).find('span').html();
        };

        var employeeGetRegular = new PopWin('getRegular-pop', employeeName+' - 转正', {
            'bottomBtn': {
                'saveRegularChange confirm': '提交审批',
                'cancel': '关闭'
            }
        });

        var enterDate = '';
        var flowSetting = '';

        $.ajax({
            url: '/employee/ajax-get-regular-change.html',
            type: 'GET',
            data: {
                'employee_id': employeeId
            },
            success: function (reply) {

                if (!reply.status) {
                    remind('error', reply.message);
                    return
                }

                employeeGetRegular.appendDom(getRegularHtml);

                var getRegularData = reply.data;

                //设置 入职日期
                $("#entry_date").text(getRegularData.entry_date);

                //设置 转正日期
                var regularDate = getRegularData.regular_date ? getRegularData.regular_date : '';
                $('#regular_date').val(regularDate).attr('regularDate',regularDate);

                /*汇报对象,设置除了本人以外*/
                $('#director_name').attr('exclude',employeeId);

                flowSetting = getRegularData.flow_setting.status;

                /*审批开启状态  0 为未开通*/
                if(getRegularData.flow_setting.status == "disabled"){   //未开启审批流程,不显示审批人行
                    $("#approver_id").parents('.rows').remove();
                }else if(getRegularData.flow_setting.status == "ok"){   //开启了审批流,并设置了审批人
                    var approver = getRegularData.flow_setting.approver;
                   $("#approver_id").text(approver.name).attr("approver_id",approver.employee_id);
                }else if(getRegularData.flow_setting.status == "notset"){  //开启了审批流,未设置审批人
                    //调岗审批人报错
                    var $tDom = $('#approver_id')
                    showError($tDom,'noApprovalPerson','审批人不存在，请联系相关管理员重新设置审批人后再试');
                    function showError(thisDom,type,text){
                        clearError(thisDom,type);
                        var tDom = $(thisDom);
                        var grandFaDom = tDom.parent('.rows');
                        tDom.addClass('has-error-input');
                        grandFaDom.addClass('has-error');

                        if(tDom.find('.error').length == 0){
                            var error = $("<div class='error " + type + "'></div>");
                            error.text(text);
                            tDom.append(error)
                        }
                    }
                }

            }
        });

        employeeGetRegular.bindEvent(

            function(){


                reformDom("#employee-get-regular");

                $('#getRegular-pop .saveRegularChange').on('click',saveRegularInfo);

                function saveRegularInfo(){
                    var data = {
                            'employee_id':employeeId,
                            'entry_date': $('#entry_date').text(),
                            'regular_date':$('#regular_date').val(),
                            'regular_remark': $('#regular_remark').val()
                        };

                    if( flowSetting !== 'disabled'){
                        var approverId = $('#approver_id').attr('approver_id');
                        data = $.extend({'approver_id': approverId},data);
                    }

                    if(checkFormHasError("#getRegular-pop")){   //格式验证失败
                        return  false;
                    }


                    var t = $(this);
                    forbiddenResubmit.begin(t);
                    $.ajax({
                        url: '/employee/ajax-save-regular-change.html',
                        type: 'POST',
                        data:  data,
                        success: function (reply) {
                            forbiddenResubmit.end(t);

                            if (!reply.status) {
                                if(reply.data && reply.data.errors){
                                    var errorData = reply.data.errors
                                    for(var key in errorData){
                                        remind('error', errorData[key]);
                                        break;
                                    }
                                }else{
                                    remind('error', reply.message);
                                }
                                return
                            }
                            remind('success', '转正申请提交成功!');
                            targetTab.draw(false);
                            employeeGetRegular.rmThis();
                            $('.for-float').html('');
                        }
                    });
                }
            }
        )
        return false;
    });




    //调岗审批人html
    var approverHtml = [
        '<div class="rows">',
        '<label class="form-label">调岗审批人</label>',
        '<div class="input-box" id="approver_id" approver_id="@(approver_id)">',
            '@(approver_name)',
        '</div>',
        '</div>'
    ].join("")



    /*调岗弹窗*/
    $(document).on('click','.jobTransforBtn',function (ev) {

        if($('#EmployeeTableLoading tbody tr').length < 6){
            var employeeId = $(this).parents().attr('data-employee-specil'),
                employeeName = $(this).parents().attr('data-employee-name'),
                enterDate = $(this).parents().attr('data-enterdate');
        }else {
            var employeeId = $(this).parents('td').siblings('td').eq(1).find('span').data('employee'),
                employeeName = $(this).parents('td').siblings('td').eq(1).find('span').html(),
                enterDate = $(this).parents('td').siblings('td').eq(1).find('span').attr('data-enterDate');
        };

        var employeeJobTransfer = new PopWin('jobTransfer-pop', employeeName+' - 调岗', {
            'bottomBtn': {
                'saveJobTransfer confirm': '提交审批',
                'cancel': '关闭'
            }
        });


        var flowSetting = '';


        $.ajax({
            url: '/employee/ajax-get-job-transfer.html',
            type: 'GET',
            data: {
                'employee_id': employeeId
            },
            success: function (reply) {
                if (!reply.status) {
                    remind('error', reply.message);
                    return
                }
                var getSuccessData = reply.data;

                /*审批开启状态  0 为未开通*/
                var hasApproverHtml = getSuccessData.flow_setting.status == 'disabled' ? '' : formString(approverHtml,{
                    'approver_name' :  getSuccessData.flow_setting.status == "ok" ? getSuccessData.flow_setting.approver.name : '',
                    'approver_id' : getSuccessData.flow_setting.status == "ok" ? getSuccessData.flow_setting.approver.employee_id : '',
                })

                //数据清洗下
                var tmpdata = {};
                for(var key in reply.data){
                    tmpdata[key] = reply.data[key] ? reply.data[key] : '';
                }
                tmpdata['hasApproverHtml'] = hasApproverHtml;
                tmpdata['enterDate'] = enterDate;
                var tmpHtml = formString(jobTransferHtml, tmpdata);
                employeeJobTransfer.appendDom(tmpHtml);

                employeeJobTransfer.bindEvent(
                    function(){

                        reformDom("#jobTransfer-pop");

                        //调岗审批人报错
                        if(getSuccessData.flow_setting.status == 'notset'){
                            var $tDom = $('#approver_id')
                            showError($tDom,'noApprovalPerson','审批人不存在,请联系相关管理员重新设置审批人后再试');
                            function showError(thisDom,type,text){
                                clearError(thisDom,type);
                                var tDom = $(thisDom);
                                var grandFaDom = tDom.parent('.rows');
                                tDom.addClass('has-error-input');
                                grandFaDom.addClass('has-error');

                                if(tDom.find('.error').length == 0){
                                    var error = $("<div class='error " + type + "'></div>");
                                    error.text(text);
                                    tDom.append(error)
                                }
                            }
                        }

                        //联想输入
                        lenovoDepartment('.department-lenovo')
                        //lenovoInputGetAll('.department-lenovo','/company/ajax-get-departments.html');
                        lenovoInput('.director-lenovo','/employee/ajax-search-employee.html',employeeId);

                        $('#jobTransfer-pop .saveJobTransfer').on('click',saveJobTransferInfo);

                        function saveJobTransferInfo(){
                            var t = this;

                            var data = {
                                'employee_id':employeeId,
                                'title':$('#title').val(),
                                'department_id': $('#department_name').attr('department_id'),
                                'rank' : $('#rank').val(),
                                'director_id': $('#director_name').attr('director_id'),
                                'transfer_date': $('#transfer_date').val(),
                                'reason': $('#reason').val()
                            };

                            if(flowSetting !== 'disabled'){
                                var approverId = $('#approver_id').attr('approver_id');
                                data = $.extend({'approver_id': approverId},data);
                            }

                            if(checkFormHasError("#jobTransfer-pop")){   //格式验证失败
                                return  false;
                            }

                            forbiddenResubmit.begin(t);



                            $.ajax({
                                url: '/employee/ajax-save-job-transfer.html',
                                type: 'POST',
                                data:  data,
                                success: function (reply) {
                                    forbiddenResubmit.end(t);


                                    if (!reply.status) {
                                        if(reply.data && reply.data.errors){
                                            var errorData = reply.data.errors
                                            for(var key in errorData){
                                                remind('error', errorData[key]);
                                                break;
                                            }
                                        }else{
                                            remind('error', reply.message);
                                        }
                                        return
                                    }
                                    var getRegularData = reply.data;
                                    remind('success', '调岗申请提交成功!',function(){
                                        //location.reload()
                                        targetTab.draw(false)
                                    });
                                    $('.for-float').html('');
                                    employeeJobTransfer.rmThis();

                                }
                            });
                        };

                    }
                )
            }
        });

        return false;
    });


    /*离职弹窗*/
    $(document).on('click','.dismissionBtn',function (ev) {
        window.event? window.event.cancelBubble = true : ev.stopPropagation();
        if($('#EmployeeTableLoading tbody tr').length < 6){
            var employeeId = $(this).parents().attr('data-employee-specil'),
                employeeName = $(this).parents().attr('data-employee-name'),
                employeeHireType = $(this).parents().attr('data-hire'),
                enterDate = $(this).parents().attr('data-enterdate');
        }else {
            var employeeId = $(this).parents('td').siblings('td').eq(1).find('span').data('employee'),
                employeeName = $(this).parents('td').siblings('td').eq(1).find('span').html(),
                enterDate = $(this).parents('td').siblings('td').eq(1).find('span').attr('data-enterDate'),
                employeeHireType = $(this).parents('td').siblings('td').eq(1).find('span').attr('data-hire');
        }


        var employeeDismission = new PopWin('dismission-pop', employeeName+' - 离职', {
            'bottomBtn': {
                'saveDismission confirm': '确定离职',
                'cancel': '关闭'
            }
        });

        employeeDismission.appendDom(dismissionHtml);

        //给离职时间加上入职时间属性
        $('#dismission_date').attr('enterDate',enterDate);

        //劳务员工不显示 社保公积金减员月
        if(employeeHireType == 1){
            $("#insurance_sub").parents('.rows').remove();
            $("#house_fund_sub").parents('.rows').remove();
        }

        employeeDismission.bindEvent(
            function(){

                reformDom("#dismission-pop");

                $('#dismission-pop .saveDismission').on('click',saveDismissionInfo);

                function saveDismissionInfo(){
                    var data = {
                        'employee_id':employeeId,
                        'dismission_type': $('#dismission_type').val(),
                        'dismission_date': $('#dismission_date').val(),
                        'more_compensation': $('#more_compensation').val(),
                        'more_notice': $('#more_notice').val(),
                        'insurance_sub': $('#insurance_sub').val(),
                    };
                    /*正式员工离职 再获取社保公积金减员*/
                    if(employeeHireType == 0){
                        data.house_fund_sub = $('#house_fund_sub').val();
                        data.dismission_reason = $('#dismission_reason').val();
                    }

                    if(checkFormHasError("#dismission-pop")){   //格式验证失败
                        return  false;
                    }

                    var t = $(this);
                    forbiddenResubmit.begin(t)

                    $.ajax({
                        url: '/employee/ajax-save-dismission.html',
                        type: 'POST',
                        data:  data,
                        success: function (reply) {
                            forbiddenResubmit.end(t);

                            if (!reply.status) {
                                if(reply.data && reply.data.errors){
                                    var errorData = reply.data.errors
                                    for(var key in errorData){
                                        remind('error', errorData[key]);
                                        break;
                                    }
                                }else{
                                    remind('error', reply.message);
                                }
                                return
                            }
                            var getRegularData = reply.data;
                            remind('success', '员工离职成功!');
                            //targetTab.draw(false);
                            employeeDismission.rmThis();
                            location.href = location.href;
                            $('.for-float').html('');
                        }
                    });
                };

            }
        )
        return false;
    });

    /*员工删除*/
    $(document).on('click','.datatable .delEmployeeBtn,.for-float .delEmployeeBtn',function(){

        /*在职员工列表*/
        if ($('#EmployeeTableLoading tbody tr').length < 6) {
            var employeeId = $(this).parent().attr('data-employee-specil'),
                employeeMobile = $(this).parent().attr('data-mobile');
        } else {
            var employeeId = $(this).parents('td').siblings('td').eq(1).find('span').data('employee'),
                employeeMobile = $(this).parents('td').siblings('td').eq(2).text();
        }

        /*离职员工列表*/
        if($(this).parents(".datatable").hasClass("dismiss-employee-list")){
            var employeeId = $(this).parents('td').siblings('td').eq(1).find('span').data('employee'),
                employeeMobile = $(this).parents('td').siblings('td').eq(2).text();
        }


        var deleteDialog = new Dialog ('deleteEmployeeDialog','删除员工',{'width':'350px','bottomBtn':{'deleteEmployeeBtn confirm':'确定','cancel':'取消'}});

        var deleteHtml = '<p style="padding:0 10px; line-height: 30px; font-size: 14px;">本次操作将删除'+employeeMobile+'，删除后账号将不可恢复，您确认删除吗？</p>';
        deleteDialog.appendDom(deleteHtml);
        deleteDialog.bindEvent(function(){

            $('#deleteEmployeeDialog .deleteEmployeeBtn').on('click',deleteEmployeeFn);

            function deleteEmployeeFn(){
                var t = this;
                forbiddenResubmit.begin(t);

                $.ajax({
                    url: '/employee/ajax-delete-employee.html',
                    type: 'POST',
                    data:  {
                        'employee_id': employeeId
                    },
                    success: function (reply) {
                        //按钮的relive
                        forbiddenResubmit.end(t);
                        if (!reply.status) {
                            remind('error', reply.message);
                            return
                        }
                        deleteDialog.rmThis();
                        remind('success', '员工删除成功!');
                        location.reload();
                        $('.for-float').html('');
                        //targetTab.draw(false);

                    }
                });
            }


        });



        return false;
    });

    /*账号 批量开启|| 关闭*/
    $(document).on('click','.accountStatusBox p',function(ev){
        var targetStatus = $(this).find('a').attr('data-status');
        var this_ = this, ajaxUrl = '/employee/ajax-update-all-employee-account-status.html';
        var successTxt, alertTitle, alertHtml;

        if(targetStatus == 0) { // 批量启用
            alertTitle = '批量启用账号';
            alertHtml = '此操作将恢复所有员工的账号登录权限，您确认启用所有员工账号吗？';
            successTxt = '启用所有账号成功';
        } else {
            alertTitle = '批量停用账号';
            alertHtml = '此操作将使所有员工账号不能再登录，您确认停用所有员工账号吗？';
            successTxt = '停用所有账号成功';
        }

        SwitchAccountStatus(this_, alertTitle, alertHtml, true, ajaxUrl, targetStatus, null, successTxt);


    });

    /*账号 单个 开启|| 关闭*/
    /*<p class="switchBtn active" data-status="0"><span></span></p>*/
    $(document).on('click','.datatable .employeeSwitchBtn',function(){
        var employeeId = $(this).parent().siblings('td').eq(1).find('span').data('employee'),
            nowStatus = $(this).attr('data-status');
        var targetStatus, successTxt, alertTitle, alertHtml;
        var this_ = this, ajaxUrl = '/employee/ajax-update-employee-account-status.html';

        if(nowStatus == 1){
            alertTitle = '账号启用';
            alertHtml = '此操作将恢复该员工的账号登录权限，您确认启用该员工账号吗？';
            targetStatus = 0;
            successTxt = '启用账号成功';
        }else{
            alertTitle = '账号停用';
            alertHtml = '此操作将使该员工账号不能再登录，您确认停用该员工账号吗？';
            targetStatus = 1;
            successTxt = '停用账号成功';
        }
        SwitchAccountStatus(this_, alertTitle, alertHtml, false, ajaxUrl, targetStatus, employeeId, successTxt);

        return false;
    });


    /**
     * （单个/批量）账号 开启 || 关闭 的确认弹窗
     * <p class="switchBtn active" data-status="0"><span></span></p>
     * @param this_         switchBtn的控件本身
     * @param alertTitle    弹窗标题
     * @param alertStr      弹窗提醒内容
     * @param isBatch       是否批量操作
     * @param url           ajax发送POST请求地址
     * @param targetStatus  目标账号状态 0：开启  1：关闭
     * @param targetId      employee Id
     * @param successTxt    成功后的提醒文字
     * @constructor
     */
    function SwitchAccountStatus(this_, alertTitle, alertStr, isBatch, url, targetStatus, targetId, successTxt) {
        var confirmSwitchDialog = new Dialog('confirmSwitchDialog',alertTitle,{'width':'500','bottomBtn':{'confirmBtn confirm':'确定','cancel':'取消'}});
        var confirmHtml = '<p style="font-size: 14px; line-height: 21px; margin-left: 50px;">'+ alertStr +'</p>';

        var ajaxParams = {'status': targetStatus};
        if(!isBatch) {
            ajaxParams['employee_id'] = targetId;
            if(targetStatus == 1) {
                confirmHtml += '<p style="font-size: 14px; line-height: 21px; margin-left: 50px;">（您日后可以从员工列表里面重新启用该账号）</p>';
            }
        }
        confirmSwitchDialog.appendDom(confirmHtml);

        var isConfirm = false;
        confirmSwitchDialog.bindEvent(function () {
            $('#confirmSwitchDialog .confirmBtn').on('click', function () {
                var t = $(this);
                if(!isConfirm) {
                    isConfirm = true;
                    forbiddenResubmit.begin(t);
                    $.ajax({
                        url: url,
                        type: 'POST',
                        data: ajaxParams,
                        success: function (reply) {
                            forbiddenResubmit.end(t);
                            confirmSwitchDialog.rmThis();
                            if (!reply.status) {
                                remind('error', reply.message);
                                isConfirm = false;
                                return ;
                            }
                            if(!isBatch) {
                                if($(this_).hasClass('active')){
                                    $(this_).removeClass('active');
                                    $(this_).attr('data-status','1');
                                }else{
                                    $(this_).addClass('active');
                                    $(this_).attr('data-status','0');
                                }
                                remind('success', successTxt);
                            } else {
                                $(this_).parents('.accountStatusBox').fadeOut(200);
                                remind('success', successTxt );
                                targetTab.draw(false);
                                $('.datatable .switchBtn').each(function () {
                                    if(targetStatus == 0){//启用
                                        $(this).addClass('active').attr('data-status', '0');
                                    }else if(targetStatus == 1){//关闭
                                        $(this).removeClass('active').attr('data-status', '1');
                                    }
                                });
                            }
                        }
                    });
                }
            })
        })
    }

    return {'targetTab':targetTab};
})

