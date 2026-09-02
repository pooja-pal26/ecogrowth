"use strict";
$(document).ready(function () {
    var countup_options = {
        useEasing: true,
        useGrouping: true,
        decimal: '.',
        prefix: '',
        suffix: ''
    };
    new CountUp("info5", 0, 546, 0, 2.5, countup_options).start();
    new CountUp("info6", 0, 599, 0, 2.5, countup_options).start();
    new CountUp("info7", 0, 254, 0, 2.5, countup_options).start();
    new CountUp("info8", 0, 198, 0, 2.5, countup_options).start();


//        =====================================    Data analysis=========================
    var echart;
    function echart_resize() {
        echart=echarts.init(document.getElementById('echart_line4'));
        var options = {
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['Intention','Pre order','Deal']
            },
            toolbox: {
                show : true
            },
            color:['#329cff','#fcb410','#937eff'],
            calculable : true,
            grid: {
                x: 40,
                x2:40
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name:'Intention',
                    type:'line',
                    smooth:true,
                    itemStyle: {normal: {areaStyle: {type: 'default'}}},
                    data:[10, 12, 21, 54, 260, 830, 710]
                },
                {
                    name:'Pre order',
                    type:'line',
                    smooth:true,
                    itemStyle: {normal: {areaStyle: {type: 'default'}}},
                    data:[30, 182, 434, 791, 390, 30, 10]
                },
                {
                    name:'Deal',
                    type:'line',
                    smooth:true,
                    itemStyle: {normal: {areaStyle: {type: 'default'}}},
                    data:[1320, 1132, 601, 234, 120, 90, 20]
                }
            ]
        };
        echart.setOption(options);
    }
    echart_resize();
    function chartInterval() {
        setTimeout(function () {
            echart.setOption({
                legend: {
                    data:['Pre order','Deal','Intention']
                },
                color:['#fcb410','#937eff','#329cff'],
                series: [{
                    name:'Pre order',
                    data:[50, 170, 400, 850, 300, 120, 40]
                },{
                    name:'Deal',
                    data:[1200, 1000, 550, 220, 110, 85, 30]
                },{
                    name:'Intention',
                    data:[20, 30, 40, 60, 240, 800, 650]
                }
                ]
            });
        },2000);
        setTimeout(function () {
            echart.setOption({
                legend: {
                    data:['Deal','Intention','Pre order']
                },
                color:['#937eff','#329cff','#fcb410'],
                series: [{
                    name:'Deal',
                    data:[1000, 1200, 700, 270, 150, 120, 50]
                },{
                    name:'Intention',
                    data:[30, 50, 65, 90, 200, 820, 950]
                },{
                    name:'Pre order',
                    data:[30, 182, 434, 791, 390, 30, 10]
                }
                ]
            });
        },4000);
        setTimeout(function () {
            echart.setOption({
                legend: {
                    data:['Intention','Pre order','Deal']
                },
                color:['#329cff','#fcb410','#937eff'],
                series: [{
                    name:'Intention',
                    data:[10, 12, 21, 54, 260, 830, 710]
                },{
                    name:'Pre order',
                    data:[30, 182, 434, 791, 390, 30, 10]
                },{
                    name:'Deal',
                    data:[1320, 1132, 601, 234, 120, 90, 20]
                }
                ]
            });
        },6000);
    }
    chartInterval();
    setInterval(function () {
        chartInterval();
    },6000);
//       ==========================     End data analysis===============================
    //    easy pie chart
    $('.easy_pie_chart1').easyPieChart({
        barColor: "#329cff",
        scaleColor: "#329cff"
    });
    $('.easy_pie_chart2').easyPieChart({
        barColor: "#f86a67",
        scaleColor: "#f86a67"
    });
    $('.easy_pie_chart3').easyPieChart({
        barColor: "#fcb410",
        scaleColor: "#fcb410"
    });
    $('.easy_pie_chart4').easyPieChart({
        barColor: "#937eff",
        scaleColor: "#937eff"
    });
    // end os easy pie chart

    $('.timeline_section').slimScroll({
        height: 280,
        size: '5px',
        color: '#ccc'
    });

    function barchart_resize() {

//        =======================gauge chart=======================

        var myChart = echarts.init(document.getElementById('echart_gauge'));
        var option3 = {
            tooltip: {
                formatter: "{a} <br/>{b} : {c}%"
            },
            toolbox: {
                show: false,
                feature: {
                    mark: {show: false},
                    restore: {show: false},
                    saveAsImage: {show: true}
                }
            },
            series: [
                {
                    name: 'Indicators',
                    type: 'gauge',
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            color: [[0.2, '#937eff'], [0.8, '#5aca82'], [1, '#f86a67']],
                            width: 10
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: 'auto'
                        }
                    },
                    splitLine: {
                        show: true,
                        length: 25,
                        lineStyle: {
                            color: '#d1e3ec'
                        }
                    },
                    pointer: {
                        width: 5
                    },
                    title: {
                        show: false,
                        offsetCenter: [0, '-40%'],
                        textStyle: {
                            fontWeight: 'bolder'
                        }
                    },
                    detail: {
                        offsetCenter: [0, '65%'],
                        formatter: '{value}%',
                        textStyle: {
                            color: 'auto',
                            fontSize: 20
                        }
                    },
                    data: [{value: 50, name: 'Indicators'}]
                }
            ]
        };

        clearInterval(timeTicket3);
        var timeTicket3 = setInterval(function () {
            option3.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
            myChart.setOption(option3, true);
        }, 2000);
        myChart.setOption(option3);
    }
    barchart_resize();
//        =========================end of gauge chart===========================

    // End of stacked area chart
    $(".sidebar-toggle").on("click",function () {
        setTimeout(function () {
            echart_resize();
            chartInterval();
            barchart_resize();
        });
    });
    $('.chart_full_screen').on('click', function() {
        $(".data_analysis").toggleClass("full_screen");
        echart_resize();
        chartInterval();
    });

    // ========================Market analysis=======================
    var data4 = [],
        totalPoints = 300;

    function getRandomData() {
        if (data4.length > 0)
            data4 = data4.slice(1);

        // do a random walk
        while (data4.length < totalPoints) {
            var prev = data4.length > 0 ? data4[data4.length - 1] : 50;
            var y = prev + Math.random() * 10 - 5;
            if (y < 0)
                y = 0;
            if (y > 100)
                y = 100;
            data4.push(y);
        }

        // zip the generated y values with the x values
        var res4 = [];
        for (var i = 0; i < data4.length; ++i)
            res4.push([i, data4[i]])
        return res4;
    }

    // up control widget
    var updateInterval = 50;

    // setup plot
    var options4 = {
        colors: ["#937eff"],
        series: {
            shadowSize: 0,
            lines: {
                show: true,
                fill: true,
                fillColor: {
                    colors: [{
                        opacity: 0.5
                    }, {
                        opacity: 0.5
                    }]
                }
            }
        },
        yaxis: {
            min: 0,
            max: 90
        },
        xaxis: {
            min:0,
            max:100
        },
        grid: {
            borderWidth: {
                top: 0,
                right: 0,
                bottom: 1,
                left: 1
            }
        }
    };

    var plot4 = $.plot($("#flot_chart4"), [getRandomData()], options4);

    function update() {
        plot4.setData([getRandomData()]);
        // since the axes don't change, we don't need to call plot.setupGrid()
        plot4.draw();
        setTimeout(update, updateInterval);
    }
    update();
    // ==================End of market analysis======================
});