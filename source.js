function fN(n) {
    // var formatValue = d3.format("0,000");
    return (Math.round(n*10)/10).toString()
        .replace(",", ";")
        .replace(".", ",")
        .replace(";", ".")
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
    .scale(140);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

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
    drawMap()
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
    // Dibuixar mapa i gràfiques
    drawMap();
    drawCharts();
}


function drawCharts() {
    document.getElementById('charts').innerHTML = '';

    // console.log(selectedCountries)
    drawChart('LanguageWorkedWith');
    drawChart('LanguageDesireNextYear');
    drawChart('DatabaseWorkedWith');
    drawChart('DatabaseDesireNextYear');
    drawChart('PlatformWorkedWith');
    drawChart('PlatformDesireNextYear');
    drawChart('FrameworkWorkedWith');
    drawChart('FrameworkDesireNextYear');
    drawChart('DevType');
    drawChart('CompanySize');
    drawChart('FormalEducation');
}


function getData4Chart(varName) {
    let total = 0;
    let d = {}
    dataset.forEach(ele => {
        // Possibles filtres
        if (selectedCountries.length > 0) {
            if (!selectedCountries.includes(ele.Country)) {
                return;
            }
        }

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
        l.push( { concept: k, value: Math.round(d[k] / total * 1000)/10} );
    })
    return l;
}


function drawChart(varName) {
    let data = getData4Chart(varName);
    data.sort(function (a, b) {
        return a.value > b.value ? -1 : 1;
    })

    // MOstrem fins a 15 conceptes
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
        width = 510 - margin.left - margin.right,
        height = 360 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#charts")
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
            .attr("fill", "#69b3a2")

}
