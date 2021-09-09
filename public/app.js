var chart = Vue.component('sample-chart', {
    extends: VueChartJs.Line,
    props: {
        loaded: {
            type: Boolean,
            required: true
        },
        labels: {
            type: Array,
            required: false
        },
        chartData: {
            type: Array,
            required: true
        }
    },
    methods: {
        render: function () {
            this.renderChart({
                labels: this.labels,
                datasets: this.chartData
            }, {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        gridLines: {
                            display: true
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }]
                },
                legend: {
                    display: false
                },
                responsive: true,
                maintainAspectRatio: false
            })
        }
    },
    mounted: function () {
        this.render();
    },
    watch: {
        labels: function () {
            this.render();
        },
        chartData: function () {
            this.render();
        },
        loaded: function () {
            this.render();
        },
        deep: true
    }
});

function average(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}

function standardDeviation(values) {
    var avg = average(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function findMinMax(arr) {
    let min = arr[0], max = arr[0];

    for (let i = 1, len = arr.length; i < len; i++) {
        let v = arr[i];
        min = (v < min) ? v : min;
        max = (v > max) ? v : max;
    }

    return [min, max];
}

function createStats(sample) {
    var data = sample.data;
    var odds = sample.odds;
    var size = sample.size;

    var overOdds = data.filter(function (num) { return num >= odds }).length;
    var underOdds = data.filter(function (num) { return num < odds }).length;
    var min = 0;
    var max = 0;
    var stddev = standardDeviation(data);
    var avg = average(data);
    var minMax = findMinMax(data);
    min = minMax[0];
    max = minMax[1];

    return {
        odds: odds,
        size: size,
        overOdds: overOdds,
        underOdds: underOdds,
        max: max,
        min: min,
        stddev: stddev,
        average: avg
    };
}

function createGroups(data, size) {
    var minMax = findMinMax(data);
    var max = minMax[1];
    var groupNums = Math.ceil(max / size);
    var groupings = {};

    for (var i = 0; i < groupNums; i++) {
        var minGroup = (i * size);
        var maxGroup = ((i + 1) * size);
        groupings[maxGroup] = data.filter(function (num) {
            return num >= minGroup && num < maxGroup
        }).length;
    }

    return groupings;
}

var app = new Vue({
    el: '#app',
    data: {
        samples: [],
        labels: [],
        size: 100000,
        odds: 1365,
        loaded: true,
        disableAdd: false,
        datasets: [
            {
                label: '',
                backgroundColor: '#0b5ed7',
                data: []
            }
        ],
        stats: {}
    },
    mounted: function () {
        var self = this;
        Ajax.get('http://localhost:5000/api/samples').then(function (response) {
            self.samples = response;
        });
    },
    computed: {
        isDisabled: function () {
            return this.disableAdd;
        }
    },
    methods: {
        createSample: function () {
            var self = this;
            self.disableAdd = true;
            Ajax.get(`http://localhost:5000/api/generateSample?size=${self.size}&odds=${self.odds}`).then(function (response) {
                self.samples.push(response.sample);
                self.disableAdd = false;
            }).catch(function () {
                self.disableAdd = false;
            });
        },
        setData: function (sample) {
            var self = this;
            Ajax.get('http://localhost:5000/api/samples/' + sample).then(function (response) {
                self.stats = createStats(response.samples);
                var d = createGroups(response.samples.data, 200);
                self.labels = Object.keys(d);
                self.datasets = [
                    {
                        label: 'Data X',
                        backgroundColor: '#f87979',
                        data: Object.values(d)
                    }
                ];
            });
        }
    }
});