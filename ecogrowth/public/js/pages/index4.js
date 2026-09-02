"use strict";
$(document).ready(function () {
    var options = {
        useEasing: true,
        useGrouping: true,
        decimal: '.',
        prefix: '',
        suffix: ''
    };
    new CountUp("orders", 0, 250, 0, 2.5, options).start();
    new CountUp("comments", 0, 179, 0, 2.5, options).start();
    new CountUp("visitors", 0, 500, 0, 2.5, options).start();
    new CountUp("register", 0, 600, 0, 2.5, options).start();
    $(".flip_effect1,.flip_effect3").flip({
        axis: 'y',
        trigger: 'hover'
    });
    $(".flip_effect2,.flip_effect4").flip({
        axis: 'x',
        trigger: 'hover'
    });
    var orders_chart = $('.orders_chart');
    var barParentdiv1 = orders_chart.closest('div');
    var barCount1 = [209, 210, 209, 210, 210, 211, 212, 210, 210, 211];
    var barSpacing1 = 2;
    orders_chart.sparkline(barCount1, {
        type: 'bar',
        barWidth: (barParentdiv1.width() - (barCount1.length * barSpacing1)) / barCount1.length,
        height: '40',
        width: '100%',
        barSpacing: barSpacing1,
        barColor: '#329cff'
    });
    var comments_chart = $(".comments_chart");
    var barParentdiv2 = comments_chart.closest('div');
    var barCount2 = [211, 210, 209, 210, 210, 211, 212, 210, 210, 211];
    var barSpacing2 = 2;
    comments_chart.sparkline(barCount2, {
        type: 'bar',
        barWidth: (barParentdiv2.width() - (barCount2.length * barSpacing2)) / barCount2.length,
        height: '40',
        width: '100%',
        barSpacing: barSpacing2,
        barColor: '#fcb410'
    });
    var visitors_chart = $('.visitors_chart');
    var barParentdiv3 = visitors_chart.closest('div');
    var barCount3 = [209, 210, 209, 210, 210, 211, 212, 210, 210, 211];
    var barSpacing3 = 2;
    visitors_chart.sparkline(barCount3, {
        type: 'bar',
        barWidth: (barParentdiv3.width() - (barCount3.length * barSpacing3)) / barCount3.length,
        height: '40',
        width: '100%',
        barSpacing: barSpacing3,
        barColor: '#f86a67'
    });
    var register_chart = $(".register_chart");
    var barParentdiv4 = register_chart.closest('div');
    var barCount4 = [211, 210, 209, 210, 210, 211, 212, 210, 210, 211];
    var barSpacing4 = 2;
    register_chart.sparkline(barCount4, {
        type: 'bar',
        barWidth: (barParentdiv4.width() - (barCount4.length * barSpacing4)) / barCount4.length,
        height: '40',
        width: '100%',
        barSpacing: barSpacing4,
        barColor: '#5aca82'
    });
    var oData=[];
    var data1 = [10, 39.9, 17, 30, 5.3, 38.4, 15.7, 9];
    function refreshdata() {
        var x=data1.shift();
        data1.push(x);
        if ($(window).width() <= 424) {
            oData = {
                "01": data1[0],
                "02": data1[1],
                "03": data1[2],
                "04": data1[3],
                "05": data1[4],
                "06": data1[5]
            };
        }else{
            oData = {
                "2001": data1[0],
                "2002": data1[1],
                "2003": data1[2],
                "2004": data1[3],
                "2005": data1[4],
                "2006": data1[5],
                "2007": data1[6],
                "2008": data1[7]
            };
        }
    }

//       ============================ chart js============================
    function resize1() {
        var label = document.querySelector(".chart_label");
        var c = document.getElementById("animated_chart");
        var ctx = c.getContext("2d");
        var card_width = $(".animated_chart_card").width();
        var cw = c.width = card_width;
        var ch = c.height = 350;
        var cy = ch / 2;
        var frames = 0;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ccc";
        ctx.fillStyle = "#536973";
        ctx.font = "14px";
        var grd = ctx.createLinearGradient(0, 0, 0, cy);
        grd.addColorStop(0.2, "#329cff");
        grd.addColorStop(1, "#937eff");
        var valuesRy = [];
        var propsRy = [];
        for (var prop in oData) {

            valuesRy.push(oData[prop]);
            propsRy.push(prop);
        }
        var vData = 4;
        var hData = valuesRy.length;
        var offset = 40.5; //offset chart axis
        var chartHeight = ch - 2 * offset;
        var chartWidth = cw - 1.75 * offset;
        var t = 1 / 7; // curvature : 0 = no curvature
        var speed = 2; // for the animation

        var A = {
            x: offset,
            y: offset-20
        };
        var B = {
            x: offset,
            y: offset + chartHeight
        };
        var C = {
            x: offset + chartWidth,
            y: offset + chartHeight
        };

// CHART AXIS -------------------------
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.stroke();

// vertical ( A - B )
        var aStep = (chartHeight - 50) / (vData);

        var Max = Math.ceil(arrayMax(valuesRy) / 10) * 10;
        var Min = Math.floor(arrayMin(valuesRy) / 10) * 10;
        var aStepValue = (Max - Min) / (vData);
        var verticalUnit = aStep / aStepValue;
        var a = [];
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (var i1 = 0; i1 <= vData; i1++) {

            if (i1 == 0) {
                a[i1] = {
                    x: A.x,
                    y: A.y + 25,
                    val: Max
                }
            } else {
                a[i1] = {};
                a[i1].x = a[i1 - 1].x;
                a[i1].y = a[i1 - 1].y + aStep;
                a[i1].val = a[i1 - 1].val - aStepValue;
            }
            drawCoords(a[i1], 3, 0);
        }

//horizontal ( B - C )
        var b = [];
        ctx.textAlign = "center";
        ctx.textBaseline = "hanging";
        var bStep = chartWidth / (hData + 1);

        for (var i2 = 0; i2 < hData; i2++) {
            if (i2 == 0) {
                b[i2] = {
                    x: B.x + bStep,
                    y: B.y,
                    val: propsRy[0]
                };
            } else {
                b[i2] = {};
                b[i2].x = b[i2 - 1].x + bStep;
                b[i2].y = b[i2 - 1].y;
                b[i2].val = propsRy[i2]
            }
            drawCoords(b[i2], 0, 3)
        }

        function drawCoords(o, offX, offY) {
            ctx.beginPath();
            ctx.moveTo(o.x - offX, o.y - offY);
            ctx.lineTo(o.x + offX, o.y + offY);
            ctx.stroke();

            ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
        }

//----------------------------------------------------------

// DATA
        var oDots = [];
        var oFlat = [];
        var i = 0;

        for (var prop1 in oData) {
            oDots[i] = {};
            oFlat[i] = {};

            oDots[i].x = b[i].x;
            oFlat[i].x = b[i].x;

            oDots[i].y = b[i].y - oData[prop1] * verticalUnit - 25;
            oFlat[i].y = b[i].y - 25;

            oDots[i].val = oData[b[i].val];

            i++
        }


///// Animation Chart ///////////////////////////
//var speed = 3;
        function animateChart() {
            var requestId = window.requestAnimationFrame(animateChart);
            frames += speed; //console.log(frames)
            ctx.clearRect(60, 0, cw, ch - 60);

            for (var i3 = 0; i3 < oFlat.length; i3++) {
                if (oFlat[i3].y > oDots[i3].y) {
                    oFlat[i3].y -= speed;
                }
            }
            drawCurve(oFlat);
            for (var i4 = 0; i4 < oFlat.length; i4++) {
                ctx.fillText(oDots[i4].val, oFlat[i4].x, oFlat[i4].y - 25);
                ctx.beginPath();
                ctx.arc(oFlat[i4].x, oFlat[i4].y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }

//                if (frames >= Max * verticalUnit) {
//                    window.cancelAnimationFrame(requestId);
//
//                }
        }

        var requestId = window.requestAnimationFrame(animateChart);

/////// EVENTS //////////////////////
        c.addEventListener("mousemove", function (e) {
            label.innerHTML = "";
            label.style.display = "none";
            this.style.cursor = "default";

            var m = oMousePos(this, e);
            for (var i = 0; i < oDots.length; i++) {

                output(m, i);
            }

        }, false);

        function output(m, i) {
            ctx.beginPath();
            ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
            if (ctx.isPointInPath(m.x, m.y)) {
                //console.log(i);
                label.style.display = "block";
                label.style.top = (m.y + 10) + "px";
                label.style.left = (m.x + 10) + "px";
                label.innerHTML = "<strong>" + propsRy[i] + "</strong>: " + valuesRy[i] + "%";
                c.style.cursor = "pointer";
            }
        }

// CURVATURE
        function controlPoints(p) {
            // given the points array p calculate the control points
            var pc = [];
            for (var i = 1; i < p.length - 1; i++) {
                var dx = p[i - 1].x - p[i + 1].x; // difference x
                var dy = p[i - 1].y - p[i + 1].y; // difference y
                // the first control point
                var x1 = p[i].x - dx * t;
                var y1 = p[i].y - dy * t;
                var o1 = {
                    x: x1,
                    y: y1
                };

                // the second control point
                var x2 = p[i].x + dx * t;
                var y2 = p[i].y + dy * t;
                var o2 = {
                    x: x2,
                    y: y2
                };

                // building the control points array
                pc[i] = [];
                pc[i].push(o1);
                pc[i].push(o2);
            }
            return pc;
        }

        function drawCurve(p) {

            var pc = controlPoints(p); // the control points array

            ctx.beginPath();
            //ctx.moveTo(p[0].x, B.y- 25);
            ctx.lineTo(p[0].x, p[0].y);
            // the first & the last curve are quadratic Bezier
            // because I'm using push(), pc[i][1] comes before pc[i][0]
            ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);

            if (p.length > 2) {
                // central curves are cubic Bezier
                for (var i = 1; i < p.length - 2; i++) {
                    ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
                }
                // the first & the last curve are quadratic Bezier
                var n = p.length - 1;
                ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
            }

            //ctx.lineTo(p[p.length-1].x, B.y- 25);
            ctx.stroke();
            ctx.save();
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.restore();
        }

        function arrayMax(array) {
            return Math.max.apply(Math, array);
        }

        function arrayMin(array) {
            return Math.min.apply(Math, array);
        }

        function oMousePos(canvas, evt) {
            var ClientRect = canvas.getBoundingClientRect();
            return { //objeto
                x: Math.round(evt.clientX - ClientRect.left),
                y: Math.round(evt.clientY - ClientRect.top)
            }
        }
    }

    refreshdata();
    resize1();
    setInterval(function () {
        refreshdata();
        resize1();
    }, 3000);


//     ======================   random data chart=============================
    function random_data() {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });

        Highcharts.chart('random_data', {
            chart: {
                type: 'areaspline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = Math.random();
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
            },
            title: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Random data',
                fillColor: "rgba(50,155,255,0.6)",
                data: (function () {
                    // generate an array of random data
                    var data = [];
                    var time = (new Date()).getTime();
                    var i;

                    for (i = -19; i <= 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: Math.random()
                        });
                    }
                    return data;
                }())
            }]
        });
    }
    random_data();
    //     ======================  End of random data chart=============================
    $(".sidebar-toggle").on("click", function () {
        setTimeout(function () {
            refreshdata();
            resize1();
            $("#random_data").highcharts().reflow();
        }, 200)
    });
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        resize1();
        $("#random_data").highcharts().reflow();
    });


//     ===================   To do list=============================
    $(".check_total [type='checkbox']").on("change",function () {
        $(".to_do_checkbox_section [type='checkbox']").prop('checked', $(this).prop("checked"));
        checkboxes();
    });
    function checkboxes() {
        var totalCheckbox=$(".to_do_checkbox_section [type='checkbox']").length;
        var totalChecked=$(".to_do_checkbox_section [type='checkbox']:checked").length;
        var totalUnchecked=totalCheckbox-totalChecked;
        $(".total_checkbox").text(totalCheckbox);
        $(".remaining_checkbox").text(totalUnchecked);
    }
    checkboxes();
    $(".to_do_checkbox_section [type='checkbox']").on("change",function () {
        checkboxes();
    });
    $(".delete_checkbox").on("click",function () {
        $(".to_do_checkbox_section [type='checkbox']:checked").closest(".checkbox-custom").remove();
        checkboxes();
    });
    $("form#main_input").on("submit",function(event) {
        event.preventDefault();
        var inputValue=$("#custom_textbox").val();
        var formValue=' <div class="checkbox-custom m-t-10 border_bottom"><label class="custom-control custom-checkbox"> ' +
            '<input type="checkbox" class="custom-control-input striked large"/> ' +
            '<span class="custom-control-indicator mr-3"></span> ' +
            '<span class="custom-control-description ml-3">'+ inputValue +'</span> ' +
            '</label></div>';
        console.log(inputValue);
        $(".todo_scroll").prepend(formValue);
        checkboxes();
        $("#custom_textbox").val('');
    });
    $('.todo_scroll').slimScroll({
        height: "280",
        size: '5px',
        color: '#ccc'
    });
//     ===========================   End of do list==================

//     ===================   swiper==============================
    var swiper1 = new Swiper('#swiper1', {
        autoplay: 2000,
        loop:true,
        autoplayDisableOnInteraction: false
    });
    $(".sidebar-toggle").on("click", function() {
        setTimeout(function() {
            swiper1.update();
        }, 200);
    });
//        ===========================End of swiper======================

//        ======================World population==============================
    var population=echarts.init(document.getElementById('world_population'));
    var options = {
        tooltip : {
            trigger: 'item',
            formatter : function (params) {
                var value = (params.value + '').split('.');
                value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,')
                    + '.' + value[1];
                return params.seriesName + '<br/>' + params.name + ' : ' + value;
            }
        },
        dataRange: {
            min: 0,
            max: 1000000,
            text:['High','Low'],
            realtime: false,
            calculable : true,
//                color: ['orangered','yellow','lightskyblue']
            color: ['#f86a67','#fcb410','#329cff']
        },
        series : [
            {
                name: 'World Population (2010)',
                type: 'map',
                mapType: 'world',
                roam: true,
                mapLocation: {
                    y : 60
                },
                itemStyle:{
                    emphasis:{label:{show:true}}
                },
                data:[
                    {name : 'Afghanistan', value : 28397.812},
                    {name : 'Angola', value : 19549.124},
                    {name : 'Albania', value : 3150.143},
                    {name : 'United Arab Emirates', value : 8441.537},
                    {name : 'Argentina', value : 40374.224},
                    {name : 'Armenia', value : 2963.496},
                    {name : 'French Southern and Antarctic Lands', value : 268.065},
                    {name : 'Australia', value : 22404.488},
                    {name : 'Austria', value : 8401.924},
                    {name : 'Azerbaijan', value : 9094.718},
                    {name : 'Burundi', value : 9232.753},
                    {name : 'Belgium', value : 10941.288},
                    {name : 'Benin', value : 9509.798},
                    {name : 'Burkina Faso', value : 15540.284},
                    {name : 'Bangladesh', value : 151125.475},
                    {name : 'Bulgaria', value : 7389.175},
                    {name : 'The Bahamas', value : 66402.316},
                    {name : 'Bosnia and Herzegovina', value : 3845.929},
                    {name : 'Belarus', value : 9491.07},
                    {name : 'Belize', value : 308.595},
                    {name : 'Bermuda', value : 64.951},
                    {name : 'Bolivia', value : 716.939},
                    {name : 'Brazil', value : 195210.154},
                    {name : 'Brunei', value : 27.223},
                    {name : 'Bhutan', value : 716.939},
                    {name : 'Botswana', value : 1969.341},
                    {name : 'Central African Republic', value : 4349.921},
                    {name : 'Canada', value : 34126.24},
                    {name : 'Switzerland', value : 7830.534},
                    {name : 'Chile', value : 17150.76},
                    {name : 'China', value : 1359821.465},
                    {name : 'Ivory Coast', value : 60508.978},
                    {name : 'Cameroon', value : 20624.343},
                    {name : 'Democratic Republic of the Congo', value : 62191.161},
                    {name : 'Republic of the Congo', value : 3573.024},
                    {name : 'Colombia', value : 46444.798},
                    {name : 'Costa Rica', value : 4669.685},
                    {name : 'Cuba', value : 11281.768},
                    {name : 'Northern Cyprus', value : 1.468},
                    {name : 'Cyprus', value : 1103.685},
                    {name : 'Czech Republic', value : 10553.701},
                    {name : 'Germany', value : 83017.404},
                    {name : 'Djibouti', value : 834.036},
                    {name : 'Denmark', value : 5550.959},
                    {name : 'Dominican Republic', value : 10016.797},
                    {name : 'Algeria', value : 37062.82},
                    {name : 'Ecuador', value : 15001.072},
                    {name : 'Egypt', value : 78075.705},
                    {name : 'Eritrea', value : 5741.159},
                    {name : 'Spain', value : 46182.038},
                    {name : 'Estonia', value : 1298.533},
                    {name : 'Ethiopia', value : 87095.281},
                    {name : 'Finland', value : 5367.693},
                    {name : 'Fiji', value : 860.559},
                    {name : 'Falkland Islands', value : 49.581},
                    {name : 'France', value : 63230.866},
                    {name : 'Gabon', value : 1556.222},
                    {name : 'United Kingdom', value : 62066.35},
                    {name : 'Georgia', value : 4388.674},
                    {name : 'Ghana', value : 24262.901},
                    {name : 'Guinea', value : 10876.033},
                    {name : 'Gambia', value : 1680.64},
                    {name : 'Guinea Bissau', value : 10876.033},
                    {name : 'Equatorial Guinea', value : 696.167},
                    {name : 'Greece', value : 11109.999},
                    {name : 'Greenland', value : 56.546},
                    {name : 'Guatemala', value : 14341.576},
                    {name : 'French Guiana', value : 231.169},
                    {name : 'Guyana', value : 786.126},
                    {name : 'Honduras', value : 7621.204},
                    {name : 'Croatia', value : 4338.027},
                    {name : 'Haiti', value : 9896.4},
                    {name : 'Hungary', value : 10014.633},
                    {name : 'Indonesia', value : 240676.485},
                    {name : 'India', value : 1205624.648},
                    {name : 'Ireland', value : 4467.561},
                    {name : 'Iran', value : 240676.485},
                    {name : 'Iraq', value : 30962.38},
                    {name : 'Iceland', value : 318.042},
                    {name : 'Israel', value : 7420.368},
                    {name : 'Italy', value : 60508.978},
                    {name : 'Jamaica', value : 2741.485},
                    {name : 'Jordan', value : 6454.554},
                    {name : 'Japan', value : 127352.833},
                    {name : 'Kazakhstan', value : 15921.127},
                    {name : 'Kenya', value : 40909.194},
                    {name : 'Kyrgyzstan', value : 5334.223},
                    {name : 'Cambodia', value : 14364.931},
                    {name : 'South Korea', value : 51452.352},
                    {name : 'Kosovo', value : 97.743},
                    {name : 'Kuwait', value : 2991.58},
                    {name : 'Laos', value : 6395.713},
                    {name : 'Lebanon', value : 4341.092},
                    {name : 'Liberia', value : 3957.99},
                    {name : 'Libya', value : 6040.612},
                    {name : 'Sri Lanka', value : 20758.779},
                    {name : 'Lesotho', value : 2008.921},
                    {name : 'Lithuania', value : 3068.457},
                    {name : 'Luxembourg', value : 507.885},
                    {name : 'Latvia', value : 2090.519},
                    {name : 'Morocco', value : 31642.36},
                    {name : 'Moldova', value : 103.619},
                    {name : 'Madagascar', value : 21079.532},
                    {name : 'Mexico', value : 117886.404},
                    {name : 'Macedonia', value : 507.885},
                    {name : 'Mali', value : 13985.961},
                    {name : 'Myanmar', value : 51931.231},
                    {name : 'Montenegro', value : 620.078},
                    {name : 'Mongolia', value : 2712.738},
                    {name : 'Mozambique', value : 23967.265},
                    {name : 'Mauritania', value : 3609.42},
                    {name : 'Malawi', value : 15013.694},
                    {name : 'Malaysia', value : 28275.835},
                    {name : 'Namibia', value : 2178.967},
                    {name : 'New Caledonia', value : 246.379},
                    {name : 'Niger', value : 15893.746},
                    {name : 'Nigeria', value : 159707.78},
                    {name : 'Nicaragua', value : 5822.209},
                    {name : 'Netherlands', value : 16615.243},
                    {name : 'Norway', value : 4891.251},
                    {name : 'Nepal', value : 26846.016},
                    {name : 'New Zealand', value : 4368.136},
                    {name : 'Oman', value : 2802.768},
                    {name : 'Pakistan', value : 173149.306},
                    {name : 'Panama', value : 3678.128},
                    {name : 'Peru', value : 29262.83},
                    {name : 'Philippines', value : 93444.322},
                    {name : 'Papua New Guinea', value : 6858.945},
                    {name : 'Poland', value : 38198.754},
                    {name : 'Puerto Rico', value : 3709.671},
                    {name : 'North Korea', value : 1.468},
                    {name : 'Portugal', value : 10589.792},
                    {name : 'Paraguay', value : 6459.721},
                    {name : 'Qatar', value : 1749.713},
                    {name : 'Romania', value : 21861.476},
                    {name : 'Russia', value : 21861.476},
                    {name : 'Rwanda', value : 10836.732},
                    {name : 'Western Sahara', value : 514.648},
                    {name : 'Saudi Arabia', value : 27258.387},
                    {name : 'Sudan', value : 35652.002},
                    {name : 'South Sudan', value : 9940.929},
                    {name : 'Senegal', value : 12950.564},
                    {name : 'Solomon Islands', value : 526.447},
                    {name : 'Sierra Leone', value : 5751.976},
                    {name : 'El Salvador', value : 6218.195},
                    {name : 'Somaliland', value : 9636.173},
                    {name : 'Somalia', value : 9636.173},
                    {name : 'Republic of Serbia', value : 3573.024},
                    {name : 'Suriname', value : 524.96},
                    {name : 'Slovakia', value : 5433.437},
                    {name : 'Slovenia', value : 2054.232},
                    {name : 'Sweden', value : 9382.297},
                    {name : 'Swaziland', value : 1193.148},
                    {name : 'Syria', value : 7830.534},
                    {name : 'Chad', value : 11720.781},
                    {name : 'Togo', value : 6306.014},
                    {name : 'Thailand', value : 66402.316},
                    {name : 'Tajikistan', value : 7627.326},
                    {name : 'Turkmenistan', value : 5041.995},
                    {name : 'East Timor', value : 10016.797},
                    {name : 'Trinidad and Tobago', value : 1328.095},
                    {name : 'Tunisia', value : 10631.83},
                    {name : 'Turkey', value : 72137.546},
                    {name : 'United Republic of Tanzania', value : 44973.33},
                    {name : 'Uganda', value : 33987.213},
                    {name : 'Ukraine', value : 46050.22},
                    {name : 'Uruguay', value : 3371.982},
                    {name : 'United States of America', value : 312247.116},
                    {name : 'Uzbekistan', value : 27769.27},
                    {name : 'Venezuela', value : 236.299},
                    {name : 'Vietnam', value : 89047.397},
                    {name : 'Vanuatu', value : 236.299},
                    {name : 'West Bank', value : 13.565},
                    {name : 'Yemen', value : 22763.008},
                    {name : 'South Africa', value : 51452.352},
                    {name : 'Zambia', value : 13216.985},
                    {name : 'Zimbabwe', value : 13076.978}
                ]
            }
        ]
    };
    population.setOption(options);
//        ==========================End of world population=======================
//     =============justgage===============================
    var gauge1 = new JustGage({
        id: "gauge1",
        relativeGaugeSize: true,
        value: getRandomInt(0, 100),
        min: 0,
        max: 100,
        decimals: 0,
        valueFontFamily: "Nunito Sans, sans-serif",
        levelColors: ["#329cff"],
        title: "Visitors",
        counter: true
    });
    var gauge2 = new JustGage({
        id: "gauge2",
        relativeGaugeSize: true,
        value: getRandomInt(0, 100),
        min: 0,
        max: 100,
        decimals: 0,
        valueFontFamily: "Nunito Sans, sans-serif",
        levelColors: ["#f86a67"],
        counter: true
    });
    var gauge3 = new JustGage({
        id: "gauge3",
        relativeGaugeSize: true,
        value: getRandomInt(0, 100),
        min: 0,
        max: 100,
        decimals: 0,
        valueFontFamily: "Nunito Sans, sans-serif",
        levelColors: ["#937eff"],
        counter: true
    });
    var gauge4 = new JustGage({
        id: "gauge4",
        relativeGaugeSize: true,
        value: getRandomInt(0, 100),
        min: 0,
        max: 100,
        decimals: 0,
        valueFontFamily: "Nunito Sans, sans-serif",
        levelColors: ["#31d0d6"],
        counter: true
    });
    setInterval(function() {
        gauge1.refresh(getRandomInt(40, 100));
        gauge2.refresh(getRandomInt(30, 100));
        gauge3.refresh(getRandomInt(60, 100));
        gauge4.refresh(getRandomInt(50, 100));
    }, 2000);
//     =====================End of justgage========================
});