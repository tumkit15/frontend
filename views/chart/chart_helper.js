function getChartConfig(title, type, xAxisLabel, yAxisLabel, lables, datasets) {
    var config = {
        type: type,
        data: {
            labels: lables,
            datasets: datasets
        },
        options: {
            responsive: true,
            title: { display: true, text: title },
            tooltips: { mode: 'index', intersect: false, },
            hover: { mode: 'nearest', intersect: true },
            scales: {
                xAxes: [{ display: true, scaleLabel: { display: true, labelString: xAxisLabel } }],
                yAxes: [{ display: true, scaleLabel: { display: true, labelString: yAxisLabel } }]
            },
            elements: { line: { tension: 0 } }
        }
    }
    return config;
}

function getPercentageChartConfig(value, chartTitle, type, label, displayLegend) {
    var fillValue = (100 - value).toFixed(2);
    var config = {
        type: type,
        data: {
            datasets: [{
                data: [
                    value,
                    fillValue,
                ],
                backgroundColor: [
                    '#4daea8',
                    '#bbc3d4',
                ]
            }],
            labels: [label, label]
        },
        options: {
            cutoutPercentage: 80,
            responsive: true,
            legend: {
                position: 'top',
                display: displayLegend
            },
            title: {
                display: true,
                text: chartTitle
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    return config;
}

function getPolarChartConfig(value1, value2, chartTitle1, chartTitle2, canvasTitle) {
    var fillValue1 = 100 - value1;
    var fillValue2 = 100 - value2;
    var lowerMargin = Math.min(value1, value2) * 0.8;
    var higherMargin = Math.ceil(Math.max(value1, value2) / 10) * 10;
    var config = {
        type: 'polarArea',
        data: {
            datasets: [
                {
                    data: [
                        value1,
                        value2
                    ],
                    backgroundColor: [
                        'rgba(77, 174, 168, 0.5)',
                        'rgba(77, 174, 168, 0.8)',
                    ],
                    labels: [
                        'a',
                        'b'
                    ]
                }
            ],
            labels: [
                chartTitle1,
                chartTitle2,
            ]
        },
        options: {
            scale: {
                ticks: {
                    stepSize: 5,
                    max: higherMargin,
                    min: lowerMargin
                }
            },
            responsive: true,
            legend: {
                position: 'left'
            },
            title: {
                display: true,
                text: canvasTitle
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            tooltips: {
                callbacks: {
                    label: function (item, data) {
                        return data.labels[item.index];
                    }
                }
            }
        }
    };

    return config;
}