let vars = [
    {
        name: 'Salari',
        desc: 'Informació sobre els salaris dels participants. Convertits a dólars americans (USD).',
        vars: [ 'ConvertedSalary' ]
    },
    {
        name: 'Vocació',
        desc: 'Vocacíó respecte al món del desenvoulapment dels participants.',
        vars: [ 'Hobby', 'OpenSource' ]
    },
    {
        name: 'Empresa',
        desc: "Dades relacionades amb l'empresa o organització en què els participants contribueixen.",
        vars: [ 'Employment', 'CompanySize', 'DevType' ]
    },
    {
        name: 'Educació',
        desc: "Nivell d'estudis i situació actual d'estudis dels participants.",
        vars: [ 'FormalEducation', 'Student', 'EducationTypes', 'SelfTaughtTypes']
    },
    {
        name: 'Perfil',
        desc: "Perfil, rol i experiència dels participants.",
        vars: [ 'YearsCoding', 'YearsCodingProf', 'Gender', 'RaceEthnicity', 'EducationParents', 'Age', 'Dependents']
    },
    {
        name: 'Projecció',
        desc: "Projecció professional i expectatives dels participants.",
        vars: [ 'JobSatisfaction', 'CareerSatisfaction', 'HopeFiveYears', 'JobSearchStatus', 'LastNewJob']
    },
    {
        name: 'Plataformes, eines, frameworks,..',
        desc: "Plataformes de treball, sistemes, eines i frameworks més habituals entre els participants.",
        vars: [ 'LanguageWorkedWith', 'LanguageDesireNextYear', 'DatabaseWorkedWith', 'DatabaseDesireNextYear',
                    'PlatformWorkedWith', 'PlatformDesireNextYear', 'FrameworkWorkedWith', 'FrameworkDesireNextYear',
                    'IDE', 'OperatingSystem', 'NumberMonitors', 'Methodology', 'VersionControl', 'CommunicationTools' ]
    },
    {
        name: 'Conciliació i salut',
        desc: "Aspectes relacionats amb la compaginació de la vida laboral i la personal, la salut i el lleure dels participants.",
        vars: [ 'WakeTime', 'HoursComputer', 'HoursOutside', 'SkipMeals', 'ErgonomicDevices', 'Exercise']
    }
]

let continuousVars = ['ConvertedSalary'];
let verticalBars = ['FormalEducation', 'Hobby', 'OpenSource', 'DevType', 'EducationTypes', 'SelfTaughtTypes', 'RaceEthnicity', 'EducationParents',
                        'Dependents', 'HopeFiveYears', 'JobSearchStatus', 'Methodology', 'VersionControl']

trans = {
    ConvertedSalary: 'Salari (USD)',
    LanguageWorkedWith: 'Llenguatges coneguts',
    LanguageDesireNextYear: 'Llenguatges desitjats',
    DatabaseWorkedWith: 'Gestors BBDD coneguts',
    DatabaseDesireNextYear: 'Gestors BBDD desitjats',
    PlatformWorkedWith: 'Plataformes conegudes',
    PlatformDesireNextYear: 'Plataformes desitjades',
    FrameworkWorkedWith: 'Frameworks coneguts',
    FrameworkDesireNextYear: 'Frameworks desitjats',
    DevType: 'Rols',
    CompanySize: 'Tamany organització',
    FormalEducation: 'Nivell educatiu',
    OpenSource: 'Participa en Open Source',
    Employment: 'Modalitat feina'
}

const colors = ['#222f3e', '#2e86de', '#8395a7', '#0abde3', '#01a3a4', '#182C61'
                , '#2C3A47', '#6D214F', '#30336b', '#130f40', '#192a56', '#273c75', '#1e272e'];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function trVar(varName) {
    return varName in trans ? trans[varName] : varName;
}

function fN(n) {
    // var formatValue = d3.format("0,000");
    return (Math.round(n*10)/10).toString()
        .replace(",", ";")
        .replace(".", ",")
        .replace(";", ".")
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


// Tooltip hover mapa
var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")


// The svg
var svg = null;

// Map and projection
var path = d3.geoPath();
var projection = d3.geoCylindricalStereographic()
    .scale(160);


// Totes les dades (netejades prèviament)
let dataset = []
// Diccionari de països (per saber ràpidament si existeixen en l'enquesta)
let countriesDic = {}
let totalWithCountry = 0;
let selectedCountries = [];


let countryMap2CountrySurvey = function(mapName) {
    // Mismatch entre alguns noms de països a l'enquesta i al mapa. Almenys arreglem els més obvis
    if (mapName === 'Russia') {
        return 'Russian Federation';
    }
    if (mapName === 'USA') {
        return 'United States';
    }
    if (mapName === 'England') {
        return 'United Kingdom';
    }
    return mapName;
}

let countryExistInSurvey = function(mapName) {
    return countriesDic[countryMap2CountrySurvey(mapName)];
}

let deleteCountry = pais => {
    selectedCountries = selectedCountries.filter(c => c !== pais)
    updateCountriesList();
    drawMap();
    drawCharts();
}

function updateCountriesList() {
    document.getElementById('paisos-seleccionats').innerHTML = '';
    let tpl = '';
    selectedCountries.forEach(pais => {
        tpl += `<div onclick="deleteCountry('${pais}')" class="pais-selected">${pais} <i class="fas fa-times"></i></div>`;
    })
    document.getElementById('paisos-seleccionats').innerHTML = tpl;
    document.getElementById('paisos-seleccionats-wrapper').style.display = selectedCountries.length ? 'flex' : 'none';
}

let topo = null;

let getGenreMode = () => {
    return document.querySelectorAll('.genre-button.selected')[0].dataset.mode;
}


let mouseMove = function(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(100)
        .style("opacity", .5)
    d3.select(this)
        .transition()
        .duration(100)
        .style("opacity", 1)
        .style("cursor", 'hand')
    // .style("stroke", "black")

    let ht = ''

    let countName = d.properties.name;
    if (countryExistInSurvey(d.properties.name)) {

        let curCount = countriesDic[countryMap2CountrySurvey(countName)];
        ht = `<div>${JSON.stringify(curCount)}</div>`;
        let percen = fN(curCount.total / totalWithCountry * 100);
        if (percen == '0') {
            percen = '< 0,01';
        }

        let totalGender = curCount.male + curCount.female + curCount.others;
        let percenMale = fN(curCount.male / totalGender * 100);
        let percenFemale = fN(curCount.female / totalGender * 100);
        let percenOthers = fN(curCount.others / totalGender * 100);

        ht = `<div>                    
                    <div style="margin-bottom: 5px;"><b>${countName}</b> (${percen}%)</div>
                    <div class="row">                        
                        <div class="col-4"><i class="fas fa-female"></i> ${percenFemale}%</div>
                        <div class="col-4"><i class="fas fa-male"></i> ${percenMale}%</div>                        
                        <div class="col-4"><i class="fas fa-venus-mars"></i> ${percenOthers}%</div>
                    </div>
                </div>`;

    } else {
        ht = `<div><b>${countName}</b><br/>(Sense dades)</div>`;
    }

    div.style("opacity", 1);
    div
        .html( ht )
        .style("left", function () {
            return d3.event.pageX + 23 + "px";
        })
        .style("top", d3.event.pageY - 20 + "px")
        .style("width", "auto");
}

let mouseLeave = function(d) {
    d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 1)
    div.style("opacity", 0);
}

let mouseClick = function(d) {
    const name = countryMap2CountrySurvey(d.properties.name);
    if (!countryExistInSurvey(d.properties.name)) {
        return;
    }

    let fillColor = '#c0392b';
    if (selectedCountries.includes(name)) {
        selectedCountries = selectedCountries.filter(c => c !== name)
        fillColor = '#0984e3';
    } else {
        selectedCountries.push(name)
    }
    d3.select(this)
        .attr('fill', fillColor)

    updateCountriesList();
    drawCharts();
}


// Draw the map
function drawMap() {
    svg && svg.remove();
    svg = d3
        .select("#map-container")
        .append("svg")
        .attr("width", "1020")
        .attr("height", "410")

    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            return countryExistInSurvey(d.properties.name)
                ? (selectedCountries.includes(countryMap2CountrySurvey(d.properties.name)) ? '#c0392b' : '#0984e3') : '#dfe6e9';
        })
        .style("stroke", "white")
        .style("stroke-width", "1.1")
        .attr("class", function (d) {
            return "Country"
        })
        .style("opacity", 1)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave)
        .on("click", mouseClick)
}

// Load external data and boot
// console.log('queue start');

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/gikajavi/stackoverflow-survey-2018/main/ds_cleaned-min.csv", function(d) {
        dataset.push(d);
    })
    .await(ready);

function ready(error, Topo) {
    topo = Topo;

    // Inici
    // Compteig d'algunes dades
    dataset.forEach(ele => {
        if (ele.Country !== 'NA') {
            totalWithCountry++;
            if (!(ele.Country in countriesDic)) {
                countriesDic[ele.Country] = {}
                countriesDic[ele.Country].total = 0;
                countriesDic[ele.Country].male = 0;
                countriesDic[ele.Country].female = 0;
                countriesDic[ele.Country].others = 0;
            }
            countriesDic[ele.Country].total++;
            if (ele.Gender !== 'NA') {
                if (ele.Gender === 'Female') {
                    countriesDic[ele.Country].female++
                } else if (ele.Gender === 'Male') {
                    countriesDic[ele.Country].male++
                } else {
                    countriesDic[ele.Country].others++
                }
            }
        }
    })

    d3.selectAll(".genre-button")
        .on("click", function (e) {
            document.querySelectorAll('.genre-button.selected')[0].classList.remove('selected');
            this.classList.add('selected');
            drawCharts();
        });


    document.getElementById('loading-map').style.display = 'none';
    document.getElementById('map-container').style.display = 'block';
    document.getElementById('altres-filtres').style.display = 'block';

    // Dibuixar mapa i gràfiques
    drawMap();
    drawCharts();
}


function drawCharts() {
    document.getElementById('charts').innerHTML = '';
    document.getElementById('loading-charts').style.display = 'block';


    setTimeout(function() {

        let countries = JSON.parse(JSON.stringify(selectedCountries));
        if (countries.length == 0) {
            countries.push('Món')
        }

        vars.forEach(group => {

            d3.select("#charts").append('div').attr('class', 'col-12 mt-8x mb-6x')
                        .html( `<h1>${group.name}</h1><p>${group.desc}</p>` );

            group.vars.forEach(varName => {
                countries.forEach(country => {
                    let filters = {}
                    if (country !== 'Món') {
                        filters.Country = country;
                    }
                    let mode = continuousVars.includes(varName) ? 'continuous' : 'categorical';
                    let chartType = mode;
                    if (verticalBars.includes(varName)) {
                        chartType = 'vcategorical';
                    }

                    if (getGenreMode() == 'compare') {
                        let tCountry = '';
                        country == 'Món' ? tCountry = '<i class="fas fa-globe-americas"></i>' : tCountry = ` <b class="ml-2x">${country}</b>`;
                        title = titleTpl(trVar(varName), '<i class="fas fa-female"></i>', tCountry)
                        plot( getData4Chart(varName, { Gender: 'Female', ...filters }, mode), title, chartType )
                        title = titleTpl(trVar(varName), '<i class="fas fa-male"></i>', tCountry)
                        plot( getData4Chart(varName, { Gender: 'Male', ...filters }, mode), title, chartType )
                    } else {
                        let tGender = '';
                        if (getGenreMode() == 'male') {
                            tGender = '<i class="fas fa-male"></i>';
                            filters.Gender = 'Male';
                        }
                        if (getGenreMode() == 'female') {
                            tGender = '<i class="fas fa-female"></i>';
                            filters.Gender = 'Female';
                        }
                        let tCountry = '';
                        country == 'Món' ? tCountry = '<i class="fas fa-globe-americas"></i>' : tCountry = ` <b class="ml-2x">${country}</b>`;
                        title = titleTpl(trVar(varName), tGender, tCountry)

                        plot( getData4Chart(varName, filters, mode), title, chartType )
                    }
                })
            });
        })
    }, 0)

    setTimeout(function () { document.getElementById('loading-charts').style.display = 'none'; }, 0)


}

function titleTpl(varName, tGender, tCountry) {
    return`<div class="row title-chart">
                <div class="col-6 title">${varName}</div>
                <div class="col-6" style="text-align: right;">${tGender} ${tCountry}</div>
            </div>`;
}


function getData4Chart(varName, filters, mode) {
    if (mode === 'continuous') {
        return getContinuousVar4Chart(varName, filters);
    } else {
        return getCategoricalVar4Chart(varName, filters);
    }
}


function getCategoricalVar4Chart(varName, filters) {
    let total = 0;
    let d = {}
    dataset.forEach(ele => {
        // Possibles filtres
        let continuar = true;
        Object.keys(filters).forEach(flt => {
            let v = filters[flt]
            if (ele[flt] !== v) {
                continuar = false;
            }
        });
        if (!continuar) return;

        const v = ele[varName];
        if (v !== 'NA') {
            v.split(';').forEach(ev => {
                total++;
                if (!(ev in d)) {
                    d[ev] = 0;
                }
                d[ev]++;
            })
        }
    })

    let l = [];
    Object.keys(d).forEach(k => {
        l.push( { concept: k.replace(/\(.*\)/, ''), value: Math.round(d[k] / total * 1000)/10} );
    })
    return l;
}


function getContinuousVar4Chart(varName, filters) {
    let l = [];
    dataset.forEach(ele => {
        // Possibles filtres
        let continuar = true;
        Object.keys(filters).forEach(flt => {
            let v = filters[flt]
            if (ele[flt] !== v) {
                continuar = false;
            }
        });
        if (!continuar) return;

        const v = ele[varName];
        if (v !== 'NA') {
            l.push(parseFloat(v));
        }
    })
    return l;
}

function plot(data, title, mode) {
    if (mode === 'continuous') {
        histogramChart(data, title);
    } else {
        if (mode == 'vcategorical') {
            vbarsChart(data, title);
        } else {
            hbarsChart(data, title);
        }
    }
}

function histogramChart(data, title) {
    var margin = {top: 20, right: 10, bottom: 40, left: 40},
        width = 494 - margin.left - margin.right,
        height = 360 - margin.top - margin.bottom;

    const newId = 'chart-' + makeid(8);
    d3.select("#charts").append('div').attr('id', newId).attr('class', 'col-6 p-4x');
    d3.select("#" + newId).html( title )

    var svg = d3.select("#" + newId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return + d })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(20)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
        .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", randomColor())
        .style('opacity', '0.6')


    let mitja = d3.mean(data);
    var maxY = d3.max(bins.map(bin => bin.length));

    svg
        .append("line")
        .attr("x1", x(mitja) )
        .attr("x2", x(mitja) )
        .attr("y1", y(0))
        .attr("y2", y(maxY))
        .attr("stroke", "red")
        .style('stroke-width', "2")

    svg
        .append("text")
        .attr("x", x(mitja) + 10)
        .attr("y", y(maxY) + 14)
        .text("Mitja: " + fN(mitja))
        .style("font-size", "13px")
}


function hbarsChart(data, title) {
    data.sort(function (a, b) {
        return a.value > b.value ? -1 : 1;
    })

    // Mostrem fins a 15 conceptes
    data.splice(15);

    // set the dimensions and margins of the graph
    let maxConceptLength = 0;
    data.forEach(ele => {
        if (ele.concept.length > maxConceptLength) {
            maxConceptLength = ele.concept.length
        }
    })
    const marginLeft = maxConceptLength * 6;

    var margin = {top: 20, right: 10, bottom: 40, left: marginLeft},
        width = 494 - margin.left - margin.right,
        height = 360 - margin.top - margin.bottom;

    const newId = 'chart-' + makeid(8);
    d3.select("#charts").append('div').attr('id', newId).attr('class', 'col-6 p-4x');
    d3.select("#" + newId).html( title )

    var svg = d3.select("#" + newId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, d3.max(data.map(d => d.value)) ])
            .range([ 0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.concept; }))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.concept); })
            .attr("width", function(d) { return x(d.value); })
            .attr("height", y.bandwidth() )
            .attr("fill", randomColor())
            .style('opacity', '0.6')

}


function vbarsChart(data, title) {
    data.sort(function (a, b) {
        return a.value > b.value ? -1 : 1;
    })

    let maxConceptLength = 0;
    data.forEach(ele => {
        if (ele.concept.length > maxConceptLength) {
            maxConceptLength = ele.concept.length
        }
    })


    var margin = {top: 20, right: 30, bottom: 40 + maxConceptLength * 4, left: 20},
        width = 494 - margin.left - margin.right,
        height = (360 + maxConceptLength * 4) - margin.top - margin.bottom;

    const newId = 'chart-' + makeid(8);
    d3.select("#charts").append('div').attr('id', newId).attr('class', 'col-6 p-4x');
    d3.select("#" + newId).html( title )

    var svg = d3.select("#" + newId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.concept; }))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data.map(d => d.value)) ])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.concept); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.value); })
            .attr("fill", "#69b3a2")

}