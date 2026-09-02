"use strict";
$(document).ready(function () {
    $(".newstick").easyTicker({
        direction: 'down',
        speed: 'slow',
        interval: 1500,
        height: '330',
        visible: 0,
        mousePause: 1
    });
    //      ===============================     Doughnut chart================================
    function  top_chart() {
        var echart2=echarts.init(document.getElementById('echart_pie2'));
        var option2 = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            toolbox: {
                show : true
            },
            calculable : true,
            color:['#937eff','#fcb410','#5aca82','#329cff','#f86a67'],
            series : [
                {
                    name:'Access source',
                    type:'pie',
                    radius : ['40%', '60%'],
                    itemStyle : {
                        normal : {
                            label : {
                                show : false
                            },
                            labelLine : {
                                show : false
                            }
                        },
                        emphasis : {
                            label : {
                                show : true,
                                position : 'center',
                                textStyle : {
                                    fontSize : '12',
                                    fontWeight : 'bold'
                                }
                            }
                        }
                    },
                    data:[
                        {value:335, name:'Jan'},
                        {value:310, name:'Feb'},
                        {value:234, name:'Mar'},
                        {value:135, name:'Apr'},
                        {value:1548, name:'May'}
                    ]
                }
            ]
        };
        echart2.setOption(option2);
    }
    $(".megamenu").on('click',function () {
        if($(this).hasClass('show')){
            top_chart();
        }
    });
    $(".mega_links a").on('mouseenter',function () {
        $(this).find('.ti-angle-right').css('padding-right','2px');
    }).on('mouseleave',function () {
        $(this).find('.ti-angle-right').css('padding-right','10px');
    })
});