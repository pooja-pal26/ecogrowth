"use strict";
$(document).ready(function () {
    var data = [],
        series = Math.floor(Math.random() * 4) + 2;

    for (var i = 0; i < series; i++) {
        data[i] = {
            label: "Series" + (i + 1),
            data: Math.floor(Math.random() * 100)
        }
    }
    function labelFormatter(label, series) {
        return "<div style='font-size:12pt; text-align:center; padding:2px; color:#fff;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
    }
//      =========================  Basic pie chart========================================
    $.plot('#pie_chart1', data, {
        series: {
            pie: {
                show: true
            }
        },
        colors:['#329cff','#5aca82','#007bb8','#fcb410','#f86a67','#31d0d6','#937eff']
    });
//     ========================   End of basic pie chart7===========================

//     =========================   pie chart without legend=================================
    $.plot('#pie_chart2', data, {
        series: {
            pie: {
                show: true
            }
        },
        legend: {
            show: false
        },
        colors:['#937eff','#31d0d6','#f86a67','#fcb410','#007bb8','#5aca82','#329cff']
    });
//     ========================   end of piechart without legend=================================

//      ======================     Label formatter=========================================
    $.plot('#pie_chart3', data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                label: {
                    show: true,
                    radius: 1,
                    formatter: labelFormatter,
                    background: {
                        opacity: 0.8
                    }
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#fcb410','#f86a67','#31d0d6','#937eff','#329cff','#5aca82','#007bb8']
    });
//      ===========================     end of label formatter=================================

//      =============================     Label radius============================================
    $.plot('#pie_chart4', data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                label: {
                    show: true,
                    radius: 3/4,
                    formatter: labelFormatter
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#5aca82','#007bb8','#fcb410','#f86a67','#31d0d6','#937eff','#329cff']
    });
//      ========================     End of label radius================================================

//      ==============================     Label style==========================================
    $.plot('#pie_chart5', data, {
        series: {
            pie: {
                show: true,
                radius: 3/4,
                label: {
                    show: true,
                    radius: 3/4,
                    formatter: labelFormatter,
                    background: {
                        opacity: 0.5,
                        color: '#333'
                    }
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#f86a67','#31d0d6','#937eff','#5aca82','#007bb8','#fcb410','#329cff']
    });
//      ============================     end of label style=====================================

//      ===========================     Hidden labels===========================================
    $.plot('#pie_chart6', data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                label: {
                    show: true,
                    radius: 2/3,
                    formatter: labelFormatter,
                    threshold: 0.1
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#007bb8','#fcb410','#31d0d6','#937eff','#329cff','#5aca82','#f86a67']
    });
//      ==========================     End of hidden labels========================================

//      ========================     Combined slice======================================
    $.plot('#pie_chart7', data, {
        series: {
            pie: {
                show: true,
                combine: {
                    color: '#999',
                    threshold: 0.1
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#329cff','#5aca82','#f86a67','#007bb8','#fcb410','#31d0d6','#937eff']
    });
//      ===================================     End of combined slice============================

//      ================================     Rectangular pie chart==================================
    $.plot('#pie_chart8', data, {
        series: {
            pie: {
                show: true,
                radius: 500,
                label: {
                    show: true,
                    formatter: labelFormatter,
                    threshold: 0.1
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#007bb8','#fcb410','#31d0d6','#329cff','#5aca82','#f86a67','#937eff','#5aca82']
    });
//      ============================     End of rectangular pie chart==============================

//     ====================      Tilted pie chart===========================================
    $.plot('#pie_chart9', data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                tilt: 0.5,
                label: {
                    show: true,
                    radius: 1,
                    formatter: labelFormatter,
                    background: {
                        opacity: 0.8
                    }
                },
                combine: {
                    color: '#999',
                    threshold: 0.1
                }
            }
        },
        legend: {
            show: false
        },
        colors:['#31d0d6','#329cff','#5aca82','#007bb8','#fcb410','#f86a67','#937eff']
    });
//      =====================================     end of tilted pie chart========================

//      ===================     donut hole===========================================
    $.plot('#pie_chart10', data, {
        series: {
            pie: {
                innerRadius: 0.5,
                show: true
            }
        },
        colors:['#fcb410','#f86a67','#937eff','#31d0d6','#329cff','#5aca82','#007bb8']
    });
//      =================================     end of donut hole============================
});